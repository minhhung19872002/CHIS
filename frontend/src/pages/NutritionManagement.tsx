import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, InputNumber, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import client from '../api/client';

interface GrowthRecordDto {
  id: string; childName: string; dateOfBirth: string; gender: number; measureDate: string;
  ageMonths: number; weight: number; height: number; weightForAge?: string; heightForAge?: string;
  bmi?: number; status: string; note?: string;
}

export default function NutritionManagement() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<GrowthRecordDto[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [recordModal, setRecordModal] = useState(false);
  const [editing, setEditing] = useState<GrowthRecordDto | null>(null);
  const [form] = Form.useForm();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('/nutrition-management/growth-records', { params: { keyword, pageSize: 30 } });
      const d = res.data as { items: GrowthRecordDto[]; total: number };
      setRecords(d.items || []);
      setTotal(d.total || 0);
    } catch { setRecords([]); } finally { setLoading(false); }
  }, [keyword]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      const data = {
        childName: values.childName, dateOfBirth: (values.dateOfBirth as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        gender: values.gender, measureDate: (values.measureDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        weight: values.weight, height: values.height, note: values.note,
      };
      if (editing) {
        await client.put(`/nutrition-management/growth-records/${editing.id}`, data);
        message.success('Cập nhật thành công');
      } else {
        await client.post('/nutrition-management/growth-records', data);
        message.success('Ghi nhận thành công');
      }
      setRecordModal(false); form.resetFields(); setEditing(null); fetchRecords();
    } catch { message.warning('Lỗi lưu dữ liệu'); }
  };

  const handleEdit = (record: GrowthRecordDto) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : undefined,
      measureDate: record.measureDate ? dayjs(record.measureDate) : undefined,
    });
    setRecordModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await client.delete(`/nutrition-management/growth-records/${id}`);
      message.success('Xóa thành công');
      fetchRecords();
    } catch { message.warning('Lỗi xóa'); }
  };

  const columns: ColumnsType<GrowthRecordDto> = [
    { title: 'Họ tên', dataIndex: 'childName', width: 150 },
    { title: 'Ngày sinh', dataIndex: 'dateOfBirth', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Tuổi (tháng)', dataIndex: 'ageMonths', width: 80, align: 'right' },
    { title: 'Cân (kg)', dataIndex: 'weight', width: 70, align: 'right' },
    { title: 'Cao (cm)', dataIndex: 'height', width: 70, align: 'right' },
    { title: 'CN/T', dataIndex: 'weightForAge', width: 60 },
    { title: 'CC/T', dataIndex: 'heightForAge', width: 60 },
    { title: 'Tình trạng', dataIndex: 'status', width: 110, render: (v: string) => v === 'normal' ? <Tag color="green">Bình thường</Tag> : v === 'underweight' ? <Tag color="orange">SDD nhẹ</Tag> : v === 'severe' ? <Tag color="red">SDD nặng</Tag> : <Tag>{v}</Tag> },
    { title: 'Ngày đo', dataIndex: 'measureDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    {
      title: '', width: 80, fixed: 'right',
      render: (_: unknown, r: GrowthRecordDto) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          <Popconfirm title="Xóa bản ghi này?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'monitoring', label: 'Theo dõi tăng trưởng',
          children: (
            <Card extra={
              <Space>
                <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchRecords()} style={{ width: 200 }} allowClear />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setRecordModal(true); }}>Ghi nhận</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchRecords} />
              </Space>
            }>
              <Table columns={columns} dataSource={records} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 960 }} />
            </Card>
          ),
        },
        {
          key: 'reports', label: 'Báo cáo',
          children: (
            <Card title="Báo cáo phòng chống suy dinh dưỡng">
              <Space>
                <DatePicker picker="quarter" placeholder="Chọn quý" />
                <Button type="primary">Báo cáo quý</Button>
                <DatePicker picker="year" placeholder="Chọn năm" />
                <Button>Báo cáo năm</Button>
              </Space>
            </Card>
          ),
        },
      ]} />

      <Modal title={editing ? 'Sửa bản ghi cân đo' : 'Ghi nhận cân đo'} open={recordModal} onCancel={() => setRecordModal(false)} onOk={() => form.submit()} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="childName" label="Họ tên trẻ" rules={[{ required: true, message: 'Nhập họ tên' }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="dateOfBirth" label="Ngày sinh" rules={[{ required: true, message: 'Chọn ngày sinh' }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="gender" label="Giới tính"><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nữ' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="measureDate" label="Ngày đo" rules={[{ required: true, message: 'Chọn ngày đo' }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="weight" label="Cân nặng (kg)" rules={[{ required: true, message: 'Nhập cân nặng' }]}><InputNumber style={{ width: '100%' }} step={0.1} min={0} /></Form.Item></Col>
            <Col span={12}><Form.Item name="height" label="Chiều cao (cm)" rules={[{ required: true, message: 'Nhập chiều cao' }]}><InputNumber style={{ width: '100%' }} step={0.1} min={0} /></Form.Item></Col>
          </Row>
          <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
