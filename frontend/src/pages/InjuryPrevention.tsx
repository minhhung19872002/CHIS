import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Input, Space, Form, Row, Col, DatePicker, Select } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import client from '../api/client';

interface InjuryRecordDto { id: string; patientName: string; dateOfBirth: string; gender: number; address: string; injuryDate: string; injuryType: string; location: string; cause: string; severity: string; outcome: string; hospitalized: boolean; reportedBy: string; note?: string; }

const INJURY_TYPES = [
  { value: 'traffic', label: 'TNGT' }, { value: 'fall', label: 'Te nga' },
  { value: 'drowning', label: 'Duoi nuoc' }, { value: 'burn', label: 'Bong' },
  { value: 'poisoning', label: 'Ngo doc' }, { value: 'animal', label: 'Dong vat can' },
  { value: 'violence', label: 'Bao luc' }, { value: 'occupational', label: 'TNLD' },
  { value: 'other', label: 'Khac' },
];

export default function InjuryPrevention() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<InjuryRecordDto[]>([]);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [form] = Form.useForm();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try { const res = await client.get('/injury-prevention/records', { params: { pageSize: 30 } }); const d = res.data as { items: InjuryRecordDto[]; total: number }; setRecords(d.items || []); setTotal(d.total || 0); } catch { setRecords([]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleCreate = async (values: Record<string, unknown>) => {
    try {
      await client.post('/injury-prevention/records', {
        patientName: values.patientName, dateOfBirth: (values.dateOfBirth as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        gender: values.gender, address: values.address,
        injuryDate: (values.injuryDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        injuryType: values.injuryType, location: values.location, cause: values.cause,
        severity: values.severity, outcome: values.outcome, hospitalized: values.hospitalized,
        reportedBy: values.reportedBy,
      });
      message.success('Ghi nhan thanh cong'); setModal(false); form.resetFields(); fetchRecords();
    } catch { message.warning('Loi ghi nhan'); }
  };

  return (
    <Spin spinning={loading}>
      <Card title="Phong chong tai nan thuong tich" extra={<Space><Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal(true); }}>Ghi nhan</Button><Button icon={<ReloadOutlined />} onClick={fetchRecords} /></Space>}>
        <Table dataSource={records} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} columns={[
          { title: 'Ho ten', dataIndex: 'patientName', width: 140 },
          { title: 'Ngay', dataIndex: 'injuryDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
          { title: 'Loai', dataIndex: 'injuryType', width: 80, render: (v: string) => INJURY_TYPES.find(t => t.value === v)?.label || v },
          { title: 'Nguyen nhan', dataIndex: 'cause', width: 150 },
          { title: 'Muc do', dataIndex: 'severity', width: 80, render: (v: string) => v === 'severe' ? <Tag color="red">Nang</Tag> : v === 'moderate' ? <Tag color="orange">TB</Tag> : <Tag color="green">Nhe</Tag> },
          { title: 'Ket qua', dataIndex: 'outcome', width: 80 },
          { title: 'Nhap vien', dataIndex: 'hospitalized', width: 70, render: (v: boolean) => v ? 'Co' : 'Khong' },
          { title: 'Dia diem', dataIndex: 'location', width: 120 },
        ]} scroll={{ x: 850 }} />
      </Card>
      <Modal title="Ghi nhan TNTT" open={modal} onCancel={() => setModal(false)} onOk={() => form.submit()} okText="Luu" width={600}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="patientName" label="Ho ten" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="dateOfBirth" label="Ngay sinh"><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="gender" label="Gioi tinh"><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nu' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="injuryDate" label="Ngay TNTT" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="address" label="Dia chi"><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="injuryType" label="Loai TNTT" rules={[{ required: true }]}><Select options={INJURY_TYPES} /></Form.Item></Col>
            <Col span={8}><Form.Item name="severity" label="Muc do" rules={[{ required: true }]}><Select options={[{ value: 'mild', label: 'Nhe' }, { value: 'moderate', label: 'Trung binh' }, { value: 'severe', label: 'Nang' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="outcome" label="Ket qua"><Select options={[{ value: 'Khoi', label: 'Khoi' }, { value: 'Di chung', label: 'Di chung' }, { value: 'Tu vong', label: 'Tu vong' }]} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="cause" label="Nguyen nhan" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="location" label="Dia diem xay ra"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="reportedBy" label="Nguoi bao cao" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
