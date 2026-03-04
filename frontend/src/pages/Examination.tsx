import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Tabs, Form, Input, Select, Button, Row, Col, Tag, Spin, message, Modal, InputNumber, DatePicker, Space, Descriptions, Segmented, Empty } from 'antd';
import { SearchOutlined, SaveOutlined, PrinterOutlined, ReloadOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined, EditOutlined, CalendarOutlined, MedicineBoxOutlined, ExperimentOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { examinationApi, RECORD_TYPES, TRACKING_BOOK_TYPES } from '../api/examination';
import type {
  ExaminationDto, VitalSignsDto, ReferralDto, SickLeaveDto,
  SpecializedRecordDto, TrackingBookEntryDto, VitalSignChartPoint,
  OnlineBookingDto, CreateSpecializedRecordDto, CreateTrackingBookEntryDto,
} from '../api/examination';
import { prescriptionApi } from '../api/prescription';
import type { PrescriptionItemDto } from '../api/prescription';

export default function Examination() {
  const [loading, setLoading] = useState(false);
  const [examList, setExamList] = useState<ExaminationDto[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedExam, setSelectedExam] = useState<ExaminationDto | null>(null);
  const [activeTab, setActiveTab] = useState('vitals');
  const [searchForm] = Form.useForm();
  const [vitalForm] = Form.useForm();
  const [diagnosisForm] = Form.useForm();
  const [referralModal, setReferralModal] = useState(false);
  const [sickLeaveModal, setSickLeaveModal] = useState(false);
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItemDto[]>([]);
  const [rxModal, setRxModal] = useState(false);
  const [rxForm] = Form.useForm();
  const [diseaseBooks, setDiseaseBooks] = useState<Record<string, unknown>[]>([]);
  const [pageIndex, setPageIndex] = useState(0);

  // ---- New state for specialized records ----
  const [specializedRecords, setSpecializedRecords] = useState<SpecializedRecordDto[]>([]);
  const [selectedRecordType, setSelectedRecordType] = useState<string>(RECORD_TYPES[0].value);
  const [specRecordModal, setSpecRecordModal] = useState(false);
  const [specRecordForm] = Form.useForm();
  const [editingSpecRecord, setEditingSpecRecord] = useState<SpecializedRecordDto | null>(null);

  // ---- New state for tracking books ----
  const [trackingEntries, setTrackingEntries] = useState<TrackingBookEntryDto[]>([]);
  const [selectedBookType, setSelectedBookType] = useState<string>(TRACKING_BOOK_TYPES[0].value);
  const [trackingModal, setTrackingModal] = useState(false);
  const [trackingForm] = Form.useForm();
  const [editingTrackingEntry, setEditingTrackingEntry] = useState<TrackingBookEntryDto | null>(null);

  // ---- New state for charts ----
  const [chartData, setChartData] = useState<VitalSignChartPoint[]>([]);
  const [chartType, setChartType] = useState<string>('bloodPressure');

  // ---- New state for procedure modals ----
  const [infusionModal, setInfusionModal] = useState(false);
  const [infusionForm] = Form.useForm();
  const [oxytocinModal, setOxytocinModal] = useState(false);
  const [oxytocinForm] = Form.useForm();
  const [surgeryModal, setSurgeryModal] = useState(false);
  const [surgeryForm] = Form.useForm();

  // ---- New state for online bookings ----
  const [bookings, setBookings] = useState<OnlineBookingDto[]>([]);
  const [bookingTotal, setBookingTotal] = useState(0);

  const fetchExams = useCallback(async (page?: number) => {
    setLoading(true);
    try {
      const vals = searchForm.getFieldsValue();
      const res = await examinationApi.search({
        keyword: vals.keyword || '',
        fromDate: vals.dateRange?.[0]?.format('YYYY-MM-DD'),
        toDate: vals.dateRange?.[1]?.format('YYYY-MM-DD'),
        status: vals.status,
        pageIndex: page ?? pageIndex,
        pageSize: 20,
      });
      setExamList(res.data.items);
      setTotal(res.data.total);
    } catch {
      setExamList([]);
    } finally {
      setLoading(false);
    }
  }, [searchForm, pageIndex]);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  const handleSelectExam = (exam: ExaminationDto) => {
    setSelectedExam(exam);
    if (exam.vitalSigns) vitalForm.setFieldsValue(exam.vitalSigns);
    else vitalForm.resetFields();
    diagnosisForm.setFieldsValue({
      mainDiagnosisCode: exam.mainDiagnosisCode,
      mainDiagnosisName: exam.mainDiagnosisName,
      subDiagnoses: exam.subDiagnoses,
      treatmentPlan: exam.treatmentPlan,
    });
    prescriptionApi.getByExamination(exam.id)
      .then(res => setPrescriptionItems(res.data.items || []))
      .catch(() => setPrescriptionItems([]));
  };

  // ---- Specialized Records helpers ----
  const fetchSpecializedRecords = useCallback(async (recordType?: string) => {
    if (!selectedExam) return;
    try {
      const res = await examinationApi.getSpecializedRecords(selectedExam.patientId, recordType);
      setSpecializedRecords(res.data);
    } catch {
      setSpecializedRecords([]);
    }
  }, [selectedExam]);

  const handleCreateSpecRecord = async (values: Record<string, unknown>) => {
    if (!selectedExam) return;
    try {
      const dto: CreateSpecializedRecordDto = {
        patientId: selectedExam.patientId,
        medicalRecordId: selectedExam.id, // Using examination id as medical record context
        recordType: values.recordType as string,
        recordData: values.recordData as string,
        doctorId: selectedExam.doctorId,
      };
      if (editingSpecRecord) {
        await examinationApi.updateSpecializedRecord(editingSpecRecord.id, dto);
        message.success('Cap nhat ho so thanh cong');
      } else {
        await examinationApi.createSpecializedRecord(dto);
        message.success('Tao ho so thanh cong');
      }
      setSpecRecordModal(false);
      setEditingSpecRecord(null);
      specRecordForm.resetFields();
      fetchSpecializedRecords(selectedRecordType);
    } catch {
      message.warning('Loi luu ho so chuyen khoa');
    }
  };

  const handleDeleteSpecRecord = async (id: string) => {
    try {
      await examinationApi.deleteSpecializedRecord(id);
      message.success('Da xoa ho so');
      fetchSpecializedRecords(selectedRecordType);
    } catch {
      message.warning('Loi xoa ho so');
    }
  };

  const handlePrintSpecRecord = async (id: string) => {
    try {
      const res = await examinationApi.printSpecializedRecord(id);
      const blob = new Blob([res.data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const w = window.open(url, '_blank');
      if (w) { w.onload = () => w.print(); }
    } catch {
      message.warning('Loi in ho so');
    }
  };

  // ---- Tracking Book helpers ----
  const fetchTrackingEntries = useCallback(async (bookType?: string) => {
    if (!selectedExam) return;
    try {
      const res = await examinationApi.getTrackingBookEntries(selectedExam.patientId, bookType || selectedBookType);
      setTrackingEntries(res.data);
    } catch {
      setTrackingEntries([]);
    }
  }, [selectedExam, selectedBookType]);

  const handleCreateTrackingEntry = async (values: Record<string, unknown>) => {
    if (!selectedExam) return;
    try {
      const dto: CreateTrackingBookEntryDto = {
        patientId: selectedExam.patientId,
        bookType: values.bookType as string || selectedBookType,
        entryDate: (values.entryDate as dayjs.Dayjs)?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
        notes: values.notes as string,
        entryData: values.entryData as string,
        doctorId: selectedExam.doctorId,
        examinationId: selectedExam.id,
      };
      if (editingTrackingEntry) {
        await examinationApi.updateTrackingBookEntry(editingTrackingEntry.id, dto);
        message.success('Cap nhat so theo doi thanh cong');
      } else {
        await examinationApi.createTrackingBookEntry(dto);
        message.success('Them muc so theo doi thanh cong');
      }
      setTrackingModal(false);
      setEditingTrackingEntry(null);
      trackingForm.resetFields();
      fetchTrackingEntries();
    } catch {
      message.warning('Loi luu so theo doi');
    }
  };

  const handleDeleteTrackingEntry = async (id: string) => {
    try {
      await examinationApi.deleteTrackingBookEntry(id);
      message.success('Da xoa muc');
      fetchTrackingEntries();
    } catch {
      message.warning('Loi xoa muc');
    }
  };

  // ---- Chart helpers ----
  const fetchChartData = useCallback(async () => {
    if (!selectedExam) return;
    try {
      const from = dayjs().subtract(6, 'month').format('YYYY-MM-DD');
      const to = dayjs().format('YYYY-MM-DD');
      const res = await examinationApi.getVitalSignChart(selectedExam.patientId, chartType, from, to);
      setChartData(res.data.dataPoints || []);
    } catch {
      setChartData([]);
    }
  }, [selectedExam, chartType]);

  // ---- Procedure helpers ----
  const handleCreateInfusion = async (values: Record<string, unknown>) => {
    if (!selectedExam) return;
    try {
      await examinationApi.createInfusionRecord({
        patientId: selectedExam.patientId,
        examinationId: selectedExam.id,
        startTime: (values.startTime as dayjs.Dayjs)?.toISOString() || new Date().toISOString(),
        solutionName: values.solutionName as string,
        volume: values.volume as number,
        flowRate: values.flowRate as number,
        notes: values.notes as string,
      });
      message.success('Tao phieu truyen dich thanh cong');
      setInfusionModal(false);
      infusionForm.resetFields();
    } catch {
      message.warning('Loi tao phieu truyen dich');
    }
  };

  const handleCreateOxytocin = async (values: Record<string, unknown>) => {
    if (!selectedExam) return;
    try {
      await examinationApi.createOxytocinRecord({
        patientId: selectedExam.patientId,
        examinationId: selectedExam.id,
        startTime: (values.startTime as dayjs.Dayjs)?.toISOString() || new Date().toISOString(),
        initialDose: values.initialDose as number,
        maxDose: values.maxDose as number,
        dilutionInfo: values.dilutionInfo as string,
        notes: values.notes as string,
      });
      message.success('Tao phieu oxytocin thanh cong');
      setOxytocinModal(false);
      oxytocinForm.resetFields();
    } catch {
      message.warning('Loi tao phieu oxytocin');
    }
  };

  const handleCreateSurgery = async (values: Record<string, unknown>) => {
    if (!selectedExam) return;
    try {
      await examinationApi.createSurgeryRecord({
        patientId: selectedExam.patientId,
        examinationId: selectedExam.id,
        procedureDate: (values.procedureDate as dayjs.Dayjs)?.toISOString() || new Date().toISOString(),
        procedureName: values.procedureName as string,
        procedureType: values.procedureType as string,
        surgeon: values.surgeon as string,
        assistant: values.assistant as string,
        anesthesia: values.anesthesia as string,
        findings: values.findings as string,
        complications: values.complications as string,
        notes: values.notes as string,
      });
      message.success('Tao phieu phau thuat thanh cong');
      setSurgeryModal(false);
      surgeryForm.resetFields();
    } catch {
      message.warning('Loi tao phieu phau thuat');
    }
  };

  // ---- Booking helpers ----
  const fetchBookings = useCallback(async () => {
    try {
      const res = await examinationApi.getOnlineBookings({ pageIndex: 0, pageSize: 20 });
      setBookings(res.data.items || []);
      setBookingTotal(res.data.totalCount || 0);
    } catch {
      setBookings([]);
    }
  }, []);

  // ---- Existing handlers ----
  const saveVitalSigns = async (values: VitalSignsDto) => {
    if (!selectedExam) return;
    try {
      if (values.weight && values.height) {
        values.bmi = Math.round((values.weight / ((values.height / 100) ** 2)) * 10) / 10;
      }
      await examinationApi.saveVitalSigns(selectedExam.id, values);
      message.success('Luu sinh hieu thanh cong');
    } catch {
      message.warning('Loi luu sinh hieu');
    }
  };

  const saveDiagnosis = async (values: { mainCode: string; mainName: string; subDiagnoses?: string }) => {
    if (!selectedExam) return;
    try {
      await examinationApi.saveDiagnosis(selectedExam.id, { mainCode: values.mainCode, mainName: values.mainName, subDiagnoses: values.subDiagnoses });
      message.success('Luu chan doan thanh cong');
    } catch {
      message.warning('Loi luu chan doan');
    }
  };

  const saveReferral = async (values: ReferralDto) => {
    if (!selectedExam) return;
    try {
      await examinationApi.saveReferral(selectedExam.id, values);
      message.success('Luu giay chuyen tuyen thanh cong');
      setReferralModal(false);
    } catch {
      message.warning('Loi luu chuyen tuyen');
    }
  };

  const saveSickLeave = async (values: SickLeaveDto) => {
    if (!selectedExam) return;
    try {
      await examinationApi.saveSickLeave(selectedExam.id, values);
      message.success('Luu giay nghi benh thanh cong');
      setSickLeaveModal(false);
    } catch {
      message.warning('Loi luu giay nghi benh');
    }
  };

  const completeExam = async () => {
    if (!selectedExam) return;
    try {
      await examinationApi.complete(selectedExam.id);
      message.success('Ket thuc kham thanh cong');
      fetchExams();
    } catch {
      message.warning('Loi ket thuc kham');
    }
  };

  const handleAddMedicine = async (values: Record<string, unknown>) => {
    const item: PrescriptionItemDto = {
      id: '',
      medicineId: values.medicineId as string || '',
      medicineName: values.medicineName as string,
      unit: values.unit as string,
      quantity: values.quantity as number,
      dosage: values.dosage as string,
      frequency: values.frequency as string,
      route: values.route as string || 'Uong',
      duration: values.duration as number,
      morningDose: values.morningDose as number,
      noonDose: values.noonDose as number,
      afternoonDose: values.afternoonDose as number,
      eveningDose: values.eveningDose as number,
      unitPrice: 0,
      totalPrice: 0,
      insuranceRate: 0,
    };
    setPrescriptionItems(prev => [...prev, item]);
    setRxModal(false);
    rxForm.resetFields();
  };

  const fetchDiseaseBooks = async () => {
    try {
      const vals = searchForm.getFieldsValue();
      const res = await examinationApi.getDiseaseBooks({
        fromDate: vals.dateRange?.[0]?.format('YYYY-MM-DD'),
        toDate: vals.dateRange?.[1]?.format('YYYY-MM-DD'),
      });
      setDiseaseBooks(res.data as Record<string, unknown>[]);
    } catch {
      setDiseaseBooks([]);
    }
  };

  // ---- Column definitions ----
  const examColumns: ColumnsType<ExaminationDto> = [
    { title: 'Ma BN', dataIndex: 'patientCode', width: 90 },
    { title: 'Ho ten', dataIndex: 'patientName', width: 160 },
    { title: 'Ngay kham', dataIndex: 'examDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Phong', dataIndex: 'roomName', width: 100 },
    { title: 'BS', dataIndex: 'doctorName', width: 120 },
    {
      title: 'Trang thai', dataIndex: 'status', width: 100,
      render: (v: number) => v === 0 ? <Tag color="orange">Cho kham</Tag> : v === 1 ? <Tag color="blue">Dang kham</Tag> : v === 2 ? <Tag color="cyan">Da kham</Tag> : <Tag color="green">Hoan thanh</Tag>,
    },
  ];

  const rxColumns: ColumnsType<PrescriptionItemDto> = [
    { title: 'Ten thuoc', dataIndex: 'medicineName' },
    { title: 'Don vi', dataIndex: 'unit', width: 60 },
    { title: 'SL', dataIndex: 'quantity', width: 50 },
    { title: 'Lieu dung', dataIndex: 'dosage', width: 120 },
    { title: 'S', dataIndex: 'morningDose', width: 40 },
    { title: 'Tr', dataIndex: 'noonDose', width: 40 },
    { title: 'C', dataIndex: 'afternoonDose', width: 40 },
    { title: 'T', dataIndex: 'eveningDose', width: 40 },
    { title: 'So ngay', dataIndex: 'duration', width: 60 },
  ];

  const specRecordColumns: ColumnsType<SpecializedRecordDto> = [
    { title: 'Loai', dataIndex: 'recordTypeLabel', width: 140 },
    { title: 'Bac si', dataIndex: 'doctorName', width: 120 },
    { title: 'Ngay tao', dataIndex: 'createdAt', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YY') },
    { title: 'Trang thai', dataIndex: 'status', width: 80, render: (v: number) => v === 0 ? <Tag color="blue">Moi</Tag> : <Tag color="green">Da in</Tag> },
    {
      title: '', width: 120,
      render: (_: unknown, record: SpecializedRecordDto) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); setEditingSpecRecord(record); specRecordForm.setFieldsValue({ recordType: record.recordType, recordData: record.recordData }); setSpecRecordModal(true); }} />
          <Button size="small" icon={<PrinterOutlined />} onClick={(e) => { e.stopPropagation(); handlePrintSpecRecord(record.id); }} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDeleteSpecRecord(record.id); }} />
        </Space>
      ),
    },
  ];

  const trackingColumns: ColumnsType<TrackingBookEntryDto> = [
    { title: 'Ngay', dataIndex: 'entryDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Loai so', dataIndex: 'bookTypeLabel', width: 120 },
    { title: 'Bac si', dataIndex: 'doctorName', width: 120 },
    { title: 'Ghi chu', dataIndex: 'notes', ellipsis: true },
    {
      title: '', width: 80,
      render: (_: unknown, record: TrackingBookEntryDto) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); setEditingTrackingEntry(record); trackingForm.setFieldsValue({ bookType: record.bookType, entryDate: dayjs(record.entryDate), notes: record.notes, entryData: record.entryData }); setTrackingModal(true); }} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDeleteTrackingEntry(record.id); }} />
        </Space>
      ),
    },
  ];

  const bookingColumns: ColumnsType<OnlineBookingDto> = [
    { title: 'Ma BN', dataIndex: 'patientCode', width: 90 },
    { title: 'Ho ten', dataIndex: 'patientName', width: 150 },
    { title: 'SĐT', dataIndex: 'patientPhone', width: 100 },
    { title: 'Ngay hen', dataIndex: 'bookingDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Gio', dataIndex: 'bookingTime', width: 70 },
    { title: 'Phong', dataIndex: 'roomName', width: 100 },
    { title: 'Nguon', dataIndex: 'source', width: 80, render: (v: string) => <Tag>{v || 'Web'}</Tag> },
    {
      title: 'Trang thai', dataIndex: 'status', width: 100,
      render: (v: number) => v === 0 ? <Tag color="orange">Cho</Tag> : v === 1 ? <Tag color="blue">Xac nhan</Tag> : v === 2 ? <Tag color="green">Da kham</Tag> : <Tag color="red">Huy</Tag>,
    },
  ];

  // ---- Chart formatting ----
  const chartDataFormatted = chartData.map(p => ({
    ...p,
    date: dayjs(p.date).format('DD/MM'),
  }));

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Spin spinning={loading}>
      <Row gutter={16}>
        <Col xs={24} lg={10}>
          <Card title="Danh sach kham" size="small" extra={<Button icon={<ReloadOutlined />} size="small" onClick={() => fetchExams()} />}>
            <Form form={searchForm} layout="inline" style={{ marginBottom: 12 }}>
              <Form.Item name="keyword">
                <Input placeholder="Tim kiem..." prefix={<SearchOutlined />} allowClear onPressEnter={() => fetchExams(0)} style={{ width: 180 }} />
              </Form.Item>
              <Form.Item name="status">
                <Select placeholder="Trang thai" allowClear style={{ width: 120 }} options={[
                  { value: 0, label: 'Cho kham' },
                  { value: 1, label: 'Dang kham' },
                  { value: 2, label: 'Da kham' },
                ]} onChange={() => fetchExams(0)} />
              </Form.Item>
            </Form>
            <Table
              columns={examColumns}
              dataSource={examList}
              rowKey="id"
              size="small"
              pagination={{ total, pageSize: 20, onChange: (p) => { setPageIndex(p - 1); fetchExams(p - 1); } }}
              onRow={(record) => ({ onClick: () => handleSelectExam(record), style: { cursor: 'pointer', background: selectedExam?.id === record.id ? '#e6f7ff' : undefined } })}
              scroll={{ x: 770 }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          {selectedExam ? (
            <Card
              title={`Kham benh - ${selectedExam.patientName}`}
              size="small"
              extra={
                <Space>
                  <Button icon={<PrinterOutlined />} size="small">In</Button>
                  <Button type="primary" icon={<CheckCircleOutlined />} size="small" onClick={completeExam}>Ket thuc</Button>
                </Space>
              }
            >
              <Descriptions size="small" column={3} style={{ marginBottom: 12 }}>
                <Descriptions.Item label="Ma BN">{selectedExam.patientCode}</Descriptions.Item>
                <Descriptions.Item label="Ngay kham">{dayjs(selectedExam.examDate).format('DD/MM/YYYY')}</Descriptions.Item>
                <Descriptions.Item label="Doi tuong">{selectedExam.patientType === 1 ? 'BHYT' : 'Thu phi'}</Descriptions.Item>
              </Descriptions>

              <Tabs
                activeKey={activeTab}
                onChange={(key) => {
                  setActiveTab(key);
                  if (key === 'specialized') fetchSpecializedRecords(selectedRecordType);
                  if (key === 'tracking') fetchTrackingEntries();
                  if (key === 'chart') fetchChartData();
                  if (key === 'bookings') fetchBookings();
                }}
                items={[
                  // ---- TAB 1: SINH HIEU ----
                  {
                    key: 'vitals',
                    label: 'Sinh hieu',
                    children: (
                      <Form form={vitalForm} layout="vertical" onFinish={saveVitalSigns}>
                        <Row gutter={12}>
                          <Col span={6}><Form.Item name="temperature" label="Than nhiet (C)"><InputNumber style={{ width: '100%' }} step={0.1} /></Form.Item></Col>
                          <Col span={6}><Form.Item name="heartRate" label="Mach (l/p)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                          <Col span={6}><Form.Item name="bloodPressureSystolic" label="HA tam thu"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                          <Col span={6}><Form.Item name="bloodPressureDiastolic" label="HA tam truong"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                        </Row>
                        <Row gutter={12}>
                          <Col span={6}><Form.Item name="respiratoryRate" label="Nhip tho (l/p)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                          <Col span={6}><Form.Item name="weight" label="Can nang (kg)"><InputNumber style={{ width: '100%' }} step={0.1} /></Form.Item></Col>
                          <Col span={6}><Form.Item name="height" label="Chieu cao (cm)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                          <Col span={6}><Form.Item name="spo2" label="SpO2 (%)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                        </Row>
                        <Button type="primary" icon={<SaveOutlined />} htmlType="submit">Luu sinh hieu</Button>
                      </Form>
                    ),
                  },
                  // ---- TAB 2: CHAN DOAN ----
                  {
                    key: 'diagnosis',
                    label: 'Chan doan',
                    children: (
                      <Form form={diagnosisForm} layout="vertical" onFinish={saveDiagnosis}>
                        <Form.Item name="chiefComplaint" label="Ly do kham"><Input.TextArea rows={2} /></Form.Item>
                        <Form.Item name="presentIllness" label="Benh su"><Input.TextArea rows={3} /></Form.Item>
                        <Row gutter={12}>
                          <Col span={8}><Form.Item name="mainCode" label="Ma ICD chinh" rules={[{ required: true }]}><Input /></Form.Item></Col>
                          <Col span={16}><Form.Item name="mainName" label="Chan doan chinh" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        </Row>
                        <Form.Item name="subDiagnoses" label="Chan doan phu"><Input.TextArea rows={2} /></Form.Item>
                        <Form.Item name="treatmentPlan" label="Huong xu tri"><Input.TextArea rows={2} /></Form.Item>
                        <Button type="primary" icon={<SaveOutlined />} htmlType="submit">Luu chan doan</Button>
                      </Form>
                    ),
                  },
                  // ---- TAB 3: DON THUOC ----
                  {
                    key: 'prescription',
                    label: 'Don thuoc',
                    children: (
                      <div>
                        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600 }}>Danh sach thuoc</span>
                          <Button size="small" type="primary" onClick={() => { rxForm.resetFields(); setRxModal(true); }}>+ Them thuoc</Button>
                        </div>
                        <Table columns={rxColumns} dataSource={prescriptionItems} rowKey={(_, i) => String(i)} size="small" pagination={false} scroll={{ x: 700 }} />
                      </div>
                    ),
                  },
                  // ---- TAB 4: HO SO CHUYEN KHOA (14 types) ----
                  {
                    key: 'specialized',
                    label: 'Ho so CK',
                    children: (
                      <div>
                        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Select
                            value={selectedRecordType}
                            onChange={(v) => { setSelectedRecordType(v); fetchSpecializedRecords(v); }}
                            style={{ width: 200 }}
                            options={RECORD_TYPES}
                          />
                          <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => { setEditingSpecRecord(null); specRecordForm.resetFields(); specRecordForm.setFieldsValue({ recordType: selectedRecordType }); setSpecRecordModal(true); }}>
                            Tao ho so
                          </Button>
                        </div>
                        {specializedRecords.length > 0 ? (
                          <Table columns={specRecordColumns} dataSource={specializedRecords} rowKey="id" size="small" pagination={{ pageSize: 5 }} />
                        ) : (
                          <Empty description="Chua co ho so chuyen khoa" />
                        )}
                      </div>
                    ),
                  },
                  // ---- TAB 5: SO THEO DOI (8 types) ----
                  {
                    key: 'tracking',
                    label: 'So theo doi',
                    children: (
                      <div>
                        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Select
                            value={selectedBookType}
                            onChange={(v) => { setSelectedBookType(v); fetchTrackingEntries(v); }}
                            style={{ width: 200 }}
                            options={TRACKING_BOOK_TYPES}
                          />
                          <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => { setEditingTrackingEntry(null); trackingForm.resetFields(); trackingForm.setFieldsValue({ bookType: selectedBookType, entryDate: dayjs() }); setTrackingModal(true); }}>
                            Them muc
                          </Button>
                        </div>
                        {trackingEntries.length > 0 ? (
                          <Table columns={trackingColumns} dataSource={trackingEntries} rowKey="id" size="small" pagination={{ pageSize: 10 }} />
                        ) : (
                          <Empty description="Chua co du lieu so theo doi" />
                        )}
                      </div>
                    ),
                  },
                  // ---- TAB 6: BIEU DO SINH HIEU ----
                  {
                    key: 'chart',
                    label: 'Bieu do',
                    children: (
                      <div>
                        <div style={{ marginBottom: 12 }}>
                          <Segmented
                            value={chartType}
                            onChange={(v) => { setChartType(v as string); }}
                            options={[
                              { value: 'bloodPressure', label: 'Huyet ap' },
                              { value: 'glucose', label: 'Duong huyet' },
                              { value: 'weight', label: 'Can nang' },
                              { value: 'heartRate', label: 'Nhip tim' },
                            ]}
                          />
                          <Button size="small" style={{ marginLeft: 12 }} icon={<ReloadOutlined />} onClick={fetchChartData}>Tai lai</Button>
                        </div>
                        {chartDataFormatted.length > 0 ? (
                          <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={chartDataFormatted}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              {chartType === 'bloodPressure' && (
                                <>
                                  <Line type="monotone" dataKey="systolicBP" name="Tam thu" stroke="#f5222d" strokeWidth={2} />
                                  <Line type="monotone" dataKey="diastolicBP" name="Tam truong" stroke="#1890ff" strokeWidth={2} />
                                </>
                              )}
                              {chartType === 'glucose' && <Line type="monotone" dataKey="glucose" name="Duong huyet" stroke="#faad14" strokeWidth={2} />}
                              {chartType === 'weight' && <Line type="monotone" dataKey="weight" name="Can nang (kg)" stroke="#52c41a" strokeWidth={2} />}
                              {chartType === 'heartRate' && <Line type="monotone" dataKey="heartRate" name="Nhip tim (bpm)" stroke="#eb2f96" strokeWidth={2} />}
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <Empty description="Khong co du lieu bieu do. Bam 'Tai lai' de lay du lieu." />
                        )}
                      </div>
                    ),
                  },
                  // ---- TAB 7: THU THUAT ----
                  {
                    key: 'procedures',
                    label: 'Thu thuat',
                    children: (
                      <div>
                        <Space style={{ marginBottom: 16 }}>
                          <Button icon={<MedicineBoxOutlined />} onClick={() => { infusionForm.resetFields(); setInfusionModal(true); }}>Truyen dich</Button>
                          <Button icon={<ExperimentOutlined />} onClick={() => { oxytocinForm.resetFields(); setOxytocinModal(true); }}>Oxytocin</Button>
                          <Button icon={<MedicineBoxOutlined />} onClick={() => { surgeryForm.resetFields(); setSurgeryModal(true); }}>Phau thuat/TT</Button>
                        </Space>
                        <Empty description="Chon loai thu thuat phia tren de tao phieu moi" />
                      </div>
                    ),
                  },
                  // ---- TAB 8: CHUYEN TUYEN ----
                  {
                    key: 'referral',
                    label: 'Chuyen tuyen',
                    children: (
                      <div>
                        {selectedExam.referral ? (
                          <Descriptions column={1} size="small">
                            <Descriptions.Item label="Noi chuyen">{selectedExam.referral.referToFacility}</Descriptions.Item>
                            <Descriptions.Item label="Ly do">{selectedExam.referral.referReason}</Descriptions.Item>
                            <Descriptions.Item label="Chan doan">{selectedExam.referral.referDiagnosis}</Descriptions.Item>
                          </Descriptions>
                        ) : <p>Chua co giay chuyen tuyen</p>}
                        <Button type="primary" onClick={() => setReferralModal(true)}>Tao giay chuyen tuyen</Button>
                      </div>
                    ),
                  },
                  // ---- TAB 9: NGHI BENH ----
                  {
                    key: 'sickleave',
                    label: 'Nghi benh',
                    children: (
                      <div>
                        {selectedExam.sickLeave ? (
                          <Descriptions column={2} size="small">
                            <Descriptions.Item label="Tu ngay">{dayjs(selectedExam.sickLeave.fromDate).format('DD/MM/YYYY')}</Descriptions.Item>
                            <Descriptions.Item label="Den ngay">{dayjs(selectedExam.sickLeave.toDate).format('DD/MM/YYYY')}</Descriptions.Item>
                            <Descriptions.Item label="So ngay">{selectedExam.sickLeave.days}</Descriptions.Item>
                            <Descriptions.Item label="Ly do">{selectedExam.sickLeave.reason}</Descriptions.Item>
                          </Descriptions>
                        ) : <p>Chua co giay nghi benh</p>}
                        <Button type="primary" onClick={() => setSickLeaveModal(true)}>Tao giay nghi benh</Button>
                      </div>
                    ),
                  },
                  // ---- TAB 10: SO BENH ----
                  {
                    key: 'disease-book',
                    label: 'So benh',
                    children: (
                      <div>
                        <Button onClick={fetchDiseaseBooks} style={{ marginBottom: 12 }}>Tai so benh</Button>
                        <Table
                          dataSource={diseaseBooks}
                          rowKey={(_, i) => String(i)}
                          size="small"
                          pagination={{ pageSize: 10 }}
                          columns={[
                            { title: 'Ngay', dataIndex: 'date', width: 100 },
                            { title: 'Ho ten', dataIndex: 'patientName', width: 150 },
                            { title: 'Chan doan', dataIndex: 'diagnosis' },
                            { title: 'ICD', dataIndex: 'icdCode', width: 80 },
                          ]}
                        />
                      </div>
                    ),
                  },
                  // ---- TAB 11: DAT LICH ONLINE ----
                  {
                    key: 'bookings',
                    label: 'Dat lich',
                    icon: <CalendarOutlined />,
                    children: (
                      <div>
                        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600 }}>Danh sach dat lich online ({bookingTotal})</span>
                          <Button size="small" icon={<ReloadOutlined />} onClick={fetchBookings}>Lam moi</Button>
                        </div>
                        {bookings.length > 0 ? (
                          <Table columns={bookingColumns} dataSource={bookings} rowKey="id" size="small" pagination={{ pageSize: 10 }} scroll={{ x: 900 }} />
                        ) : (
                          <Empty description="Khong co lich hen" />
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          ) : (
            <Card style={{ textAlign: 'center', padding: 48 }}>
              <p style={{ color: '#999' }}>Vui long chon benh nhan tu danh sach ben trai</p>
            </Card>
          )}
        </Col>
      </Row>

      {/* ============================================================ */}
      {/* MODALS */}
      {/* ============================================================ */}

      {/* Add Medicine Modal */}
      <Modal title="Them thuoc" open={rxModal} onCancel={() => setRxModal(false)} onOk={() => rxForm.submit()} okText="Them">
        <Form form={rxForm} layout="vertical" onFinish={handleAddMedicine}>
          <Form.Item name="medicineName" label="Ten thuoc" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="unit" label="Don vi" rules={[{ required: true }]}><Input placeholder="Vien" /></Form.Item></Col>
            <Col span={8}><Form.Item name="quantity" label="So luong" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} /></Form.Item></Col>
            <Col span={8}><Form.Item name="duration" label="So ngay" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} /></Form.Item></Col>
          </Row>
          <Form.Item name="dosage" label="Cach dung"><Input placeholder="Uong sau an" /></Form.Item>
          <Row gutter={12}>
            <Col span={6}><Form.Item name="morningDose" label="Sang"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={6}><Form.Item name="noonDose" label="Trua"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={6}><Form.Item name="afternoonDose" label="Chieu"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={6}><Form.Item name="eveningDose" label="Toi"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="frequency" label="Tan suat"><Input placeholder="Ngay 2 lan" /></Form.Item>
        </Form>
      </Modal>

      {/* Referral Modal */}
      <Modal title="Giay chuyen tuyen" open={referralModal} onCancel={() => setReferralModal(false)} onOk={() => {
        const f = document.querySelector('#referralForm') as HTMLFormElement;
        f?.requestSubmit();
      }} okText="Luu">
        <Form id="referralForm" layout="vertical" onFinish={saveReferral}>
          <Form.Item name="referToFacility" label="Noi chuyen den" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="referReason" label="Ly do chuyen" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="referDiagnosis" label="Chan doan"><Input /></Form.Item>
          <Form.Item name="transportMethod" label="Phuong tien van chuyen">
            <Select options={[{ value: 'ambulance', label: 'Xe cap cuu' }, { value: 'self', label: 'Tu di' }, { value: 'family', label: 'Gia dinh dua' }]} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Sick Leave Modal */}
      <Modal title="Giay nghi benh" open={sickLeaveModal} onCancel={() => setSickLeaveModal(false)} onOk={() => {
        const f = document.querySelector('#sickLeaveForm') as HTMLFormElement;
        f?.requestSubmit();
      }} okText="Luu">
        <Form id="sickLeaveForm" layout="vertical" onFinish={saveSickLeave}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="fromDate" label="Tu ngay" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
            <Col span={12}><Form.Item name="toDate" label="Den ngay" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
          </Row>
          <Form.Item name="reason" label="Ly do"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Specialized Record Modal */}
      <Modal
        title={editingSpecRecord ? 'Cap nhat ho so chuyen khoa' : 'Tao ho so chuyen khoa'}
        open={specRecordModal}
        onCancel={() => { setSpecRecordModal(false); setEditingSpecRecord(null); }}
        onOk={() => specRecordForm.submit()}
        okText={editingSpecRecord ? 'Cap nhat' : 'Tao'}
        width={600}
      >
        <Form form={specRecordForm} layout="vertical" onFinish={handleCreateSpecRecord}>
          <Form.Item name="recordType" label="Loai ho so" rules={[{ required: true }]}>
            <Select options={RECORD_TYPES} />
          </Form.Item>
          <Form.Item name="recordData" label="Noi dung ho so (JSON hoac text)">
            <Input.TextArea rows={8} placeholder='{"lyDoKham": "...", "tienSu": "...", "khamLamSang": "...", "chanDoan": "...", "dieuTri": "..."}' />
          </Form.Item>
        </Form>
      </Modal>

      {/* Tracking Book Entry Modal */}
      <Modal
        title={editingTrackingEntry ? 'Cap nhat muc so theo doi' : 'Them muc so theo doi'}
        open={trackingModal}
        onCancel={() => { setTrackingModal(false); setEditingTrackingEntry(null); }}
        onOk={() => trackingForm.submit()}
        okText={editingTrackingEntry ? 'Cap nhat' : 'Them'}
        width={500}
      >
        <Form form={trackingForm} layout="vertical" onFinish={handleCreateTrackingEntry}>
          <Form.Item name="bookType" label="Loai so" rules={[{ required: true }]}>
            <Select options={TRACKING_BOOK_TYPES} />
          </Form.Item>
          <Form.Item name="entryDate" label="Ngay" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chu">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="entryData" label="Du lieu chi tiet (JSON)">
            <Input.TextArea rows={4} placeholder='{"chiSo": "...", "ketQua": "...", "thuocDung": "..."}' />
          </Form.Item>
        </Form>
      </Modal>

      {/* Infusion Record Modal */}
      <Modal
        title="Phieu truyen dich"
        open={infusionModal}
        onCancel={() => setInfusionModal(false)}
        onOk={() => infusionForm.submit()}
        okText="Tao"
        width={500}
      >
        <Form form={infusionForm} layout="vertical" onFinish={handleCreateInfusion}>
          <Form.Item name="solutionName" label="Dung dich" rules={[{ required: true }]}>
            <Input placeholder="NaCl 0.9%, Glucose 5%..." />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="volume" label="The tich (ml)"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={8}><Form.Item name="flowRate" label="Toc do (giot/p)"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={8}><Form.Item name="startTime" label="Gio bat dau"><DatePicker showTime style={{ width: '100%' }} format="HH:mm DD/MM" /></Form.Item></Col>
          </Row>
          <Form.Item name="notes" label="Ghi chu"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Oxytocin Record Modal */}
      <Modal
        title="Phieu theo doi Oxytocin"
        open={oxytocinModal}
        onCancel={() => setOxytocinModal(false)}
        onOk={() => oxytocinForm.submit()}
        okText="Tao"
        width={500}
      >
        <Form form={oxytocinForm} layout="vertical" onFinish={handleCreateOxytocin}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="initialDose" label="Lieu khoi dau (mUI/p)"><InputNumber style={{ width: '100%' }} min={0} step={0.5} /></Form.Item></Col>
            <Col span={8}><Form.Item name="maxDose" label="Lieu toi da (mUI/p)"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={8}><Form.Item name="startTime" label="Gio bat dau"><DatePicker showTime style={{ width: '100%' }} format="HH:mm DD/MM" /></Form.Item></Col>
          </Row>
          <Form.Item name="dilutionInfo" label="Thong tin pha loang"><Input placeholder="5 IU trong 500ml Ringer Lactate" /></Form.Item>
          <Form.Item name="notes" label="Ghi chu"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Surgery Record Modal */}
      <Modal
        title="Phieu phau thuat / Thu thuat"
        open={surgeryModal}
        onCancel={() => setSurgeryModal(false)}
        onOk={() => surgeryForm.submit()}
        okText="Tao"
        width={600}
      >
        <Form form={surgeryForm} layout="vertical" onFinish={handleCreateSurgery}>
          <Form.Item name="procedureName" label="Ten thu thuat" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="procedureType" label="Loai">
                <Select options={[
                  { value: 'minor', label: 'Tieu phau' },
                  { value: 'major', label: 'Dai phau' },
                  { value: 'procedure', label: 'Thu thuat' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}><Form.Item name="procedureDate" label="Ngay thuc hien"><DatePicker showTime style={{ width: '100%' }} format="HH:mm DD/MM/YYYY" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="surgeon" label="Phau thuat vien"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="assistant" label="Phu mo"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="anesthesia" label="Phuong phap vo cam">
            <Select options={[
              { value: 'local', label: 'Gay te tai cho' },
              { value: 'spinal', label: 'Gay te tuy song' },
              { value: 'general', label: 'Gay me toan than' },
              { value: 'none', label: 'Khong vo cam' },
            ]} />
          </Form.Item>
          <Form.Item name="findings" label="Ket qua"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="complications" label="Bien chung"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="notes" label="Ghi chu"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
