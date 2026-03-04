import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, Descriptions, InputNumber, Statistic, Progress, Badge, Alert, Segmented } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, PrinterOutlined, MedicineBoxOutlined, WarningOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import dayjs from 'dayjs';
import { chronicDiseaseApi } from '../api/chronicDisease';
import type {
  ChronicDiseaseRegisterDto, ChronicDiseaseTreatmentDto, NcdExaminationDto,
  NcdTrackingBookDto, NcdTrackingEntryDto, BPChartPointDto, GlucoseChartPointDto,
} from '../api/chronicDisease';

const DISEASE_TYPES = [
  { value: 'hypertension', label: 'Tang huyet ap' },
  { value: 'diabetes', label: 'Dai thao duong' },
  { value: 'tb', label: 'Lao phoi' },
  { value: 'mental', label: 'Tam than' },
  { value: 'malaria', label: 'Sot ret' },
  { value: 'hiv', label: 'HIV/AIDS' },
  { value: 'copd', label: 'COPD' },
  { value: 'asthma', label: 'Hen phe quan' },
];

const TRACKING_BOOK_TYPES = [
  { value: 'TB', label: 'So theo doi Lao' },
  { value: 'Mental', label: 'So theo doi Tam than' },
  { value: 'NCD', label: 'So theo doi Benh KLN' },
];

const PIE_COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];

/** Calculate adherence status from tracking entry */
function getAdherenceStatus(entry: NcdTrackingEntryDto): 'overdue' | 'due-soon' | 'on-track' | 'unknown' {
  if (!entry.nextVisitDate) return 'unknown';
  const next = dayjs(entry.nextVisitDate);
  const today = dayjs();
  if (next.isBefore(today, 'day')) return 'overdue';
  if (next.diff(today, 'day') <= 7) return 'due-soon';
  return 'on-track';
}

function getAdherenceTag(status: string) {
  switch (status) {
    case 'overdue': return <Tag icon={<ExclamationCircleOutlined />} color="error">Qua hen</Tag>;
    case 'due-soon': return <Tag icon={<ClockCircleOutlined />} color="warning">Sap den</Tag>;
    case 'on-track': return <Tag icon={<CheckCircleOutlined />} color="success">Dung hen</Tag>;
    default: return <Tag>Chua hen</Tag>;
  }
}

