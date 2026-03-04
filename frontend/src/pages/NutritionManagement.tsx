import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, InputNumber } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import client from '../api/client';

interface GrowthRecordDto { id: string; childName: string; dateOfBirth: string; gender: number; measureDate: string; ageMonths: number; weight: number; height: number; weightForAge?: string; heightForAge?: string; bmi?: number; status: string; note?: string; }

export default function NutritionManagement() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<GrowthRecordDto[]>([]);
  const [recordModal, setRecordModal] = useState(false);
  const [form] = Form.useForm();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try { const res = await client.get('/nutrition-management/growth-records', { params: { pageSize: 30 } }); setRecords((res.data as { items: GrowthRecordDto[] }).items || []); } catch { setRecords([]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleCreate = async (values: Record<string, unknown>) => {
    try {
      await client.post('/nutrition-management/growth-records', {
        childName: values.childName, dateOfBirth: (values.dateOfBirth as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        gender: values.gender, measureDate: (values.measureDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        weight: values.weight, height: values.height, note: values.note,
      });
      message.success('Ghi nhan thanh cong'); setRecordModal(false); form.resetFields(); fetchRecords();
    } catch { message.warning('Loi ghi nhan'); }
  };

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'monitoring', label: 'Theo doi tang truong',
          children: (
            <Card extra={<Space><Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setRecordModal(true); }}>Ghi nhan</Button><Button icon={<ReloadOutlined />} onClick={fetchRecords} /></Space>}>
              <Table dataSource={records} rowKey="id" size="small" pagination={{ pageSize: 30 }} columns={[
                { title: 'Ho ten', dataIndex: 'childName', width: 150 },
                { title: 'Ngay sinh', dataIndex: 'dateOfBirth', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                { title: 'Tuoi (thang)', dataIndex: 'ageMonths', width: 80 },
                { title: 'Can (kg)', dataIndex: 'weight', width: 70 },
                { title: 'Cao (cm)', dataIndex: 'height', width: 70 },
                { title: 'CN/T', dataIndex: 'weightForAge', width: 60 },
                { title: 'CC/T', dataIndex: 'heightForAge', width: 60 },
                { title: 'Tinh trang', dataIndex: 'status', width: 100, render: (v: string) => v === 'normal' ? <Tag color="green">Binh thuong</Tag> : v === 'underweight' ? <Tag color="orange">SDD nhe</Tag> : v === 'severe' ? <Tag color="red">SDD nang</Tag> : <Tag>{v}</Tag> },
                { title: 'Ngay do', dataIndex: 'measureDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
              ]} scroll={{ x: 860 }} />
            </Card>
          ),
        },
        { key: 'reports', label: 'Bao cao', children: <Card title="Bao cao phong chong suy dinh duong"><Space><Button>Bao cao quy</Button><Button>Bao cao nam</Button></Space></Card> },
      ]} />
      <Modal title="Ghi nhan can do" open={recordModal} onCancel={() => setRecordModal(false)} onOk={() => form.submit()} okText="Luu">
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="childName" label="Ho ten tre" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="dateOfBirth" label="Ngay sinh" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="gender" label="Gioi tinh"><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nu' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="measureDate" label="Ngay do" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="weight" label="Can nang (kg)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} step={0.1} min={0} /></Form.Item></Col>
            <Col span={12}><Form.Item name="height" label="Chieu cao (cm)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} step={0.1} min={0} /></Form.Item></Col>
          </Row>
          <Form.Item name="note" label="Ghi chu"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
