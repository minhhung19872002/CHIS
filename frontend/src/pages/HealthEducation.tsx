import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Input, Space, Form, Row, Col, DatePicker, Select, InputNumber, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import client from '../api/client';

interface CampaignDto {
  id: string; title: string; campaignDate: string; location: string; topic: string;
  targetAudience: string; participantCount: number; facilitator: string; method: string;
  materials: string; status: string; note?: string;
}

export default function HealthEducation() {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<CampaignDto | null>(null);
  const [form] = Form.useForm();

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('/health-education/campaigns', { params: { keyword, pageSize: 30 } });
      const d = res.data as { items: CampaignDto[]; total: number };
      setCampaigns(d.items || []);
      setTotal(d.total || 0);
    } catch { setCampaigns([]); } finally { setLoading(false); }
  }, [keyword]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      const data = {
        title: values.title, campaignDate: (values.campaignDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        location: values.location, topic: values.topic, targetAudience: values.targetAudience,
        participantCount: values.participantCount, facilitator: values.facilitator,
        method: values.method, materials: values.materials,
      };
      if (editing) {
        await client.put(`/health-education/campaigns/${editing.id}`, data);
        message.success('Cập nhật thành công');
      } else {
        await client.post('/health-education/campaigns', data);
        message.success('Tạo hoạt động thành công');
      }
      setModal(false); form.resetFields(); setEditing(null); fetchCampaigns();
    } catch { message.warning('Lỗi lưu dữ liệu'); }
  };

  const handleEdit = (record: CampaignDto) => {
    setEditing(record);
    form.setFieldsValue({ ...record, campaignDate: record.campaignDate ? dayjs(record.campaignDate) : undefined });
    setModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await client.delete(`/health-education/campaigns/${id}`);
      message.success('Xóa thành công');
      fetchCampaigns();
    } catch { message.warning('Lỗi xóa'); }
  };

  const columns: ColumnsType<CampaignDto> = [
    { title: 'Tên hoạt động', dataIndex: 'title', width: 200 },
    { title: 'Ngày', dataIndex: 'campaignDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Địa điểm', dataIndex: 'location', width: 150 },
    { title: 'Chủ đề', dataIndex: 'topic', width: 120 },
    { title: 'Đối tượng', dataIndex: 'targetAudience', width: 120 },
    { title: 'Số người', dataIndex: 'participantCount', width: 70, align: 'right' },
    { title: 'Hình thức', dataIndex: 'method', width: 100 },
    { title: 'Trạng thái', dataIndex: 'status', width: 100, render: (v: string) => <Tag color={v === 'done' ? 'green' : 'blue'}>{v === 'done' ? 'Đã thực hiện' : 'Kế hoạch'}</Tag> },
    {
      title: '', width: 80, fixed: 'right',
      render: (_: unknown, r: CampaignDto) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          <Popconfirm title="Xóa hoạt động này?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Card
        title="Truyền thông giáo dục sức khỏe"
        extra={
          <Space>
            <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchCampaigns()} style={{ width: 200 }} allowClear />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModal(true); }}>Thêm</Button>
            <Button icon={<ReloadOutlined />} onClick={fetchCampaigns} />
          </Space>
        }
      >
        <Table columns={columns} dataSource={campaigns} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 1050 }} />
      </Card>

      <Modal title={editing ? 'Sửa hoạt động TTGDSK' : 'Thêm hoạt động TTGDSK'} open={modal} onCancel={() => setModal(false)} onOk={() => form.submit()} okText="Lưu" cancelText="Hủy" width={600}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="title" label="Tên hoạt động" rules={[{ required: true, message: 'Nhập tên hoạt động' }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="campaignDate" label="Ngày" rules={[{ required: true, message: 'Chọn ngày' }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="location" label="Địa điểm" rules={[{ required: true, message: 'Nhập địa điểm' }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="topic" label="Chủ đề" rules={[{ required: true, message: 'Nhập chủ đề' }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="targetAudience" label="Đối tượng"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="participantCount" label="Số người tham gia"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={8}><Form.Item name="facilitator" label="Người thực hiện"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="method" label="Hình thức"><Select options={[{ value: 'Nói chuyện', label: 'Nói chuyện' }, { value: 'Hội thảo', label: 'Hội thảo' }, { value: 'Phát tờ rơi', label: 'Phát tờ rơi' }, { value: 'Truyền thông', label: 'Truyền thông' }]} /></Form.Item></Col>
          </Row>
          <Form.Item name="materials" label="Tài liệu"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
