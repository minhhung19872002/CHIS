import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, Row, Col, Tag, Spin, message, Space, InputNumber, Radio } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, PrinterOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { patientApi } from '../api/patient';
import type { PatientDto } from '../api/patient';
import { examinationApi } from '../api/examination';

interface QueueItem {
  id: string;
  ticketNumber: number;
  patientName: string;
  patientCode: string;
  roomName: string;
  status: number;
  registrationTime: string;
  insuranceNumber?: string;
  patientType: number;
}

export default function Reception() {
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [registerModal, setRegisterModal] = useState(false);
  const [searchModal, setSearchModal] = useState(false);
  const [patients, setPatients] = useState<PatientDto[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientDto | null>(null);
  const [form] = Form.useForm();
  const [registerForm] = Form.useForm();

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await examinationApi.getQueueList();
      setQueue(res.data as QueueItem[]);
    } catch {
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const searchPatients = async () => {
    if (!searchKeyword.trim()) return;
    try {
      const res = await patientApi.search({ keyword: searchKeyword, pageSize: 20 });
      setPatients(res.data.items);
    } catch {
      message.warning('Khong the tim kiem benh nhan');
    }
  };

  const handleSelectPatient = (p: PatientDto) => {
    setSelectedPatient(p);
    registerForm.setFieldsValue({
      fullName: p.fullName,
      dateOfBirth: p.dateOfBirth ? dayjs(p.dateOfBirth) : undefined,
      gender: p.gender,
      phoneNumber: p.phoneNumber,
      address: p.address,
      insuranceNumber: p.insuranceNumber,
      idNumber: p.idNumber,
    });
    setSearchModal(false);
    setRegisterModal(true);
  };

  const handleRegister = async (values: Record<string, unknown>) => {
    try {
      let patientId = selectedPatient?.id;
      if (!patientId) {
        const res = await patientApi.create({
          fullName: values.fullName as string,
          dateOfBirth: (values.dateOfBirth as dayjs.Dayjs)?.format('YYYY-MM-DD'),
          gender: values.gender as number,
          phoneNumber: values.phoneNumber as string,
          address: values.address as string,
          insuranceNumber: values.insuranceNumber as string,
          idNumber: values.idNumber as string,
        });
        patientId = res.data.id;
      }
      await examinationApi.create({
        patientId,
        examDate: dayjs().format('YYYY-MM-DD'),
        roomId: values.roomId as string,
        patientType: values.patientType as number,
        chiefComplaint: values.chiefComplaint as string,
      });
      message.success('Dang ky kham thanh cong');
      setRegisterModal(false);
      registerForm.resetFields();
      setSelectedPatient(null);
      fetchQueue();
    } catch {
      message.warning('Loi dang ky kham');
    }
  };

  const columns: ColumnsType<QueueItem> = [
    { title: 'STT', dataIndex: 'ticketNumber', width: 60, align: 'center' },
    { title: 'Ma BN', dataIndex: 'patientCode', width: 100 },
    { title: 'Ho ten', dataIndex: 'patientName', width: 180 },
    { title: 'Phong', dataIndex: 'roomName', width: 120 },
    {
      title: 'Doi tuong', dataIndex: 'patientType', width: 100,
      render: (v: number) => v === 1 ? <Tag color="green">BHYT</Tag> : v === 2 ? <Tag color="blue">Thu phi</Tag> : <Tag>Mien phi</Tag>,
    },
    { title: 'So BHYT', dataIndex: 'insuranceNumber', width: 140 },
    {
      title: 'Gio dang ky', dataIndex: 'registrationTime', width: 100,
      render: (v: string) => v ? dayjs(v).format('HH:mm') : '',
    },
    {
      title: 'Trang thai', dataIndex: 'status', width: 100,
      render: (v: number) => v === 0 ? <Tag color="orange">Cho</Tag> : v === 1 ? <Tag color="blue">Dang kham</Tag> : <Tag color="green">Xong</Tag>,
    },
    {
      title: '', width: 80,
      render: (_: unknown, record: QueueItem) => (
        <Button size="small" icon={<PrinterOutlined />} onClick={() => message.info(`In phieu: ${record.ticketNumber}`)}>In</Button>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Card
        title="Tiep don benh nhan"
        extra={
          <Space>
            <Button icon={<SearchOutlined />} onClick={() => setSearchModal(true)}>Tim BN</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setSelectedPatient(null); registerForm.resetFields(); setRegisterModal(true); }}>Dang ky kham</Button>
            <Button icon={<ReloadOutlined />} onClick={fetchQueue} />
          </Space>
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}><Card><Statistic title="Tong dang ky" value={queue.length} /></Card></Col>
          <Col span={6}><Card><Statistic title="Dang cho" value={queue.filter(q => q.status === 0).length} /></Card></Col>
          <Col span={6}><Card><Statistic title="Dang kham" value={queue.filter(q => q.status === 1).length} /></Card></Col>
          <Col span={6}><Card><Statistic title="Hoan thanh" value={queue.filter(q => q.status === 2).length} /></Card></Col>
        </Row>

        <Table columns={columns} dataSource={queue} rowKey="id" pagination={{ pageSize: 20 }} size="small" scroll={{ x: 960 }} />
      </Card>

      <Modal title="Tim kiem benh nhan" open={searchModal} onCancel={() => setSearchModal(false)} footer={null} width={700}>
        <Space style={{ width: '100%', marginBottom: 16 }}>
          <Input placeholder="Ho ten / Ma BN / CCCD / SĐT" value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} onPressEnter={searchPatients} style={{ width: 400 }} />
          <Button type="primary" icon={<SearchOutlined />} onClick={searchPatients}>Tim</Button>
        </Space>
        <Table
          dataSource={patients}
          rowKey="id"
          size="small"
          pagination={false}
          onRow={(record) => ({ onClick: () => handleSelectPatient(record), style: { cursor: 'pointer' } })}
          columns={[
            { title: 'Ma BN', dataIndex: 'code', width: 100 },
            { title: 'Ho ten', dataIndex: 'fullName' },
            { title: 'Ngay sinh', dataIndex: 'dateOfBirth', render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
            { title: 'Gioi tinh', dataIndex: 'gender', render: (v: number) => v === 1 ? 'Nam' : v === 2 ? 'Nu' : '' },
            { title: 'SDT', dataIndex: 'phoneNumber' },
          ]}
        />
      </Modal>

      <Modal title="Dang ky kham benh" open={registerModal} onCancel={() => setRegisterModal(false)} onOk={() => registerForm.submit()} width={800} okText="Dang ky">
        <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fullName" label="Ho va ten" rules={[{ required: true, message: 'Nhap ho ten' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="dateOfBirth" label="Ngay sinh" rules={[{ required: true, message: 'Chon ngay sinh' }]}>
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="gender" label="Gioi tinh" rules={[{ required: true }]}>
                <Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nu' }]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="idNumber" label="So CCCD">
                <Input maxLength={12} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="phoneNumber" label="So dien thoai">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="insuranceNumber" label="So the BHYT">
                <Input maxLength={15} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="address" label="Dia chi">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="patientType" label="Doi tuong" rules={[{ required: true }]}>
                <Radio.Group>
                  <Radio value={1}>BHYT</Radio>
                  <Radio value={2}>Thu phi</Radio>
                  <Radio value={3}>Mien phi</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="roomId" label="Phong kham" rules={[{ required: true, message: 'Chon phong kham' }]}>
                <Select placeholder="Chon phong" options={[
                  { value: 'room-1', label: 'Phong kham 1' },
                  { value: 'room-2', label: 'Phong kham 2' },
                  { value: 'room-3', label: 'Phong kham YHCT' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Uu tien">
                <InputNumber min={0} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="chiefComplaint" label="Ly do kham">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}

function Statistic({ title, value }: { title: string; value: number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#1890ff' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#666' }}>{title}</div>
    </div>
  );
}
