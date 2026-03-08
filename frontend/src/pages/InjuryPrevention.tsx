import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Input, Space, Form, Row, Col, DatePicker, Select, Popconfirm, Tabs } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import client from '../api/client';

interface InjuryRecordDto {
  id: string; patientName: string; dateOfBirth: string; gender: number; address: string;
  injuryDate: string; injuryType: string; location: string; cause: string; severity: string;
  outcome: string; hospitalized: boolean; reportedBy: string; note?: string;
}

const INJURY_TYPES = [
  { value: 'traffic', label: 'Tai nạn giao thông' },
  { value: 'fall', label: 'Té ngã' },
  { value: 'drowning', label: 'Đuối nước' },
  { value: 'burn', label: 'Bỏng' },
  { value: 'poisoning', label: 'Ngộ độc' },
  { value: 'animal', label: 'Động vật cắn' },
  { value: 'violence', label: 'Bạo lực' },
  { value: 'occupational', label: 'Tai nạn lao động' },
  { value: 'other', label: 'Khác' },
];

export default function InjuryPrevention() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<InjuryRecordDto[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<InjuryRecordDto | null>(null);
  const [form] = Form.useForm();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('/injury-prevention/records', { params: { keyword, pageSize: 30 } });
      const d = res.data as { items: InjuryRecordDto[]; total: number };
      setRecords(d.items || []);
      setTotal(d.total || 0);
    } catch { setRecords([]); } finally { setLoading(false); }
  }, [keyword]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      const data = {
        patientName: values.patientName, dateOfBirth: (values.dateOfBirth as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        gender: values.gender, address: values.address,
        injuryDate: (values.injuryDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        injuryType: values.injuryType, location: values.location, cause: values.cause,
        severity: values.severity, outcome: values.outcome, hospitalized: values.hospitalized,
        reportedBy: values.reportedBy, note: values.note,
      };
      if (editing) {
        await client.put(`/injury-prevention/records/${editing.id}`, data);
        message.success('Cập nhật thành công');
      } else {
        await client.post('/injury-prevention/records', data);
        message.success('Ghi nhận thành công');
      }
      setModal(false); form.resetFields(); setEditing(null); fetchRecords();
    } catch { message.warning('Lỗi lưu dữ liệu'); }
  };

  const handleEdit = (record: InjuryRecordDto) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : undefined,
      injuryDate: record.injuryDate ? dayjs(record.injuryDate) : undefined,
    });
    setModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await client.delete(`/injury-prevention/records/${id}`);
      message.success('Xóa thành công');
      fetchRecords();
    } catch { message.warning('Lỗi xóa'); }
  };

  const columns: ColumnsType<InjuryRecordDto> = [
    { title: 'Họ tên', dataIndex: 'patientName', width: 140 },
    { title: 'Ngày', dataIndex: 'injuryDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Loại', dataIndex: 'injuryType', width: 120, render: (v: string) => INJURY_TYPES.find(t => t.value === v)?.label || v },
    { title: 'Nguyên nhân', dataIndex: 'cause', width: 150 },
    { title: 'Mức độ', dataIndex: 'severity', width: 90, render: (v: string) => v === 'severe' ? <Tag color="red">Nặng</Tag> : v === 'moderate' ? <Tag color="orange">Trung bình</Tag> : <Tag color="green">Nhẹ</Tag> },
    { title: 'Kết quả', dataIndex: 'outcome', width: 80 },
    { title: 'Nhập viện', dataIndex: 'hospitalized', width: 75, render: (v: boolean) => v ? <Tag color="red">Có</Tag> : <Tag>Không</Tag> },
    { title: 'Địa điểm', dataIndex: 'location', width: 120 },
    {
      title: '', width: 80, fixed: 'right',
      render: (_: unknown, r: InjuryRecordDto) => (
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
          key: 'records', label: 'Ghi nhận TNTT',
          children: (
            <Card extra={
              <Space>
                <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchRecords()} style={{ width: 200 }} allowClear />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModal(true); }}>Ghi nhận</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchRecords} />
              </Space>
            }>
              <Table columns={columns} dataSource={records} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 1050 }} />
            </Card>
          ),
        },
        {
          key: 'reports', label: 'Báo cáo',
          children: (
            <Card title="Báo cáo phòng chống tai nạn thương tích">
              <Space>
                <DatePicker picker="year" placeholder="Chọn năm" />
                <Button type="primary">Xuất báo cáo</Button>
              </Space>
            </Card>
          ),
        },
      ]} />

      <Modal title={editing ? 'Sửa bản ghi TNTT' : 'Ghi nhận TNTT'} open={modal} onCancel={() => setModal(false)} onOk={() => form.submit()} okText="Lưu" cancelText="Hủy" width={600}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="patientName" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="dateOfBirth" label="Ngày sinh"><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="gender" label="Giới tính"><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nữ' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="injuryDate" label="Ngày TNTT" rules={[{ required: true, message: 'Chọn ngày' }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="injuryType" label="Loại TNTT" rules={[{ required: true, message: 'Chọn loại' }]}><Select options={INJURY_TYPES} /></Form.Item></Col>
            <Col span={8}><Form.Item name="severity" label="Mức độ" rules={[{ required: true, message: 'Chọn mức độ' }]}><Select options={[{ value: 'mild', label: 'Nhẹ' }, { value: 'moderate', label: 'Trung bình' }, { value: 'severe', label: 'Nặng' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="outcome" label="Kết quả"><Select options={[{ value: 'Khỏi', label: 'Khỏi' }, { value: 'Di chứng', label: 'Di chứng' }, { value: 'Tử vong', label: 'Tử vong' }]} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="cause" label="Nguyên nhân" rules={[{ required: true, message: 'Nhập nguyên nhân' }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="location" label="Địa điểm xảy ra"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="reportedBy" label="Người báo cáo" rules={[{ required: true, message: 'Nhập người báo cáo' }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="hospitalized" label="Nhập viện"><Select options={[{ value: true, label: 'Có' }, { value: false, label: 'Không' }]} /></Form.Item></Col>
          </Row>
          <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
