import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, InputNumber, Descriptions } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { hivAidsApi } from '../api/hivAids';
import type { HivPatientDto, ArvRecordDto } from '../api/hivAids';

export default function HivAids() {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<HivPatientDto[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<HivPatientDto | null>(null);
  const [arvHistory, setArvHistory] = useState<ArvRecordDto[]>([]);
  const [keyword, setKeyword] = useState('');
  const [registerModal, setRegisterModal] = useState(false);
  const [arvModal, setArvModal] = useState(false);
  const [registerForm] = Form.useForm();
  const [arvForm] = Form.useForm();

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try { const res = await hivAidsApi.getPatients({ keyword, pageSize: 30 }); setPatients(res.data.items); setTotal(res.data.total); } catch { setPatients([]); } finally { setLoading(false); }
  }, [keyword]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const handleSelect = async (p: HivPatientDto) => {
    setSelected(p);
    try { const res = await hivAidsApi.getArvHistory(p.id); setArvHistory(res.data); } catch { setArvHistory([]); }
  };

  const handleRegister = async (values: Record<string, unknown>) => {
    try {
      await hivAidsApi.register({
        patientId: values.patientId as string,
        diagnosisDate: (values.diagnosisDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        clinicalStage: values.clinicalStage as number,
        arvRegimen: values.arvRegimen as string,
      } as Partial<HivPatientDto>);
      message.success('Dang ky quan ly thanh cong');
      setRegisterModal(false); registerForm.resetFields(); fetchPatients();
    } catch { message.warning('Loi dang ky'); }
  };

  const handleArvDispense = async (values: Record<string, unknown>) => {
    if (!selected) return;
    try {
      await hivAidsApi.recordArvDispensing({
        patientId: selected.id,
        regimen: values.regimen as string,
        startDate: (values.startDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        dispensedDate: dayjs().format('YYYY-MM-DD'),
        dispensedDays: values.dispensedDays as number,
        cd4: values.cd4 as number,
        viralLoad: values.viralLoad as number,
        adherence: values.adherence as string,
      });
      message.success('Cap phat ARV thanh cong');
      setArvModal(false); arvForm.resetFields(); handleSelect(selected);
    } catch { message.warning('Loi cap phat ARV'); }
  };

  const columns: ColumnsType<HivPatientDto> = [
    { title: 'Ho ten', dataIndex: 'patientName', width: 140 },
    { title: 'Ngay CD', dataIndex: 'diagnosisDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Giai doan', dataIndex: 'clinicalStage', width: 70, render: (v: number) => <Tag color={v >= 3 ? 'red' : 'blue'}>{v}</Tag> },
    { title: 'CD4', dataIndex: 'cd4Count', width: 60 },
    { title: 'Phac do ARV', dataIndex: 'arvRegimen', width: 120 },
    { title: 'Tuan thu (%)', dataIndex: 'adherenceRate', width: 80 },
    { title: 'Trang thai', dataIndex: 'status', width: 90, render: (v: number) => v === 0 ? <Tag color="green">Dang DT</Tag> : v === 1 ? <Tag color="orange">Bo tri</Tag> : <Tag color="red">Tu vong</Tag> },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'patients', label: 'Benh nhan HIV',
          children: (
            <Row gutter={16}>
              <Col xs={24} lg={12}>
                <Card size="small" extra={<Space>
                  <Input placeholder="Tim kiem..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchPatients()} style={{ width: 180 }} />
                  <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => { registerForm.resetFields(); setRegisterModal(true); }}>Them</Button>
                </Space>}>
                  <Table columns={columns} dataSource={patients} rowKey="id" size="small" pagination={{ total, pageSize: 30 }}
                    onRow={r => ({ onClick: () => handleSelect(r), style: { cursor: 'pointer', background: selected?.id === r.id ? '#e6f7ff' : undefined } })} scroll={{ x: 760 }} />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                {selected ? (
                  <Card size="small" title={selected.patientName} extra={<Button type="primary" size="small" onClick={() => { arvForm.resetFields(); setArvModal(true); }}>Cap ARV</Button>}>
                    <Descriptions size="small" column={2}>
                      <Descriptions.Item label="Giai doan">{selected.clinicalStage}</Descriptions.Item>
                      <Descriptions.Item label="CD4">{selected.cd4Count}</Descriptions.Item>
                      <Descriptions.Item label="Tai luong virus">{selected.viralLoad}</Descriptions.Item>
                      <Descriptions.Item label="Phac do">{selected.arvRegimen}</Descriptions.Item>
                    </Descriptions>
                    <Card size="small" title="Lich su ARV" style={{ marginTop: 12 }}>
                      <Table dataSource={arvHistory} rowKey="id" size="small" pagination={false} columns={[
                        { title: 'Ngay cap', dataIndex: 'dispensedDate', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                        { title: 'Phac do', dataIndex: 'regimen' },
                        { title: 'So ngay', dataIndex: 'dispensedDays' },
                        { title: 'CD4', dataIndex: 'cd4' },
                        { title: 'Tuan thu', dataIndex: 'adherence' },
                      ]} />
                    </Card>
                    {selected.familyMembers?.length > 0 && (
                      <Card size="small" title="Gia dinh" style={{ marginTop: 12 }}>
                        <Table dataSource={selected.familyMembers} rowKey="id" size="small" pagination={false} columns={[
                          { title: 'Ho ten', dataIndex: 'fullName' },
                          { title: 'Quan he', dataIndex: 'relationship' },
                          { title: 'Tinh trang HIV', dataIndex: 'hivStatus' },
                          { title: 'Dang ARV', dataIndex: 'onArv', render: (v: boolean) => v ? 'Co' : 'Khong' },
                        ]} />
                      </Card>
                    )}
                  </Card>
                ) : <Card style={{ textAlign: 'center', padding: 40 }}><p style={{ color: '#999' }}>Chon benh nhan</p></Card>}
              </Col>
            </Row>
          ),
        },
        { key: 'reports', label: 'Bao cao', children: <Card title="Bao cao HIV/AIDS"><Space><Button>Bao cao quy</Button><Button>Bao cao nam</Button></Space></Card> },
      ]} />

      <Modal title="Dang ky quan ly HIV" open={registerModal} onCancel={() => setRegisterModal(false)} onOk={() => registerForm.submit()} okText="Dang ky">
        <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
          <Form.Item name="patientId" label="Ma benh nhan" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="diagnosisDate" label="Ngay chan doan" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="clinicalStage" label="Giai doan lam sang" rules={[{ required: true }]}><Select options={[{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }]} /></Form.Item></Col>
          </Row>
          <Form.Item name="arvRegimen" label="Phac do ARV"><Input placeholder="TDF + 3TC + DTG" /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Cap phat ARV" open={arvModal} onCancel={() => setArvModal(false)} onOk={() => arvForm.submit()} okText="Luu">
        <Form form={arvForm} layout="vertical" onFinish={handleArvDispense}>
          <Form.Item name="regimen" label="Phac do" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="startDate" label="Ngay bat dau" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="dispensedDays" label="So ngay cap" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="cd4" label="CD4"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="viralLoad" label="Tai luong virus"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="adherence" label="Tuan thu" rules={[{ required: true }]}><Select options={[{ value: 'Tot', label: 'Tot' }, { value: 'TB', label: 'Trung binh' }, { value: 'Kem', label: 'Kem' }]} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </Spin>
  );
}
