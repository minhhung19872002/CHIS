import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, InputNumber, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import client from '../api/client';

interface VitaminARecordDto {
  id: string; childName: string; dateOfBirth: string; gender: number; ageMonths: number;
  doseType: string; administeredDate: string; batchNumber: string; administeredBy: string; note?: string;
}
interface VitaminAPlanDto {
  id: string; campaignName: string; targetMonth: number; targetYear: number;
  targetCount: number; completedCount: number; status: string;
}

export default function VitaminA() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<VitaminARecordDto[]>([]);
  const [total, setTotal] = useState(0);
  const [plans, setPlans] = useState<VitaminAPlanDto[]>([]);
  const [keyword, setKeyword] = useState('');
  const [recordModal, setRecordModal] = useState(false);
  const [editing, setEditing] = useState<VitaminARecordDto | null>(null);
  const [form] = Form.useForm();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('/vitamin-a/records', { params: { keyword, pageSize: 30 } });
      const d = res.data as { items: VitaminARecordDto[]; total: number };
      setRecords(d.items || []);
      setTotal(d.total || 0);
    } catch { setRecords([]); } finally { setLoading(false); }
  }, [keyword]);

  const fetchPlans = useCallback(async () => {
    try { const res = await client.get('/vitamin-a/plans'); setPlans(res.data as VitaminAPlanDto[]); } catch { setPlans([]); }
  }, []);

  useEffect(() => { fetchRecords(); fetchPlans(); }, [fetchRecords, fetchPlans]);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      const data = {
        childName: values.childName, dateOfBirth: (values.dateOfBirth as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        gender: values.gender, doseType: values.doseType,
        administeredDate: (values.administeredDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        batchNumber: values.batchNumber, administeredBy: values.administeredBy, note: values.note,
      };
      if (editing) {
        await client.put(`/vitamin-a/records/${editing.id}`, data);
        message.success('Cập nhật thành công');
      } else {
        await client.post('/vitamin-a/records', data);
        message.success('Ghi nhận thành công');
      }
      setRecordModal(false); form.resetFields(); setEditing(null); fetchRecords();
    } catch { message.warning('Lỗi lưu dữ liệu'); }
  };

  const handleEdit = (record: VitaminARecordDto) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : undefined,
      administeredDate: record.administeredDate ? dayjs(record.administeredDate) : undefined,
    });
    setRecordModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await client.delete(`/vitamin-a/records/${id}`);
      message.success('Xóa thành công');
      fetchRecords();
    } catch { message.warning('Lỗi xóa'); }
  };

  const recordColumns: ColumnsType<VitaminARecordDto> = [
    { title: 'Họ tên', dataIndex: 'childName', width: 150 },
    { title: 'Ngày sinh', dataIndex: 'dateOfBirth', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Tuổi (tháng)', dataIndex: 'ageMonths', width: 85, align: 'right' },
    { title: 'Liều', dataIndex: 'doseType', width: 100 },
    { title: 'Ngày uống', dataIndex: 'administeredDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Lô', dataIndex: 'batchNumber', width: 80 },
    { title: 'Người cho', dataIndex: 'administeredBy', width: 120 },
    {
      title: '', width: 80, fixed: 'right',
      render: (_: unknown, r: VitaminARecordDto) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          <Popconfirm title="Xóa bản ghi này?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const planColumns: ColumnsType<VitaminAPlanDto> = [
    { title: 'Chiến dịch', dataIndex: 'campaignName' },
    { title: 'Tháng', dataIndex: 'targetMonth', width: 60, align: 'right' },
    { title: 'Năm', dataIndex: 'targetYear', width: 60, align: 'right' },
    { title: 'Mục tiêu', dataIndex: 'targetCount', width: 80, align: 'right' },
    { title: 'Đã thực hiện', dataIndex: 'completedCount', width: 90, align: 'right' },
    { title: 'Tỷ lệ', width: 80, align: 'right', render: (_: unknown, r: VitaminAPlanDto) => r.targetCount > 0 ? `${Math.round(r.completedCount / r.targetCount * 100)}%` : '-' },
    { title: 'Trạng thái', dataIndex: 'status', width: 100, render: (v: string) => <Tag color={v === 'done' ? 'green' : 'blue'}>{v === 'done' ? 'Hoàn thành' : 'Đang thực hiện'}</Tag> },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'records', label: 'Cho uống Vitamin A',
          children: (
            <Card extra={
              <Space>
                <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchRecords()} style={{ width: 200 }} allowClear />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setRecordModal(true); }}>Ghi nhận</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchRecords} />
              </Space>
            }>
              <Table columns={recordColumns} dataSource={records} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 900 }} />
            </Card>
          ),
        },
        {
          key: 'plans', label: 'Kế hoạch',
          children: (
            <Card extra={<Button icon={<ReloadOutlined />} onClick={fetchPlans} />}>
              <Table columns={planColumns} dataSource={plans} rowKey="id" size="small" pagination={false} />
            </Card>
          ),
        },
        {
          key: 'reports', label: 'Báo cáo',
          children: (
            <Card title="Báo cáo Vitamin A">
              <Space>
                <DatePicker picker="year" placeholder="Chọn năm" />
                <Button type="primary">Xuất báo cáo</Button>
              </Space>
            </Card>
          ),
        },
      ]} />

      <Modal title={editing ? 'Sửa bản ghi Vitamin A' : 'Ghi nhận cho uống Vitamin A'} open={recordModal} onCancel={() => setRecordModal(false)} onOk={() => form.submit()} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="childName" label="Họ tên trẻ" rules={[{ required: true, message: 'Nhập họ tên' }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="dateOfBirth" label="Ngày sinh" rules={[{ required: true, message: 'Chọn ngày sinh' }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="gender" label="Giới tính"><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nữ' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="doseType" label="Liều" rules={[{ required: true, message: 'Chọn liều' }]}><Select options={[{ value: '100000IU', label: '100.000 IU' }, { value: '200000IU', label: '200.000 IU' }]} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="administeredDate" label="Ngày uống" rules={[{ required: true, message: 'Chọn ngày' }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="batchNumber" label="Số lô"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="administeredBy" label="Người cho" rules={[{ required: true, message: 'Nhập người cho' }]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