export default function ChronicDisease() {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<ChronicDiseaseRegisterDto[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<ChronicDiseaseRegisterDto | null>(null);
  const [keyword, setKeyword] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState<string | undefined>(undefined);
  const [registerModal, setRegisterModal] = useState(false);
  const [registerForm] = Form.useForm();

  // Treatment history
  const [treatments, setTreatments] = useState<ChronicDiseaseTreatmentDto[]>([]);
  const [treatmentModal, setTreatmentModal] = useState(false);
  const [treatmentForm] = Form.useForm();

  // NCD Examination
  const [examinations, setExaminations] = useState<NcdExaminationDto[]>([]);
  const [examModal, setExamModal] = useState(false);
  const [examForm] = Form.useForm();

  // Referral
  const [referralModal, setReferralModal] = useState(false);
  const [referralForm] = Form.useForm();

  // Sick Leave
  const [sickLeaveModal, setSickLeaveModal] = useState(false);
  const [sickLeaveForm] = Form.useForm();

  // Chart data
  const [bpChartData, setBpChartData] = useState<BPChartPointDto[]>([]);
  const [glucoseChartData, setGlucoseChartData] = useState<GlucoseChartPointDto[]>([]);

  // Tracking book
  const [trackingBookType, setTrackingBookType] = useState('NCD');
  const [trackingBook, setTrackingBook] = useState<NcdTrackingBookDto | null>(null);

  // Adherence tab
  const [adherenceView, setAdherenceView] = useState<string>('overview');
  const [allBooks, setAllBooks] = useState<NcdTrackingBookDto[]>([]);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await chronicDiseaseApi.search({ keyword, diseaseType: diseaseFilter, pageSize: 30 });
      setPatients(res.data.items || []);
      setTotal(res.data.totalCount || 0);
    } catch { setPatients([]); } finally { setLoading(false); }
  }, [keyword, diseaseFilter]);

  const fetchTrackingBook = useCallback(async () => {
    try {
      const res = await chronicDiseaseApi.getTrackingBook(trackingBookType);
      setTrackingBook(res.data);
    } catch { setTrackingBook(null); }
  }, [trackingBookType]);

  const fetchAllBooks = useCallback(async () => {
    try {
      const results = await Promise.allSettled(
        TRACKING_BOOK_TYPES.map(t => chronicDiseaseApi.getTrackingBook(t.value))
      );
      const books: NcdTrackingBookDto[] = [];
      results.forEach(r => { if (r.status === 'fulfilled' && r.value.data) books.push(r.value.data); });
      setAllBooks(books);
    } catch { setAllBooks([]); }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);
  useEffect(() => { fetchTrackingBook(); }, [fetchTrackingBook]);
  useEffect(() => { fetchAllBooks(); }, [fetchAllBooks]);

  // Computed adherence stats from all tracking books
  const adherenceStats = useMemo(() => {
    const allEntries = allBooks.flatMap(b => (b.entries || []).map(e => ({ ...e, bookType: b.bookType })));
    const overdue = allEntries.filter(e => getAdherenceStatus(e) === 'overdue');
    const dueSoon = allEntries.filter(e => getAdherenceStatus(e) === 'due-soon');
    const onTrack = allEntries.filter(e => getAdherenceStatus(e) === 'on-track');
    const unknown = allEntries.filter(e => getAdherenceStatus(e) === 'unknown');
    const totalActive = allEntries.filter(e => e.status === 'Active').length;
    const adherenceRate = totalActive > 0 ? Math.round(((onTrack.length + dueSoon.length) / totalActive) * 100) : 0;

    // Disease breakdown for pie chart
    const byDisease: Record<string, number> = {};
    allEntries.forEach(e => {
      const label = DISEASE_TYPES.find(d => d.value === e.diseaseType)?.label || e.diseaseType || 'Khac';
      byDisease[label] = (byDisease[label] || 0) + 1;
    });
    const pieData = Object.entries(byDisease).map(([name, value]) => ({ name, value }));

    // Monthly adherence trend (from last visit dates)
    const monthMap: Record<string, { total: number; onTime: number }> = {};
    allEntries.forEach(e => {
      if (!e.lastVisitDate) return;
      const month = dayjs(e.lastVisitDate).format('MM/YYYY');
      if (!monthMap[month]) monthMap[month] = { total: 0, onTime: 0 };
      monthMap[month].total++;
      if (getAdherenceStatus(e) !== 'overdue') monthMap[month].onTime++;
    });
    const trendData = Object.entries(monthMap)
      .sort(([a], [b]) => dayjs(a, 'MM/YYYY').valueOf() - dayjs(b, 'MM/YYYY').valueOf())
      .slice(-6)
      .map(([month, d]) => ({ month, rate: d.total > 0 ? Math.round((d.onTime / d.total) * 100) : 0, total: d.total }));

    return { overdue, dueSoon, onTrack, unknown, adherenceRate, pieData, trendData, allEntries, totalActive };
  }, [allBooks]);

  const handleSelect = async (p: ChronicDiseaseRegisterDto) => {
    setSelected(p);
    try {
      const [treatRes, examRes, bpRes, glRes] = await Promise.allSettled([
        chronicDiseaseApi.getTreatments(p.id),
        chronicDiseaseApi.getNcdExaminations(p.id),
        chronicDiseaseApi.getBPChartData(p.id),
        chronicDiseaseApi.getGlucoseChartData(p.id),
      ]);
      setTreatments(treatRes.status === 'fulfilled' ? treatRes.value.data || [] : []);
      setExaminations(examRes.status === 'fulfilled' ? examRes.value.data || [] : []);
      setBpChartData(bpRes.status === 'fulfilled' ? bpRes.value.data || [] : []);
      setGlucoseChartData(glRes.status === 'fulfilled' ? glRes.value.data || [] : []);
    } catch {
      setTreatments([]); setExaminations([]); setBpChartData([]); setGlucoseChartData([]);
    }
  };

  const handleRegister = async (values: Record<string, unknown>) => {
    try {
      await chronicDiseaseApi.register({
        patientId: values.patientId as string,
        diseaseType: values.diseaseType as string,
        notes: values.notes as string,
      });
      message.success('Dang ky quan ly thanh cong');
      setRegisterModal(false); registerForm.resetFields(); fetchPatients();
    } catch { message.warning('Loi dang ky'); }
  };

  const handleAddTreatment = async (values: Record<string, unknown>) => {
    if (!selected) return;
    try {
      await chronicDiseaseApi.addTreatment({
        registerId: selected.id,
        progress: values.progress as string,
        orders: values.orders as string,
        vitalSigns: JSON.stringify({
          systolicBP: values.systolicBP,
          diastolicBP: values.diastolicBP,
          heartRate: values.heartRate,
          weight: values.weight,
          temperature: values.temperature,
        }),
        notes: values.notes as string,
      });
      message.success('Ghi nhan dieu tri thanh cong');
      setTreatmentModal(false); treatmentForm.resetFields(); handleSelect(selected);
    } catch { message.warning('Loi ghi nhan dieu tri'); }
  };

  const handleCreateExam = async (values: Record<string, unknown>) => {
    if (!selected) return;
    try {
      await chronicDiseaseApi.createNcdExamination({
        registerId: selected.id,
        systolicBP: values.systolicBP as number,
        diastolicBP: values.diastolicBP as number,
        heartRate: values.heartRate as number,
        temperature: values.temperature as number,
        weight: values.weight as number,
        height: values.height as number,
        bloodGlucose: values.bloodGlucose as number,
        hbA1c: values.hbA1c as number,
        cholesterol: values.cholesterol as number,
        triglycerides: values.triglycerides as number,
        creatinine: values.creatinine as number,
        diagnosis: values.diagnosis as string,
        icdCode: values.icdCode as string,
        assessment: values.assessment as string,
        treatmentPlan: values.treatmentPlan as string,
        medications: values.medications as string,
        notes: values.notes as string,
        nextVisitDate: (values.nextVisitDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
      });
      message.success('Kham benh thanh cong');
      setExamModal(false); examForm.resetFields(); handleSelect(selected);
    } catch { message.warning('Loi kham benh'); }
  };

  const handleCreateReferral = async (values: Record<string, unknown>) => {
    if (!selected) return;
    try {
      await chronicDiseaseApi.createReferral({
        registerId: selected.id,
        toFacility: values.toFacility as string,
        reason: values.reason as string,
        diagnosis: values.diagnosis as string,
        treatmentSummary: values.treatmentSummary as string,
        notes: values.notes as string,
      });
      message.success('Chuyen vien thanh cong');
      setReferralModal(false); referralForm.resetFields();
    } catch { message.warning('Loi chuyen vien'); }
  };

  const handleCreateSickLeave = async (values: Record<string, unknown>) => {
    if (!selected) return;
    try {
      await chronicDiseaseApi.createSickLeave({
        registerId: selected.id,
        fromDate: (values.fromDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        toDate: (values.toDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        diagnosis: values.diagnosis as string,
      });
      message.success('Tao giay nghi om thanh cong');
      setSickLeaveModal(false); sickLeaveForm.resetFields();
    } catch { message.warning('Loi tao giay nghi om'); }
  };

  // Patient columns
  const columns: ColumnsType<ChronicDiseaseRegisterDto> = [
    { title: 'Ma BN', dataIndex: 'patientCode', width: 90 },
    { title: 'Ho ten', dataIndex: 'patientName', width: 150 },
    { title: 'Loai benh', dataIndex: 'diseaseType', width: 120, render: (v: string) => DISEASE_TYPES.find(d => d.value === v)?.label || v },
    { title: 'Ngay DK', dataIndex: 'registerDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'So lan kham', dataIndex: 'treatmentCount', width: 80 },
    {
      title: 'Trang thai', dataIndex: 'status', width: 100,
      render: (v?: string) => {
        if (v === 'Active') return <Tag color="green">Dang DT</Tag>;
        if (v === 'Inactive') return <Tag color="default">Ngung</Tag>;
        if (v === 'Transferred') return <Tag color="blue">Chuyen</Tag>;
        return <Tag>{v || 'Moi'}</Tag>;
      },
    },
  ];

  // Treatment history columns
  const treatmentColumns: ColumnsType<ChronicDiseaseTreatmentDto> = [
    { title: 'Ngay', dataIndex: 'treatmentDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Dien bien', dataIndex: 'progress' },
    { title: 'Y lenh', dataIndex: 'orders' },
    { title: 'BS', dataIndex: 'doctorName', width: 100 },
    { title: 'Ghi chu', dataIndex: 'notes' },
  ];

  // NCD examination columns
  const examColumns: ColumnsType<NcdExaminationDto> = [
    { title: 'Ngay kham', dataIndex: 'examDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'HA', width: 80, render: (_: unknown, r: NcdExaminationDto) => r.systolicBP ? `${r.systolicBP}/${r.diastolicBP}` : '' },
    { title: 'Nhip tim', dataIndex: 'heartRate', width: 60 },
    { title: 'Can', dataIndex: 'weight', width: 50 },
    { title: 'DH', dataIndex: 'bloodGlucose', width: 50 },
    { title: 'HbA1c', dataIndex: 'hbA1c', width: 60 },
    { title: 'Chan doan', dataIndex: 'diagnosis' },
    { title: 'Ke hoach DT', dataIndex: 'treatmentPlan' },
    { title: 'BS', dataIndex: 'doctorName', width: 100 },
  ];

  // Adherence tracking columns
  const adherenceColumns: ColumnsType<NcdTrackingEntryDto & { bookType?: string }> = [
    { title: 'Ma BN', dataIndex: 'patientCode', width: 90 },
    { title: 'Ho ten', dataIndex: 'patientName', width: 140 },
    { title: 'Loai benh', dataIndex: 'diseaseType', width: 110, render: (v?: string) => DISEASE_TYPES.find(d => d.value === v)?.label || v },
    { title: 'Kham cuoi', dataIndex: 'lastVisitDate', width: 100, render: (v?: string) => v ? dayjs(v).format('DD/MM/YYYY') : '-' },
    {
      title: 'Hen kham', dataIndex: 'nextVisitDate', width: 100,
      render: (v?: string) => {
        if (!v) return '-';
        const d = dayjs(v);
        const isOverdue = d.isBefore(dayjs(), 'day');
        return <span style={{ color: isOverdue ? '#f5222d' : undefined, fontWeight: isOverdue ? 600 : undefined }}>{d.format('DD/MM/YYYY')}</span>;
      },
    },
    {
      title: 'Qua han', width: 80,
      render: (_: unknown, r: NcdTrackingEntryDto) => {
        if (!r.nextVisitDate) return '-';
        const diff = dayjs().diff(dayjs(r.nextVisitDate), 'day');
        if (diff > 0) return <span style={{ color: '#f5222d', fontWeight: 600 }}>{diff} ngay</span>;
        if (diff >= -7) return <span style={{ color: '#faad14' }}>{Math.abs(diff)} ngay nua</span>;
        return <span style={{ color: '#52c41a' }}>{Math.abs(diff)} ngay nua</span>;
      },
    },
    {
      title: 'Tuan thu', width: 100,
      render: (_: unknown, r: NcdTrackingEntryDto) => getAdherenceTag(getAdherenceStatus(r)),
    },
    { title: 'Dieu tri', dataIndex: 'currentTreatment', ellipsis: true },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'patients', label: <Badge count={adherenceStats.overdue.length} offset={[12, 0]} size="small">Benh nhan</Badge>,
          children: (
            <Row gutter={16}>
              <Col xs={24} lg={10}>
                <Card size="small" extra={
                  <Space>
                    <Input placeholder="Tim kiem..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchPatients()} style={{ width: 160 }} />
                    <Select placeholder="Loai benh" allowClear style={{ width: 130 }} options={DISEASE_TYPES} value={diseaseFilter} onChange={setDiseaseFilter} />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { registerForm.resetFields(); setRegisterModal(true); }}>Dang ky</Button>
                  </Space>
                }>
                  <Table columns={columns} dataSource={patients} rowKey="id" size="small" pagination={{ total, pageSize: 30 }}
                    onRow={r => ({ onClick: () => handleSelect(r), style: { cursor: 'pointer', background: selected?.id === r.id ? '#e6f7ff' : undefined } })}
                    scroll={{ x: 740 }}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={14}>
                {selected ? (
                  <Card size="small" title={selected.patientName} extra={
                    <Space>
                      <Button type="primary" size="small" icon={<MedicineBoxOutlined />} onClick={() => { examForm.resetFields(); setExamModal(true); }}>Kham KLN</Button>
                      <Button size="small" icon={<PlusOutlined />} onClick={() => { treatmentForm.resetFields(); setTreatmentModal(true); }}>Dieu tri</Button>
                      <Button size="small" onClick={() => { referralForm.resetFields(); setReferralModal(true); }}>Chuyen vien</Button>
                      <Button size="small" onClick={() => { sickLeaveForm.resetFields(); setSickLeaveModal(true); }}>Nghi om</Button>
                    </Space>
                  }>
                    <Descriptions size="small" column={3}>
                      <Descriptions.Item label="Benh">{DISEASE_TYPES.find(d => d.value === selected.diseaseType)?.label}</Descriptions.Item>
                      <Descriptions.Item label="Trang thai"><Tag>{selected.status || 'Moi'}</Tag></Descriptions.Item>
                      <Descriptions.Item label="So lan kham">{selected.treatmentCount}</Descriptions.Item>
                    </Descriptions>

                    {/* BP Chart */}
                    {bpChartData.length > 0 && (
                      <Card size="small" title="Bieu do huyet ap" style={{ marginTop: 12 }}>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={bpChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[40, 200]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="systolic" name="Tam thu" stroke="#f5222d" strokeWidth={2} />
                            <Line type="monotone" dataKey="diastolic" name="Tam truong" stroke="#1890ff" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </Card>
                    )}

                    {/* Glucose Chart */}
                    {glucoseChartData.length > 0 && (
                      <Card size="small" title="Bieu do duong huyet" style={{ marginTop: 12 }}>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={glucoseChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="glucose" name="Duong huyet" stroke="#faad14" strokeWidth={2} />
                            <Line type="monotone" dataKey="hbA1c" name="HbA1c" stroke="#722ed1" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </Card>
                    )}

                    {/* NCD Examinations */}
                    <Card size="small" title="Kham benh KLN" style={{ marginTop: 12 }}>
                      <Table columns={examColumns} dataSource={examinations} rowKey="id" size="small" pagination={false} scroll={{ x: 800 }} />
                    </Card>

                    {/* Treatment History */}
                    <Card size="small" title="To dieu tri" style={{ marginTop: 12 }}>
                      <Table columns={treatmentColumns} dataSource={treatments} rowKey="id" size="small" pagination={false} scroll={{ x: 600 }} />
                    </Card>
                  </Card>
                ) : <Card style={{ textAlign: 'center', padding: 40 }}><p style={{ color: '#999' }}>Chon benh nhan de xem chi tiet</p></Card>}
              </Col>
            </Row>
          ),
        },
        {
          key: 'adherence', label: <Badge count={adherenceStats.overdue.length} offset={[12, 0]} size="small" color="red">Tuan thu DT</Badge>,
          children: (
            <div>
              {/* KPI cards */}
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={5}>
                  <Card size="small">
                    <Statistic title="Ty le tuan thu" value={adherenceStats.adherenceRate} suffix="%" prefix={adherenceStats.adherenceRate >= 80 ? <CheckCircleOutlined /> : <WarningOutlined />} styles={{ content: { color: adherenceStats.adherenceRate >= 80 ? '#52c41a' : '#f5222d' } }} />
                    <Progress percent={adherenceStats.adherenceRate} showInfo={false} strokeColor={adherenceStats.adherenceRate >= 80 ? '#52c41a' : '#f5222d'} size="small" />
                  </Card>
                </Col>
                <Col span={5}>
                  <Card size="small">
                    <Statistic title="Qua hen kham" value={adherenceStats.overdue.length} prefix={<ExclamationCircleOutlined />} styles={{ content: { color: '#f5222d' } }} />
                  </Card>
                </Col>
                <Col span={5}>
                  <Card size="small">
                    <Statistic title="Sap den hen" value={adherenceStats.dueSoon.length} prefix={<ClockCircleOutlined />} styles={{ content: { color: '#faad14' } }} />
                  </Card>
                </Col>
                <Col span={5}>
                  <Card size="small">
                    <Statistic title="Dung hen" value={adherenceStats.onTrack.length} prefix={<CheckCircleOutlined />} styles={{ content: { color: '#52c41a' } }} />
                  </Card>
                </Col>
                <Col span={4}>
                  <Card size="small">
                    <Statistic title="Tong dang DT" value={adherenceStats.totalActive} />
                  </Card>
                </Col>
              </Row>

              {adherenceStats.overdue.length > 0 && (
                <Alert type="warning" showIcon style={{ marginBottom: 16 }}
                  title={`Co ${adherenceStats.overdue.length} benh nhan qua hen kham. Vui long lien he nhac hen.`}
                />
              )}

              <Segmented options={[
                { value: 'overview', label: 'Tong quan' },
                { value: 'overdue', label: `Qua hen (${adherenceStats.overdue.length})` },
                { value: 'due-soon', label: `Sap den hen (${adherenceStats.dueSoon.length})` },
                { value: 'all', label: 'Tat ca' },
              ]} value={adherenceView} onChange={v => setAdherenceView(v as string)} style={{ marginBottom: 16 }} />

              {adherenceView === 'overview' ? (
                <Row gutter={16}>
                  <Col span={12}>
                    <Card size="small" title="Phan bo benh">
                      {adherenceStats.pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Pie data={adherenceStats.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={100} label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                              {adherenceStats.pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Chua co du lieu</div>}
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" title="Xu huong tuan thu (6 thang)">
                      {adherenceStats.trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={adherenceStats.trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis domain={[0, 100]} unit="%" />
                            <Tooltip formatter={(value: number) => `${value}%`} />
                            <Bar dataKey="rate" name="Ty le tuan thu" fill="#1890ff" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Chua co du lieu</div>}
                    </Card>
                  </Col>
                </Row>
              ) : (
                <Table
                  columns={adherenceColumns}
                  dataSource={
                    adherenceView === 'overdue' ? adherenceStats.overdue
                    : adherenceView === 'due-soon' ? adherenceStats.dueSoon
                    : adherenceStats.allEntries
                  }
                  rowKey={(r) => r.patientId + (r.diseaseType || '')}
                  size="small"
                  pagination={{ pageSize: 20 }}
                  scroll={{ x: 900 }}
                />
              )}
            </div>
          ),
        },
        {
          key: 'tracking', label: 'So theo doi',
          children: (
            <Card extra={
              <Space>
                <Select style={{ width: 200 }} options={TRACKING_BOOK_TYPES} value={trackingBookType} onChange={setTrackingBookType} />
                <Button icon={<ReloadOutlined />} onClick={fetchTrackingBook} />
                <Button icon={<PrinterOutlined />} onClick={() => window.print()}>In</Button>
              </Space>
            }>
              {trackingBook ? (
                <>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}><Statistic title="Tong so" value={trackingBook.totalPatients} /></Col>
                    <Col span={6}><Statistic title="Dang dieu tri" value={trackingBook.activePatients} styles={{ content: { color: '#52c41a' } }} /></Col>
                    <Col span={6}><Statistic title="Da dieu tri" value={trackingBook.treatedPatients} styles={{ content: { color: '#1890ff' } }} /></Col>
                    <Col span={6}><Statistic title="Bo tri" value={trackingBook.defaultedPatients} styles={{ content: { color: '#f5222d' } }} /></Col>
                  </Row>
                  <Table dataSource={trackingBook.entries} rowKey="patientId" size="small" pagination={{ pageSize: 20 }} columns={[
                    { title: 'Ma BN', dataIndex: 'patientCode', width: 90 },
                    { title: 'Ho ten', dataIndex: 'patientName', width: 150 },
                    { title: 'Loai benh', dataIndex: 'diseaseType', width: 100, render: (v?: string) => DISEASE_TYPES.find(d => d.value === v)?.label || v },
                    { title: 'Ngay DK', dataIndex: 'registerDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                    { title: 'Kham cuoi', dataIndex: 'lastVisitDate', width: 100, render: (v?: string) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
                    {
                      title: 'Kham tiep', dataIndex: 'nextVisitDate', width: 100,
                      render: (v?: string) => {
                        if (!v) return '';
                        const d = dayjs(v);
                        const overdue = d.isBefore(dayjs(), 'day');
                        return <span style={{ color: overdue ? '#f5222d' : undefined, fontWeight: overdue ? 600 : undefined }}>{d.format('DD/MM/YYYY')}</span>;
                      },
                    },
                    {
                      title: 'Trang thai', dataIndex: 'status', width: 90,
                      render: (v?: string) => <Tag color={v === 'Active' ? 'green' : v === 'Defaulted' ? 'red' : 'default'}>{v}</Tag>,
                    },
                    { title: 'Dieu tri', dataIndex: 'currentTreatment' },
                  ]} scroll={{ x: 900 }} />
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Chon loai so theo doi</div>
              )}
            </Card>
          ),
        },
      ]} />

      {/* Register patient modal */}
      <Modal title="Dang ky quan ly benh man tinh" open={registerModal} onCancel={() => setRegisterModal(false)} onOk={() => registerForm.submit()} okText="Dang ky">
        <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
          <Form.Item name="patientId" label="Ma benh nhan (GUID)" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="diseaseType" label="Loai benh" rules={[{ required: true }]}><Select options={DISEASE_TYPES} /></Form.Item>
          <Form.Item name="notes" label="Ghi chu"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Treatment record modal */}
      <Modal title="Ghi nhan dieu tri" open={treatmentModal} onCancel={() => setTreatmentModal(false)} onOk={() => treatmentForm.submit()} okText="Luu" width={600}>
        <Form form={treatmentForm} layout="vertical" onFinish={handleAddTreatment}>
          <Row gutter={12}>
            <Col span={6}><Form.Item name="systolicBP" label="HA tam thu"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={6}><Form.Item name="diastolicBP" label="HA tam truong"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={6}><Form.Item name="heartRate" label="Nhip tim"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={6}><Form.Item name="weight" label="Can nang"><InputNumber style={{ width: '100%' }} step={0.1} /></Form.Item></Col>
          </Row>
          <Form.Item name="progress" label="Dien bien"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="orders" label="Y lenh"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="notes" label="Ghi chu"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* NCD Examination modal */}
      <Modal title="Kham benh ngoai tru KLN" open={examModal} onCancel={() => setExamModal(false)} onOk={() => examForm.submit()} okText="Luu" width={700}>
        <Form form={examForm} layout="vertical" onFinish={handleCreateExam}>
          <Card size="small" title="Sinh hieu" style={{ marginBottom: 12 }}>
            <Row gutter={12}>
              <Col span={6}><Form.Item name="systolicBP" label="HA tam thu"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={6}><Form.Item name="diastolicBP" label="HA tam truong"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={6}><Form.Item name="heartRate" label="Nhip tim"><InputNumber style={{ width: '100%' }} step={0.1} /></Form.Item></Col>
              <Col span={6}><Form.Item name="temperature" label="Nhiet do"><InputNumber style={{ width: '100%' }} step={0.1} /></Form.Item></Col>
            </Row>
            <Row gutter={12}>
              <Col span={8}><Form.Item name="weight" label="Can nang (kg)"><InputNumber style={{ width: '100%' }} step={0.1} /></Form.Item></Col>
              <Col span={8}><Form.Item name="height" label="Chieu cao (cm)"><InputNumber style={{ width: '100%' }} step={0.1} /></Form.Item></Col>
              <Col span={8}><Form.Item label="BMI"><InputNumber style={{ width: '100%' }} disabled /></Form.Item></Col>
            </Row>
          </Card>
          <Card size="small" title="Xet nghiem" style={{ marginBottom: 12 }}>
            <Row gutter={12}>
              <Col span={8}><Form.Item name="bloodGlucose" label="Duong huyet (mmol/L)"><InputNumber style={{ width: '100%' }} step={0.1} /></Form.Item></Col>
              <Col span={8}><Form.Item name="hbA1c" label="HbA1c (%)"><InputNumber style={{ width: '100%' }} step={0.1} /></Form.Item></Col>
              <Col span={8}><Form.Item name="cholesterol" label="Cholesterol"><InputNumber style={{ width: '100%' }} step={0.1} /></Form.Item></Col>
            </Row>
            <Row gutter={12}>
              <Col span={12}><Form.Item name="triglycerides" label="Triglycerides"><InputNumber style={{ width: '100%' }} step={0.1} /></Form.Item></Col>
              <Col span={12}><Form.Item name="creatinine" label="Creatinine"><InputNumber style={{ width: '100%' }} step={0.1} /></Form.Item></Col>
            </Row>
          </Card>
          <Card size="small" title="Lam sang">
            <Row gutter={12}>
              <Col span={16}><Form.Item name="diagnosis" label="Chan doan"><Input /></Form.Item></Col>
              <Col span={8}><Form.Item name="icdCode" label="Ma ICD"><Input /></Form.Item></Col>
            </Row>
            <Form.Item name="assessment" label="Nhan dinh"><Input.TextArea rows={2} /></Form.Item>
            <Form.Item name="treatmentPlan" label="Ke hoach dieu tri"><Input.TextArea rows={2} /></Form.Item>
            <Form.Item name="medications" label="Don thuoc"><Input.TextArea rows={2} /></Form.Item>
            <Row gutter={12}>
              <Col span={12}><Form.Item name="nextVisitDate" label="Lan kham tiep"><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="notes" label="Ghi chu"><Input /></Form.Item></Col>
            </Row>
          </Card>
        </Form>
      </Modal>

      {/* Referral modal */}
      <Modal title="Chuyen vien" open={referralModal} onCancel={() => setReferralModal(false)} onOk={() => referralForm.submit()} okText="Luu">
        <Form form={referralForm} layout="vertical" onFinish={handleCreateReferral}>
          <Form.Item name="toFacility" label="Co so tiep nhan" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="reason" label="Ly do chuyen" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="diagnosis" label="Chan doan"><Input /></Form.Item>
          <Form.Item name="treatmentSummary" label="Tom tat dieu tri"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="notes" label="Ghi chu"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Sick Leave modal */}
      <Modal title="Giay nghi om" open={sickLeaveModal} onCancel={() => setSickLeaveModal(false)} onOk={() => sickLeaveForm.submit()} okText="Luu">
        <Form form={sickLeaveForm} layout="vertical" onFinish={handleCreateSickLeave}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="fromDate" label="Tu ngay" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="toDate" label="Den ngay" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="diagnosis" label="Chan doan" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
