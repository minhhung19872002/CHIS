import { useState, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Form, Input, Row, Col, DatePicker, Select, InputNumber, Space } from 'antd';
import { PlusOutlined, ReloadOutlined, PrinterOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import client from '../api/client';

interface DriverExamDto {
  id: string; fullName: string; dateOfBirth: string; gender: number; idNumber: string;
  address: string; licenseClass: string; examDate: string; height: number; weight: number;
  bloodPressureSystolic: number; bloodPressureDiastolic: number; heartRate: number;
  visionLeft: number; visionRight: number; colorVision: string; hearingStatus: string;
  mentalStatus: string; neurologicalStatus: string; musculoskeletalStatus: string;
  result: string; doctorName: string; note?: string; digitalSignature?: boolean;
}

export default function DriverLicenseExam() {
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<DriverExamDto[]>([]);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [form] = Form.useForm();

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('/driver-license-exam', { params: { keyword, pageSize: 30 } });
      const d = res.data as { items: DriverExamDto[]; total: number };
      setExams(d.items || []); setTotal(d.total || 0);
    } catch { setExams([]); } finally { setLoading(false); }
  }, [keyword]);

  const handleCreate = async (values: Record<string, unknown>) => {
    try {
      await client.post('/driver-license-exam', {
        fullName: values.fullName, dateOfBirth: (values.dateOfBirth as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        gender: values.gender, idNumber: values.idNumber, address: values.address,
        licenseClass: values.licenseClass, examDate: dayjs().format('YYYY-MM-DD'),
        height: values.height, weight: values.weight,
        bloodPressureSystolic: values.bloodPressureSystolic, bloodPressureDiastolic: values.bloodPressureDiastolic,
        heartRate: values.heartRate, visionLeft: values.visionLeft, visionRight: values.visionRight,
        colorVision: values.colorVision, hearingStatus: values.hearingStatus,
        mentalStatus: values.mentalStatus, neurologicalStatus: values.neurologicalStatus,
        musculoskeletalStatus: values.musculoskeletalStatus, result: values.result,
        doctorName: values.doctorName, note: values.note,
      });
      message.success('Luu ket qua kham thanh cong'); setModal(false); form.resetFields(); fetchExams();
    } catch { message.warning('Loi luu ket qua'); }
  };

  const columns: ColumnsType<DriverExamDto> = [
    { title: 'Ho ten', dataIndex: 'fullName', width: 150 },
    { title: 'Ngay sinh', dataIndex: 'dateOfBirth', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'CCCD', dataIndex: 'idNumber', width: 120 },
    { title: 'Hang', dataIndex: 'licenseClass', width: 60 },
    { title: 'Ngay kham', dataIndex: 'examDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'HA', width: 80, render: (_: unknown, r: DriverExamDto) => `${r.bloodPressureSystolic}/${r.bloodPressureDiastolic}` },
    { title: 'Thi luc', width: 80, render: (_: unknown, r: DriverExamDto) => `${r.visionLeft}/${r.visionRight}` },
    { title: 'Ket qua', dataIndex: 'result', width: 80, render: (v: string) => v === 'Dat' ? <Tag color="green">Dat</Tag> : <Tag color="red">Khong dat</Tag> },
    { title: 'CKS', dataIndex: 'digitalSignature', width: 50, render: (v: boolean) => v ? <Tag color="green">Co</Tag> : null },
    { title: 'BS', dataIndex: 'doctorName', width: 120 },
    {
      title: '', width: 60,
      render: () => <Button size="small" icon={<PrinterOutlined />}>In</Button>,
    },
  ];

  return (
    <Spin spinning={loading}>
      <Card title="Kham suc khoe lai xe" extra={<Space>
        <Input placeholder="Tim kiem..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchExams()} style={{ width: 200 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal(true); }}>Kham moi</Button>
        <Button icon={<ReloadOutlined />} onClick={fetchExams} />
      </Space>}>
        <Table columns={columns} dataSource={exams} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 1060 }} />
      </Card>

      <Modal title="Kham suc khoe lai xe" open={modal} onCancel={() => setModal(false)} onOk={() => form.submit()} okText="Luu" width={800}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="fullName" label="Ho ten" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="dateOfBirth" label="Ngay sinh" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={6}><Form.Item name="gender" label="Gioi tinh" rules={[{ required: true }]}><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nu' }]} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="idNumber" label="So CCCD" rules={[{ required: true }]}><Input maxLength={12} /></Form.Item></Col>
            <Col span={8}><Form.Item name="licenseClass" label="Hang GPLX" rules={[{ required: true }]}><Select options={[{ value: 'A1', label: 'A1' }, { value: 'A2', label: 'A2' }, { value: 'B1', label: 'B1' }, { value: 'B2', label: 'B2' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }, { value: 'E', label: 'E' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="doctorName" label="Bac si kham" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="address" label="Dia chi" rules={[{ required: true }]}><Input /></Form.Item>

          <Card size="small" title="Kham the luc" style={{ marginBottom: 12 }}>
            <Row gutter={12}>
              <Col span={6}><Form.Item name="height" label="Chieu cao (cm)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={6}><Form.Item name="weight" label="Can nang (kg)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} step={0.1} /></Form.Item></Col>
              <Col span={4}><Form.Item name="bloodPressureSystolic" label="HA TT" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={4}><Form.Item name="bloodPressureDiastolic" label="HA TTr" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={4}><Form.Item name="heartRate" label="Mach" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
          </Card>

          <Card size="small" title="Kham chuyen khoa" style={{ marginBottom: 12 }}>
            <Row gutter={12}>
              <Col span={6}><Form.Item name="visionLeft" label="Thi luc trai" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} step={0.1} min={0} max={10} /></Form.Item></Col>
              <Col span={6}><Form.Item name="visionRight" label="Thi luc phai" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} step={0.1} min={0} max={10} /></Form.Item></Col>
              <Col span={6}><Form.Item name="colorVision" label="Sac giac" rules={[{ required: true }]}><Select options={[{ value: 'Binh thuong', label: 'Binh thuong' }, { value: 'Bat thuong', label: 'Bat thuong' }]} /></Form.Item></Col>
              <Col span={6}><Form.Item name="hearingStatus" label="Thinh luc" rules={[{ required: true }]}><Select options={[{ value: 'Binh thuong', label: 'Binh thuong' }, { value: 'Giam', label: 'Giam' }]} /></Form.Item></Col>
            </Row>
            <Row gutter={12}>
              <Col span={8}><Form.Item name="mentalStatus" label="Tam than kinh" rules={[{ required: true }]}><Select options={[{ value: 'Binh thuong', label: 'Binh thuong' }, { value: 'Bat thuong', label: 'Bat thuong' }]} /></Form.Item></Col>
              <Col span={8}><Form.Item name="neurologicalStatus" label="Than kinh" rules={[{ required: true }]}><Select options={[{ value: 'Binh thuong', label: 'Binh thuong' }, { value: 'Bat thuong', label: 'Bat thuong' }]} /></Form.Item></Col>
              <Col span={8}><Form.Item name="musculoskeletalStatus" label="Co xuong khop" rules={[{ required: true }]}><Select options={[{ value: 'Binh thuong', label: 'Binh thuong' }, { value: 'Bat thuong', label: 'Bat thuong' }]} /></Form.Item></Col>
            </Row>
          </Card>

          <Row gutter={12}>
            <Col span={12}><Form.Item name="result" label="Ket luan" rules={[{ required: true }]}><Select options={[{ value: 'Dat', label: 'Du dieu kien' }, { value: 'Khong dat', label: 'Khong du dieu kien' }]} /></Form.Item></Col>
            <Col span={12}><Form.Item name="note" label="Ghi chu"><Input.TextArea rows={2} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </Spin>
  );
}
