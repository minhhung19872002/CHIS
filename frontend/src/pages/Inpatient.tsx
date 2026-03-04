import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Tabs, Form, Input, Button, Row, Col, Tag, Spin, message, Modal, InputNumber, Select, DatePicker, Space, Descriptions } from 'antd';
import { PlusOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { inpatientApi } from '../api/inpatient';
import type { AdmissionDto, InpatientVitalDto, TreatmentSheetDto, CareSheetDto } from '../api/inpatient';

export default function Inpatient() {
  const [loading, setLoading] = useState(false);
  const [admissions, setAdmissions] = useState<AdmissionDto[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<AdmissionDto | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [admitModal, setAdmitModal] = useState(false);
  const [vitals, setVitals] = useState<InpatientVitalDto[]>([]);
  const [treatments, setTreatments] = useState<TreatmentSheetDto[]>([]);
  const [careSheets, setCareSheets] = useState<CareSheetDto[]>([]);
  const [vitalModal, setVitalModal] = useState(false);
  const [treatmentModal, setTreatmentModal] = useState(false);
  const [careModal, setCareModal] = useState(false);
  const [dischargeModal, setDischargeModal] = useState(false);
  const [admitForm] = Form.useForm();
  const [vitalForm] = Form.useForm();
  const [treatmentForm] = Form.useForm();
  const [careForm] = Form.useForm();
  const [dischargeForm] = Form.useForm();
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);

  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inpatientApi.getAdmissions({ status: statusFilter, pageSize: 30 });
      setAdmissions(res.data.items);
      setTotal(res.data.total);
    } catch {
      setAdmissions([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchAdmissions(); }, [fetchAdmissions]);

  const handleSelect = async (record: AdmissionDto) => {
    setSelected(record);
    try {
      const [v, t, c] = await Promise.allSettled([
        inpatientApi.getVitalSigns(record.id),
        inpatientApi.getTreatmentSheets(record.id),
        inpatientApi.getCareSheets(record.id),
      ]);
      setVitals(v.status === 'fulfilled' ? v.value.data : []);
      setTreatments(t.status === 'fulfilled' ? t.value.data : []);
      setCareSheets(c.status === 'fulfilled' ? c.value.data : []);
    } catch { /* empty */ }
  };

  const handleAdmit = async (values: Record<string, unknown>) => {
    try {
      await inpatientApi.admit({
        patientId: values.patientId as string,
        admissionDiagnosis: values.admissionDiagnosis as string,
        admissionReason: values.admissionReason as string,
        departmentId: values.departmentId as string,
        bedId: values.bedId as string,
      });
      message.success('Nhap vien thanh cong');
      setAdmitModal(false);
      admitForm.resetFields();
      fetchAdmissions();
    } catch {
      message.warning('Loi nhap vien');
    }
  };

  const handleSaveVital = async (values: Record<string, unknown>) => {
    if (!selected) return;
    try {
      await inpatientApi.saveVitalSign(selected.id, { ...values, admissionId: selected.id, recordDate: dayjs().toISOString() } as InpatientVitalDto);
      message.success('Luu sinh hieu thanh cong');
      setVitalModal(false);
      const res = await inpatientApi.getVitalSigns(selected.id);
      setVitals(res.data);
    } catch {
      message.warning('Loi luu sinh hieu');
    }
  };

  const handleSaveTreatment = async (values: Record<string, unknown>) => {
    if (!selected) return;
    try {
      await inpatientApi.saveTreatmentSheet(selected.id, {
        admissionId: selected.id,
        recordDate: dayjs().toISOString(),
        dayNumber: values.dayNumber as number,
        clinicalProgress: values.clinicalProgress as string,
        orders: values.orders as string,
        note: values.note as string,
      });
      message.success('Luu phieu dieu tri thanh cong');
      setTreatmentModal(false);
      const res = await inpatientApi.getTreatmentSheets(selected.id);
      setTreatments(res.data);
    } catch {
      message.warning('Loi luu phieu dieu tri');
    }
  };

  const handleSaveCare = async (values: Record<string, unknown>) => {
    if (!selected) return;
    try {
      await inpatientApi.saveCareSheet(selected.id, {
        admissionId: selected.id,
        recordDate: dayjs().toISOString(),
        shift: values.shift as string,
        patientCondition: values.patientCondition as string,
        nursingAssessment: values.nursingAssessment as string,
        interventions: values.interventions as string,
        response: values.response as string,
      });
      message.success('Luu phieu cham soc thanh cong');
      setCareModal(false);
      const res = await inpatientApi.getCareSheets(selected.id);
      setCareSheets(res.data);
    } catch {
      message.warning('Loi luu phieu cham soc');
    }
  };

  const handleDischarge = async (values: Record<string, unknown>) => {
    if (!selected) return;
    try {
      await inpatientApi.discharge(selected.id, {
        dischargeDiagnosis: values.dischargeDiagnosis as string,
        dischargeStatus: values.dischargeStatus as number,
      });
      message.success('Xuat vien thanh cong');
      setDischargeModal(false);
      setSelected(null);
      fetchAdmissions();
    } catch {
      message.warning('Loi xuat vien');
    }
  };

  const columns: ColumnsType<AdmissionDto> = [
    { title: 'Ho ten', dataIndex: 'patientName', width: 150 },
    { title: 'Ngay nhap', dataIndex: 'admissionDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Khoa', dataIndex: 'departmentName', width: 100 },
    { title: 'Giuong', dataIndex: 'bedName', width: 80 },
    { title: 'BS', dataIndex: 'attendingDoctorName', width: 120 },
    {
      title: 'Trang thai', dataIndex: 'status', width: 100,
      render: (v: number) => v === 0 ? <Tag color="blue">Dang dieu tri</Tag> : v === 1 ? <Tag color="green">Da xuat vien</Tag> : <Tag>Chuyen vien</Tag>,
    },
  ];

  return (
    <Spin spinning={loading}>
      <Card
        title="Quan ly noi tru"
        extra={
          <Space>
            <Select placeholder="Trang thai" allowClear style={{ width: 140 }} value={statusFilter} onChange={setStatusFilter}
              options={[{ value: 0, label: 'Dang dieu tri' }, { value: 1, label: 'Da xuat vien' }]}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { admitForm.resetFields(); setAdmitModal(true); }}>Nhap vien</Button>
            <Button icon={<ReloadOutlined />} onClick={fetchAdmissions} />
          </Space>
        }
      >
        <Row gutter={16}>
          <Col xs={24} lg={10}>
            <Table columns={columns} dataSource={admissions} rowKey="id" size="small"
              pagination={{ total, pageSize: 30 }}
              onRow={(r) => ({ onClick: () => handleSelect(r), style: { cursor: 'pointer', background: selected?.id === r.id ? '#e6f7ff' : undefined } })}
              scroll={{ x: 750 }}
            />
          </Col>
          <Col xs={24} lg={14}>
            {selected ? (
              <Card size="small" title={selected.patientName}
                extra={
                  <Space>
                    {selected.status === 0 && <Button danger size="small" onClick={() => { dischargeForm.resetFields(); setDischargeModal(true); }}>Xuat vien</Button>}
                  </Space>
                }
              >
                <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
                  {
                    key: 'info', label: 'Thong tin',
                    children: (
                      <Descriptions column={2} size="small">
                        <Descriptions.Item label="Ngay nhap">{dayjs(selected.admissionDate).format('DD/MM/YYYY')}</Descriptions.Item>
                        <Descriptions.Item label="Khoa">{selected.departmentName}</Descriptions.Item>
                        <Descriptions.Item label="Giuong">{selected.bedName}</Descriptions.Item>
                        <Descriptions.Item label="BS dieu tri">{selected.attendingDoctorName}</Descriptions.Item>
                        <Descriptions.Item label="Chan doan">{selected.admissionDiagnosis}</Descriptions.Item>
                        <Descriptions.Item label="Ly do">{selected.admissionReason}</Descriptions.Item>
                      </Descriptions>
                    ),
                  },
                  {
                    key: 'vitals', label: 'Sinh hieu',
                    children: (
                      <div>
                        <Button size="small" type="primary" onClick={() => { vitalForm.resetFields(); setVitalModal(true); }} style={{ marginBottom: 8 }}>+ Ghi nhan</Button>
                        <Table dataSource={vitals} rowKey="id" size="small" pagination={false} columns={[
                          { title: 'Thoi gian', dataIndex: 'recordDate', render: (v: string) => dayjs(v).format('DD/MM HH:mm') },
                          { title: 'Nhiet do', dataIndex: 'temperature' },
                          { title: 'Mach', dataIndex: 'heartRate' },
                          { title: 'HA', render: (_: unknown, r: InpatientVitalDto) => r.bloodPressureSystolic ? `${r.bloodPressureSystolic}/${r.bloodPressureDiastolic}` : '' },
                          { title: 'SpO2', dataIndex: 'spo2' },
                        ]} />
                      </div>
                    ),
                  },
                  {
                    key: 'treatment', label: 'Phieu dieu tri',
                    children: (
                      <div>
                        <Button size="small" type="primary" onClick={() => { treatmentForm.resetFields(); setTreatmentModal(true); }} style={{ marginBottom: 8 }}>+ Them</Button>
                        <Table dataSource={treatments} rowKey="id" size="small" pagination={false} columns={[
                          { title: 'Ngay', dataIndex: 'recordDate', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                          { title: 'Ngay thu', dataIndex: 'dayNumber', width: 60 },
                          { title: 'Dien bien', dataIndex: 'clinicalProgress' },
                          { title: 'Y lenh', dataIndex: 'orders' },
                        ]} />
                      </div>
                    ),
                  },
                  {
                    key: 'care', label: 'Cham soc',
                    children: (
                      <div>
                        <Button size="small" type="primary" onClick={() => { careForm.resetFields(); setCareModal(true); }} style={{ marginBottom: 8 }}>+ Them</Button>
                        <Table dataSource={careSheets} rowKey="id" size="small" pagination={false} columns={[
                          { title: 'Ngay', dataIndex: 'recordDate', render: (v: string) => dayjs(v).format('DD/MM HH:mm') },
                          { title: 'Ca', dataIndex: 'shift', width: 60 },
                          { title: 'Tinh trang', dataIndex: 'patientCondition' },
                          { title: 'Can thiep', dataIndex: 'interventions' },
                        ]} />
                      </div>
                    ),
                  },
                ]} />
              </Card>
            ) : <Card style={{ textAlign: 'center', padding: 40 }}><p style={{ color: '#999' }}>Chon benh nhan tu danh sach</p></Card>}
          </Col>
        </Row>
      </Card>

      <Modal title="Nhap vien" open={admitModal} onCancel={() => setAdmitModal(false)} onOk={() => admitForm.submit()} okText="Nhap vien">
        <Form form={admitForm} layout="vertical" onFinish={handleAdmit}>
          <Form.Item name="patientId" label="Ma benh nhan" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="departmentId" label="Khoa" rules={[{ required: true }]}><Select options={[{ value: 'dept-1', label: 'Noi' }, { value: 'dept-2', label: 'Ngoai' }, { value: 'dept-3', label: 'San' }, { value: 'dept-4', label: 'Nhi' }]} /></Form.Item>
          <Form.Item name="bedId" label="Giuong"><Input /></Form.Item>
          <Form.Item name="admissionDiagnosis" label="Chan doan nhap vien" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="admissionReason" label="Ly do nhap vien" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Ghi nhan sinh hieu" open={vitalModal} onCancel={() => setVitalModal(false)} onOk={() => vitalForm.submit()} okText="Luu">
        <Form form={vitalForm} layout="vertical" onFinish={handleSaveVital}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="temperature" label="Nhiet do (C)"><InputNumber style={{ width: '100%' }} step={0.1} /></Form.Item></Col>
            <Col span={12}><Form.Item name="heartRate" label="Mach (l/p)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="bloodPressureSystolic" label="HA tam thu"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="bloodPressureDiastolic" label="HA tam truong"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="spo2" label="SpO2 (%)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="weight" label="Can nang (kg)"><InputNumber style={{ width: '100%' }} step={0.1} /></Form.Item></Col>
          </Row>
          <Form.Item name="note" label="Ghi chu"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Phieu dieu tri" open={treatmentModal} onCancel={() => setTreatmentModal(false)} onOk={() => treatmentForm.submit()} okText="Luu">
        <Form form={treatmentForm} layout="vertical" onFinish={handleSaveTreatment}>
          <Form.Item name="dayNumber" label="Ngay thu" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} /></Form.Item>
          <Form.Item name="clinicalProgress" label="Dien bien lam sang" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="orders" label="Y lenh" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="note" label="Ghi chu"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Phieu cham soc" open={careModal} onCancel={() => setCareModal(false)} onOk={() => careForm.submit()} okText="Luu">
        <Form form={careForm} layout="vertical" onFinish={handleSaveCare}>
          <Form.Item name="shift" label="Ca truc" rules={[{ required: true }]}><Select options={[{ value: 'Sang', label: 'Sang' }, { value: 'Chieu', label: 'Chieu' }, { value: 'Dem', label: 'Dem' }]} /></Form.Item>
          <Form.Item name="patientCondition" label="Tinh trang BN" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="nursingAssessment" label="Nhan dinh dieu duong"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="interventions" label="Can thiep" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="response" label="Dap ung"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Xuat vien" open={dischargeModal} onCancel={() => setDischargeModal(false)} onOk={() => dischargeForm.submit()} okText="Xuat vien" okButtonProps={{ danger: true }}>
        <Form form={dischargeForm} layout="vertical" onFinish={handleDischarge}>
          <Form.Item name="dischargeDiagnosis" label="Chan doan xuat vien" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="dischargeStatus" label="Tinh trang ra vien" rules={[{ required: true }]}>
            <Select options={[{ value: 1, label: 'Khoi' }, { value: 2, label: 'Do giam' }, { value: 3, label: 'Khong thay doi' }, { value: 4, label: 'Nang hon' }, { value: 5, label: 'Tu vong' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
