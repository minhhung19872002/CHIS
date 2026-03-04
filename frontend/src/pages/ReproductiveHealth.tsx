import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, InputNumber, Descriptions } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { reproductiveHealthApi } from '../api/reproductiveHealth';
import type { PrenatalRecordDto, DeliveryRecordDto, FamilyPlanningDto } from '../api/reproductiveHealth';

export default function ReproductiveHealth() {
  const [loading, setLoading] = useState(false);
  const [prenatalRecords, setPrenatalRecords] = useState<PrenatalRecordDto[]>([]);
  const [prTotal, setPrTotal] = useState(0);
  const [deliveries, setDeliveries] = useState<DeliveryRecordDto[]>([]);
  const [familyPlanning, setFamilyPlanning] = useState<FamilyPlanningDto[]>([]);
  const [selected, setSelected] = useState<PrenatalRecordDto | null>(null);
  const [prenatalModal, setPrenatalModal] = useState(false);
  const [visitModal, setVisitModal] = useState(false);
  const [deliveryModal, setDeliveryModal] = useState(false);
  const [fpModal, setFpModal] = useState(false);
  const [prenatalForm] = Form.useForm();
  const [visitForm] = Form.useForm();
  const [deliveryForm] = Form.useForm();
  const [fpForm] = Form.useForm();

  const fetchPrenatal = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reproductiveHealthApi.getPrenatalRecords({ pageSize: 30 });
      setPrenatalRecords(res.data.items); setPrTotal(res.data.total);
    } catch { setPrenatalRecords([]); } finally { setLoading(false); }
  }, []);

  const fetchDeliveries = useCallback(async () => {
    try { const res = await reproductiveHealthApi.getDeliveries({ pageSize: 30 }); setDeliveries(res.data.items); } catch { setDeliveries([]); }
  }, []);

  const fetchFP = useCallback(async () => {
    try { const res = await reproductiveHealthApi.getFamilyPlanning({ pageSize: 30 }); setFamilyPlanning(res.data.items); } catch { setFamilyPlanning([]); }
  }, []);

  useEffect(() => { fetchPrenatal(); fetchDeliveries(); fetchFP(); }, [fetchPrenatal, fetchDeliveries, fetchFP]);

  const handleCreatePrenatal = async (values: Record<string, unknown>) => {
    try {
      await reproductiveHealthApi.createPrenatal({
        patientId: values.patientId as string,
        lastPeriodDate: (values.lastPeriodDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        gravida: values.gravida as number,
        para: values.para as number,
        riskLevel: values.riskLevel as number,
      } as Partial<PrenatalRecordDto>);
      message.success('Tao so kham thai thanh cong');
      setPrenatalModal(false); prenatalForm.resetFields(); fetchPrenatal();
    } catch { message.warning('Loi tao so kham thai'); }
  };

  const handleAddVisit = async (values: Record<string, unknown>) => {
    if (!selected) return;
    try {
      await reproductiveHealthApi.addPrenatalVisit(selected.id, {
        visitDate: dayjs().format('YYYY-MM-DD'),
        gestationalWeek: values.gestationalWeek as number,
        weight: values.weight as number,
        bloodPressureSystolic: values.bloodPressureSystolic as number,
        bloodPressureDiastolic: values.bloodPressureDiastolic as number,
        fundalHeight: values.fundalHeight as number,
        fetalHeartRate: values.fetalHeartRate as number,
        note: values.note as string,
      });
      message.success('Ghi nhan kham thai thanh cong');
      setVisitModal(false); visitForm.resetFields();
    } catch { message.warning('Loi ghi nhan'); }
  };

  const handleDelivery = async (values: Record<string, unknown>) => {
    try {
      await reproductiveHealthApi.recordDelivery({
        patientName: values.patientName as string,
        deliveryDate: (values.deliveryDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        gestationalAge: values.gestationalAge as number,
        deliveryMethod: values.deliveryMethod as string,
        outcome: values.outcome as string,
        birthWeight: values.birthWeight as number,
        apgarScore1: values.apgarScore1 as number,
        apgarScore5: values.apgarScore5 as number,
        complications: values.complications as string,
        attendantName: values.attendantName as string,
      });
      message.success('Ghi nhan de thanh cong');
      setDeliveryModal(false); deliveryForm.resetFields(); fetchDeliveries();
    } catch { message.warning('Loi ghi nhan'); }
  };

  const handleCreateFP = async (values: Record<string, unknown>) => {
    try {
      await reproductiveHealthApi.createFamilyPlanning({
        patientId: values.patientId as string,
        method: values.method as string,
        startDate: (values.startDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
      } as Partial<FamilyPlanningDto>);
      message.success('Ghi nhan KHHGD thanh cong');
      setFpModal(false); fpForm.resetFields(); fetchFP();
    } catch { message.warning('Loi ghi nhan'); }
  };

  const prenatalColumns: ColumnsType<PrenatalRecordDto> = [
    { title: 'Ho ten', dataIndex: 'patientName', width: 150 },
    { title: 'Tuoi thai', dataIndex: 'gestationalAge', width: 80, render: (v: number) => `${v} tuan` },
    { title: 'Ngay du kien', dataIndex: 'expectedDueDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'So lan kham', width: 80, render: (_: unknown, r: PrenatalRecordDto) => r.visits?.length || 0 },
    { title: 'Nguy co', dataIndex: 'riskLevel', width: 80, render: (v: number) => v >= 2 ? <Tag color="red">Cao</Tag> : v === 1 ? <Tag color="orange">TB</Tag> : <Tag color="green">Thap</Tag> },
    { title: 'Trang thai', dataIndex: 'status', width: 90, render: (v: number) => v === 0 ? <Tag color="blue">Dang TD</Tag> : <Tag color="green">Da de</Tag> },
    {
      title: '', width: 100,
      render: (_: unknown, r: PrenatalRecordDto) => (
        <Button size="small" type="primary" onClick={() => { setSelected(r); visitForm.resetFields(); setVisitModal(true); }}>Kham</Button>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'prenatal', label: 'Kham thai',
          children: (
            <Card extra={<Space><Button type="primary" icon={<PlusOutlined />} onClick={() => { prenatalForm.resetFields(); setPrenatalModal(true); }}>Tao so</Button><Button icon={<ReloadOutlined />} onClick={fetchPrenatal} /></Space>}>
              <Table columns={prenatalColumns} dataSource={prenatalRecords} rowKey="id" size="small" pagination={{ total: prTotal, pageSize: 30 }} scroll={{ x: 790 }} />
            </Card>
          ),
        },
        {
          key: 'delivery', label: 'De',
          children: (
            <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { deliveryForm.resetFields(); setDeliveryModal(true); }}>Ghi nhan</Button>}>
              <Table dataSource={deliveries} rowKey="id" size="small" pagination={{ pageSize: 20 }} columns={[
                { title: 'San phu', dataIndex: 'patientName' },
                { title: 'Ngay de', dataIndex: 'deliveryDate', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                { title: 'Phuong phap', dataIndex: 'deliveryMethod' },
                { title: 'Ket qua', dataIndex: 'outcome' },
                { title: 'Can nang (g)', dataIndex: 'birthWeight' },
                { title: 'Apgar 1p', dataIndex: 'apgarScore1' },
                { title: 'Apgar 5p', dataIndex: 'apgarScore5' },
                { title: 'Bien chung', dataIndex: 'complications' },
              ]} />
            </Card>
          ),
        },
        {
          key: 'fp', label: 'KHHGD',
          children: (
            <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { fpForm.resetFields(); setFpModal(true); }}>Them</Button>}>
              <Table dataSource={familyPlanning} rowKey="id" size="small" pagination={{ pageSize: 20 }} columns={[
                { title: 'Ho ten', dataIndex: 'patientName' },
                { title: 'Bien phap', dataIndex: 'method' },
                { title: 'Bat dau', dataIndex: 'startDate', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                { title: 'Trang thai', dataIndex: 'status', render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v}</Tag> },
                { title: 'Tai kham', dataIndex: 'nextVisitDate', render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
              ]} />
            </Card>
          ),
        },
        { key: 'gynecology', label: 'Phu khoa', children: <Card title="Quan ly phu khoa"><p>Danh sach kham phu khoa dinh ky.</p></Card> },
      ]} />

      <Modal title="Tao so kham thai" open={prenatalModal} onCancel={() => setPrenatalModal(false)} onOk={() => prenatalForm.submit()} okText="Luu">
        <Form form={prenatalForm} layout="vertical" onFinish={handleCreatePrenatal}>
          <Form.Item name="patientId" label="Ma benh nhan" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="lastPeriodDate" label="Kinh cuoi" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={6}><Form.Item name="gravida" label="So lan mang thai"><InputNumber style={{ width: '100%' }} min={1} /></Form.Item></Col>
            <Col span={6}><Form.Item name="para" label="So lan de"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
          </Row>
          <Form.Item name="riskLevel" label="Muc do nguy co"><Select options={[{ value: 0, label: 'Thap' }, { value: 1, label: 'Trung binh' }, { value: 2, label: 'Cao' }]} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Kham thai" open={visitModal} onCancel={() => setVisitModal(false)} onOk={() => visitForm.submit()} okText="Luu">
        <Form form={visitForm} layout="vertical" onFinish={handleAddVisit}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="gestationalWeek" label="Tuan thai" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="weight" label="Can nang (kg)"><InputNumber style={{ width: '100%' }} step={0.1} /></Form.Item></Col>
            <Col span={8}><Form.Item name="fundalHeight" label="Chieu cao tu cung"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="bloodPressureSystolic" label="HA tam thu"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="bloodPressureDiastolic" label="HA tam truong"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="fetalHeartRate" label="Tim thai"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="note" label="Ghi chu"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Ghi nhan de" open={deliveryModal} onCancel={() => setDeliveryModal(false)} onOk={() => deliveryForm.submit()} okText="Luu" width={600}>
        <Form form={deliveryForm} layout="vertical" onFinish={handleDelivery}>
          <Form.Item name="patientName" label="Ho ten san phu" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="deliveryDate" label="Ngay de" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="gestationalAge" label="Tuoi thai (tuan)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="birthWeight" label="Can nang (g)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="deliveryMethod" label="Phuong phap" rules={[{ required: true }]}><Select options={[{ value: 'Thuong', label: 'De thuong' }, { value: 'Mo', label: 'Mo lay thai' }, { value: 'Giup', label: 'Can thiep' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="outcome" label="Ket qua" rules={[{ required: true }]}><Select options={[{ value: 'Song', label: 'Song' }, { value: 'Chet', label: 'Chet' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="attendantName" label="Nguoi do" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="apgarScore1" label="Apgar 1 phut"><InputNumber style={{ width: '100%' }} min={0} max={10} /></Form.Item></Col>
            <Col span={12}><Form.Item name="apgarScore5" label="Apgar 5 phut"><InputNumber style={{ width: '100%' }} min={0} max={10} /></Form.Item></Col>
          </Row>
          <Form.Item name="complications" label="Bien chung"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Dang ky KHHGD" open={fpModal} onCancel={() => setFpModal(false)} onOk={() => fpForm.submit()} okText="Luu">
        <Form form={fpForm} layout="vertical" onFinish={handleCreateFP}>
          <Form.Item name="patientId" label="Ma benh nhan" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="method" label="Bien phap" rules={[{ required: true }]}>
            <Select options={[{ value: 'Vong tranh thai', label: 'Vong tranh thai' }, { value: 'Thuoc uong', label: 'Thuoc uong' }, { value: 'Bao cao su', label: 'Bao cao su' }, { value: 'Tiem', label: 'Tiem tranh thai' }, { value: 'Triet san', label: 'Triet san' }, { value: 'Que cam', label: 'Que cam da' }]} />
          </Form.Item>
          <Form.Item name="startDate" label="Ngay bat dau" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
