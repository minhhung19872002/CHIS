import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, InputNumber } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import client from '../api/client';

interface DeathRecordDto { id: string; deceasedName: string; dateOfDeath: string; age: number; gender: number; address: string; causeOfDeath: string; icdCode: string; deathPlace: string; classification: string; reporterName: string; note?: string; }

export default function DeathTracking() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<DeathRecordDto[]>([]);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [form] = Form.useForm();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try { const res = await client.get('/death-tracking/records', { params: { year: dayjs().year(), pageSize: 30 } }); const d = res.data as { items: DeathRecordDto[]; total: number }; setRecords(d.items || []); setTotal(d.total || 0); } catch { setRecords([]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleCreate = async (values: Record<string, unknown>) => {
    try {
      await client.post('/death-tracking/records', {
        deceasedName: values.deceasedName, dateOfDeath: (values.dateOfDeath as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        age: values.age, gender: values.gender, address: values.address,
        causeOfDeath: values.causeOfDeath, icdCode: values.icdCode,
        deathPlace: values.deathPlace, classification: values.classification,
        reporterName: values.reporterName, note: values.note,
      });
      message.success('Ghi nhan thanh cong'); setModal(false); form.resetFields(); fetchRecords();
    } catch { message.warning('Loi ghi nhan'); }
  };

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'records', label: 'Ghi nhan tu vong',
          children: (
            <Card extra={<Space><Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal(true); }}>Ghi nhan</Button><Button icon={<ReloadOutlined />} onClick={fetchRecords} /></Space>}>
              <Table dataSource={records} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} columns={[
                { title: 'Ho ten', dataIndex: 'deceasedName', width: 140 },
                { title: 'Ngay mat', dataIndex: 'dateOfDeath', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                { title: 'Tuoi', dataIndex: 'age', width: 50 },
                { title: 'Gioi', dataIndex: 'gender', width: 50, render: (v: number) => v === 1 ? 'Nam' : 'Nu' },
                { title: 'Nguyen nhan', dataIndex: 'causeOfDeath' },
                { title: 'ICD', dataIndex: 'icdCode', width: 70 },
                { title: 'Noi mat', dataIndex: 'deathPlace', width: 100 },
                { title: 'Phan loai', dataIndex: 'classification', width: 100 },
              ]} scroll={{ x: 760 }} />
            </Card>
          ),
        },
        {
          key: 'report', label: 'Bao cao A6/YTCS',
          children: <Card title="Bao cao tu vong A6/YTCS"><DatePicker picker="year" style={{ marginRight: 12 }} /><Button type="primary">Xuat bao cao</Button></Card>,
        },
      ]} />
      <Modal title="Ghi nhan tu vong" open={modal} onCancel={() => setModal(false)} onOk={() => form.submit()} okText="Luu" width={600}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="deceasedName" label="Ho ten nguoi mat" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="dateOfDeath" label="Ngay mat" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="age" label="Tuoi" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={8}><Form.Item name="gender" label="Gioi tinh" rules={[{ required: true }]}><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nu' }]} /></Form.Item></Col>
          </Row>
          <Form.Item name="address" label="Dia chi" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="causeOfDeath" label="Nguyen nhan tu vong" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="icdCode" label="Ma ICD"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="deathPlace" label="Noi mat" rules={[{ required: true }]}><Select options={[{ value: 'Benh vien', label: 'Benh vien' }, { value: 'Tram y te', label: 'Tram y te' }, { value: 'Nha', label: 'Tai nha' }, { value: 'Khac', label: 'Khac' }]} /></Form.Item></Col>
            <Col span={12}><Form.Item name="classification" label="Phan loai"><Select options={[{ value: 'Benh', label: 'Do benh' }, { value: 'TNTT', label: 'TNTT' }, { value: 'Khac', label: 'Khac' }]} /></Form.Item></Col>
          </Row>
          <Form.Item name="reporterName" label="Nguoi bao cao" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="note" label="Ghi chu"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
