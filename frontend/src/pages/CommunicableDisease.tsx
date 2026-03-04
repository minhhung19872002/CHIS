import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, Checkbox } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, AlertOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { communicableDiseaseApi } from '../api/communicableDisease';
import type { DiseaseCaseDto, WeeklyReportDto } from '../api/communicableDisease';

const DISEASE_LIST = [
  { value: 'A09', label: 'Tieu chay' }, { value: 'A01', label: 'Thuong han' },
  { value: 'A90', label: 'Sot xuat huyet' }, { value: 'B05', label: 'Soi' },
  { value: 'A37', label: 'Ho ga' }, { value: 'B01', label: 'Thuy dau' },
  { value: 'A87', label: 'Viem mang nao' }, { value: 'J09', label: 'Cum' },
  { value: 'A00', label: 'Ta' }, { value: 'B17', label: 'Viem gan' },
];

export default function CommunicableDisease() {
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState<DiseaseCaseDto[]>([]);
  const [total, setTotal] = useState(0);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReportDto[]>([]);
  const [keyword, setKeyword] = useState('');
  const [caseModal, setCaseModal] = useState(false);
  const [caseForm] = Form.useForm();

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await communicableDiseaseApi.getCases({ keyword, pageSize: 30 });
      setCases(res.data.items);
      setTotal(res.data.total);
    } catch { setCases([]); } finally { setLoading(false); }
  }, [keyword]);

  const fetchReports = useCallback(async () => {
    try { const res = await communicableDiseaseApi.getWeeklyReports({ year: dayjs().year() }); setWeeklyReports(res.data); } catch { setWeeklyReports([]); }
  }, []);

  useEffect(() => { fetchCases(); fetchReports(); }, [fetchCases, fetchReports]);

  const handleReport = async (values: Record<string, unknown>) => {
    try {
      await communicableDiseaseApi.reportCase({
        patientName: values.patientName as string,
        dateOfBirth: (values.dateOfBirth as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        gender: values.gender as number,
        address: values.address as string,
        diseaseCode: values.diseaseCode as string,
        diseaseName: DISEASE_LIST.find(d => d.value === values.diseaseCode)?.label || values.diseaseCode as string,
        onsetDate: (values.onsetDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        reportDate: dayjs().format('YYYY-MM-DD'),
        hospitalized: values.hospitalized as boolean,
        labConfirmed: values.labConfirmed as boolean,
        reportedBy: values.reportedBy as string,
      });
      message.success('Bao cao ca benh thanh cong');
      setCaseModal(false); caseForm.resetFields(); fetchCases();
    } catch { message.warning('Loi bao cao'); }
  };

  const columns: ColumnsType<DiseaseCaseDto> = [
    { title: 'Ho ten', dataIndex: 'patientName', width: 140 },
    { title: 'Benh', dataIndex: 'diseaseName', width: 120 },
    { title: 'ICD', dataIndex: 'diseaseCode', width: 60 },
    { title: 'Ngay phat benh', dataIndex: 'onsetDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Nhap vien', dataIndex: 'hospitalized', width: 70, render: (v: boolean) => v ? <Tag color="red">Co</Tag> : <Tag>Khong</Tag> },
    { title: 'XN', dataIndex: 'labConfirmed', width: 50, render: (v: boolean) => v ? <Tag color="green">Co</Tag> : <Tag>Khong</Tag> },
    { title: 'Ket qua', dataIndex: 'outcome', width: 80 },
    { title: 'Trang thai', dataIndex: 'status', width: 90, render: (v: number) => v === 0 ? <Tag color="orange">Dang dieu tra</Tag> : <Tag color="green">Da xu ly</Tag> },
  ];

  const reportColumns: ColumnsType<WeeklyReportDto> = [
    { title: 'Tuan', dataIndex: 'weekNumber', width: 60 },
    { title: 'Nam', dataIndex: 'year', width: 60 },
    { title: 'Ngay nop', dataIndex: 'submittedDate', width: 100, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
    { title: 'Trang thai', dataIndex: 'status', width: 100, render: (v: string) => <Tag color={v === 'submitted' ? 'green' : 'orange'}>{v === 'submitted' ? 'Da nop' : 'Chua nop'}</Tag> },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'cases', label: 'Ca benh',
          children: (
            <Card extra={<Space>
              <Input placeholder="Tim kiem..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchCases()} style={{ width: 200 }} />
              <Select placeholder="Benh" allowClear style={{ width: 160 }} options={DISEASE_LIST} />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { caseForm.resetFields(); setCaseModal(true); }}><AlertOutlined /> Bao cao</Button>
              <Button icon={<ReloadOutlined />} onClick={fetchCases} />
            </Space>}>
              <Table columns={columns} dataSource={cases} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 810 }} />
            </Card>
          ),
        },
        {
          key: 'weekly', label: 'Bao cao tuan',
          children: <Card extra={<Button icon={<ReloadOutlined />} onClick={fetchReports} />}><Table columns={reportColumns} dataSource={weeklyReports} rowKey={(_, i) => String(i)} size="small" pagination={false} /></Card>,
        },
        {
          key: 'monthly', label: 'Bao cao thang',
          children: <Card title="Bao cao benh truyen nhiem hang thang"><DatePicker picker="month" format="MM/YYYY" style={{ marginRight: 12 }} /><Button type="primary">Xuat bao cao</Button></Card>,
        },
      ]} />

      <Modal title="Bao cao ca benh truyen nhiem" open={caseModal} onCancel={() => setCaseModal(false)} onOk={() => caseForm.submit()} okText="Bao cao" width={600}>
        <Form form={caseForm} layout="vertical" onFinish={handleReport}>
          <Form.Item name="patientName" label="Ho ten benh nhan" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="dateOfBirth" label="Ngay sinh"><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="gender" label="Gioi tinh" rules={[{ required: true }]}><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nu' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="diseaseCode" label="Benh" rules={[{ required: true }]}><Select options={DISEASE_LIST} showSearch /></Form.Item></Col>
          </Row>
          <Form.Item name="address" label="Dia chi" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="onsetDate" label="Ngay phat benh" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="reportedBy" label="Nguoi bao cao" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="hospitalized" valuePropName="checked"><Checkbox>Nhap vien</Checkbox></Form.Item></Col>
            <Col span={12}><Form.Item name="labConfirmed" valuePropName="checked"><Checkbox>Xac nhan xet nghiem</Checkbox></Form.Item></Col>
          </Row>
          <Form.Item name="contactTracing" label="Dieu tra dich te"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
