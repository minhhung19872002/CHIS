import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Input, Space, Form, Row, Col, DatePicker, Select, InputNumber } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import client from '../api/client';

interface CampaignDto { id: string; title: string; campaignDate: string; location: string; topic: string; targetAudience: string; participantCount: number; facilitator: string; method: string; materials: string; status: string; note?: string; }

export default function HealthEducation() {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [form] = Form.useForm();

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try { const res = await client.get('/health-education/campaigns', { params: { pageSize: 30 } }); const d = res.data as { items: CampaignDto[]; total: number }; setCampaigns(d.items || []); setTotal(d.total || 0); } catch { setCampaigns([]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleCreate = async (values: Record<string, unknown>) => {
    try {
      await client.post('/health-education/campaigns', {
        title: values.title, campaignDate: (values.campaignDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        location: values.location, topic: values.topic, targetAudience: values.targetAudience,
        participantCount: values.participantCount, facilitator: values.facilitator,
        method: values.method, materials: values.materials,
      });
      message.success('Tao hoat dong thanh cong'); setModal(false); form.resetFields(); fetchCampaigns();
    } catch { message.warning('Loi tao hoat dong'); }
  };

  return (
    <Spin spinning={loading}>
      <Card title="Truyen thong giao duc suc khoe" extra={<Space><Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal(true); }}>Them</Button><Button icon={<ReloadOutlined />} onClick={fetchCampaigns} /></Space>}>
        <Table dataSource={campaigns} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} columns={[
          { title: 'Ten hoat dong', dataIndex: 'title', width: 200 },
          { title: 'Ngay', dataIndex: 'campaignDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
          { title: 'Dia diem', dataIndex: 'location', width: 150 },
          { title: 'Chu de', dataIndex: 'topic', width: 120 },
          { title: 'Doi tuong', dataIndex: 'targetAudience', width: 120 },
          { title: 'So nguoi', dataIndex: 'participantCount', width: 70 },
          { title: 'Hinh thuc', dataIndex: 'method', width: 100 },
          { title: 'Trang thai', dataIndex: 'status', width: 90, render: (v: string) => <Tag color={v === 'done' ? 'green' : 'blue'}>{v === 'done' ? 'Da thuc hien' : 'Ke hoach'}</Tag> },
        ]} scroll={{ x: 950 }} />
      </Card>
      <Modal title="Them hoat dong TTGDSK" open={modal} onCancel={() => setModal(false)} onOk={() => form.submit()} okText="Luu" width={600}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="Ten hoat dong" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="campaignDate" label="Ngay" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="location" label="Dia diem" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="topic" label="Chu de" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="targetAudience" label="Doi tuong"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="participantCount" label="So nguoi"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={8}><Form.Item name="facilitator" label="Nguoi thuc hien"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="method" label="Hinh thuc"><Select options={[{ value: 'Noi chuyen', label: 'Noi chuyen' }, { value: 'Hoi thao', label: 'Hoi thao' }, { value: 'Phat to roi', label: 'Phat to roi' }, { value: 'Truyen thong', label: 'Truyen thong' }]} /></Form.Item></Col>
          </Row>
          <Form.Item name="materials" label="Tai lieu"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
