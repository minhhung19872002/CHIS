import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, InputNumber } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import client from '../api/client';

interface VitaminARecordDto { id: string; childName: string; dateOfBirth: string; gender: number; ageMonths: number; doseType: string; administeredDate: string; batchNumber: string; administeredBy: string; note?: string; }
interface VitaminAPlanDto { id: string; campaignName: string; targetMonth: number; targetYear: number; targetCount: number; completedCount: number; status: string; }

export default function VitaminA() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<VitaminARecordDto[]>([]);
  const [plans, setPlans] = useState<VitaminAPlanDto[]>([]);
  const [recordModal, setRecordModal] = useState(false);
  const [form] = Form.useForm();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try { const res = await client.get('/vitamin-a/records', { params: { pageSize: 30 } }); setRecords((res.data as { items: VitaminARecordDto[] }).items || []); } catch { setRecords([]); } finally { setLoading(false); }
  }, []);
  const fetchPlans = useCallback(async () => {
    try { const res = await client.get('/vitamin-a/plans'); setPlans(res.data as VitaminAPlanDto[]); } catch { setPlans([]); }
  }, []);
  useEffect(() => { fetchRecords(); fetchPlans(); }, [fetchRecords, fetchPlans]);

  const handleCreate = async (values: Record<string, unknown>) => {
    try {
      await client.post('/vitamin-a/records', {
        childName: values.childName, dateOfBirth: (values.dateOfBirth as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        gender: values.gender, doseType: values.doseType,
        administeredDate: (values.administeredDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        batchNumber: values.batchNumber, administeredBy: values.administeredBy,
      });
      message.success('Ghi nhan thanh cong'); setRecordModal(false); form.resetFields(); fetchRecords();
    } catch { message.warning('Loi ghi nhan'); }
  };

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'records', label: 'Cho uong Vitamin A',
          children: (
            <Card extra={<Space><Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setRecordModal(true); }}>Ghi nhan</Button><Button icon={<ReloadOutlined />} onClick={fetchRecords} /></Space>}>
              <Table dataSource={records} rowKey="id" size="small" pagination={{ pageSize: 30 }} columns={[
                { title: 'Ho ten', dataIndex: 'childName', width: 150 },
                { title: 'Ngay sinh', dataIndex: 'dateOfBirth', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                { title: 'Tuoi (thang)', dataIndex: 'ageMonths', width: 80 },
                { title: 'Lieu', dataIndex: 'doseType', width: 100 },
                { title: 'Ngay uong', dataIndex: 'administeredDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                { title: 'Lo', dataIndex: 'batchNumber', width: 80 },
                { title: 'Nguoi cho', dataIndex: 'administeredBy', width: 120 },
              ]} scroll={{ x: 740 }} />
            </Card>
          ),
        },
        {
          key: 'plans', label: 'Ke hoach',
          children: <Card><Table dataSource={plans} rowKey="id" size="small" pagination={false} columns={[
            { title: 'Chien dich', dataIndex: 'campaignName' },
            { title: 'Thang', dataIndex: 'targetMonth', width: 60 },
            { title: 'Nam', dataIndex: 'targetYear', width: 60 },
            { title: 'Muc tieu', dataIndex: 'targetCount', width: 80 },
            { title: 'Da thuc hien', dataIndex: 'completedCount', width: 80 },
            { title: 'Trang thai', dataIndex: 'status', width: 100, render: (v: string) => <Tag color={v === 'done' ? 'green' : 'blue'}>{v}</Tag> },
          ]} /></Card>,
        },
        { key: 'reports', label: 'Bao cao', children: <Card title="Bao cao Vitamin A"><Button type="primary">Xuat bao cao</Button></Card> },
      ]} />
      <Modal title="Ghi nhan cho uong Vitamin A" open={recordModal} onCancel={() => setRecordModal(false)} onOk={() => form.submit()} okText="Luu">
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="childName" label="Ho ten tre" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="dateOfBirth" label="Ngay sinh" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="gender" label="Gioi tinh"><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nu' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="doseType" label="Lieu" rules={[{ required: true }]}><Select options={[{ value: '100000IU', label: '100,000 IU' }, { value: '200000IU', label: '200,000 IU' }]} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="administeredDate" label="Ngay uong" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="batchNumber" label="So lo"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="administeredBy" label="Nguoi cho" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </Spin>
  );
}
