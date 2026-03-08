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
      message.success('Đăng ký quản lý thành công');
      setRegisterModal(false); registerForm.resetFields(); fetchPatients();
    } catch { message.warning('Lỗi đăng ký'); }
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
      message.success('Cấp phát ARV thành công');
      setArvModal(false); arvForm.resetFields(); handleSelect(selected);
    } catch { message.warning('Lỗi cấp phát ARV'); }
  };

  const columns: ColumnsType<HivPatientDto> = [
    { title: 'Họ tên', dataIndex: 'patientName', width: 140 },
    { title: 'Ngày CĐ', dataIndex: 'diagnosisDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Giai đoạn', dataIndex: 'clinicalStage', width: 75, render: (v: number) => <Tag color={v >= 3 ? 'red' : 'blue'}>{v}</Tag> },
    { title: 'CD4', dataIndex: 'cd4Count', width: 60, align: 'right' },
    { title: 'Phác đồ ARV', dataIndex: 'arvRegimen', width: 120 },
    { title: 'Tuân thủ (%)', dataIndex: 'adherenceRate', width: 85, align: 'right' },
    { title: 'Trạng thái', dataIndex: 'status', width: 90, render: (v: number) => v === 0 ? <Tag color="green">Đang ĐT</Tag> : v === 1 ? <Tag color="orange">Bỏ trị</Tag> : <Tag color="red">Tử vong</Tag> },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'patients', label: 'Bệnh nhân HIV',
          children: (
            <Row gutter={16}>
              <Col xs={24} lg={12}>
                <Card size="small" extra={
                  <Space>
                    <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchPatients()} style={{ width: 180 }} allowClear />
                    <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => { registerForm.resetFields(); setRegisterModal(true); }}>Thêm</Button>
                  </Space>
                }>
                  <Table columns={columns} dataSource={patients} rowKey="id" size="small" pagination={{ total, pageSize: 30 }}
                    onRow={r => ({ onClick: () => handleSelect(r), style: { cursor: 'pointer', background: selected?.id === r.id ? '#e6f7ff' : undefined } })} scroll={{ x: 770 }} />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                {selected ? (
                  <Card size="small" title={selected.patientName} extra={<Button type="primary" size="small" onClick={() => { arvForm.resetFields(); setArvModal(true); }}>Cấp ARV</Button>}>
                    <Descriptions size="small" column={2}>
                      <Descriptions.Item label="Giai đoạn">{selected.clinicalStage}</Descriptions.Item>
                      <Descriptions.Item label="CD4">{selected.cd4Count}</Descriptions.Item>
                      <Descriptions.Item label="Tải lượng virus">{selected.viralLoad}</Descriptions.Item>
                      <Descriptions.Item label="Phác đồ">{selected.arvRegimen}</Descriptions.Item>
                    </Descriptions>
                    <Card size="small" title="Lịch sử ARV" style={{ marginTop: 12 }}>
                      <Table dataSource={arvHistory} rowKey="id" size="small" pagination={false} columns={[
                        { title: 'Ngày cấp', dataIndex: 'dispensedDate', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                        { title: 'Phác đồ', dataIndex: 'regimen' },
                        { title: 'Số ngày', dataIndex: 'dispensedDays', align: 'right' as const },
                        { title: 'CD4', dataIndex: 'cd4', align: 'right' as const },
                        { title: 'Tuân thủ', dataIndex: 'adherence' },
                      ]} />
                    </Card>
                    {selected.familyMembers?.length > 0 && (
                      <Card size="small" title="Gia đình" style={{ marginTop: 12 }}>
                        <Table dataSource={selected.familyMembers} rowKey="id" size="small" pagination={false} columns={[
                          { title: 'Họ tên', dataIndex: 'fullName' },
                          { title: 'Quan hệ', dataIndex: 'relationship' },
                          { title: 'Tình trạng HIV', dataIndex: 'hivStatus' },
                          { title: 'Đang ARV', dataIndex: 'onArv', render: (v: boolean) => v ? 'Có' : 'Không' },
                        ]} />
                      </Card>
                    )}
                  </Card>
                ) : <Card style={{ textAlign: 'center', padding: 40 }}><p style={{ color: '#999' }}>Chọn bệnh nhân để xem chi tiết</p></Card>}
              </Col>
            </Row>
          ),
        },
        {
          key: 'reports', label: 'Báo cáo',
          children: (
            <Card title="Báo cáo HIV/AIDS">
              <Space>
                <DatePicker picker="quarter" placeholder="Chọn quý" />
                <Button type="primary">Báo cáo quý</Button>
                <DatePicker picker="year" placeholder="Chọn năm" />
                <Button>Báo cáo năm</Button>
              </Space>
            </Card>
          ),
        },
      ]} />

      <Modal title="Đăng ký quản lý HIV" open={registerModal} onCancel={() => setRegisterModal(false)} onOk={() => registerForm.submit()} okText="Đăng ký" cancelText="Hủy">
        <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
          <Form.Item name="patientId" label="Mã bệnh nhân" rules={[{ required: true, message: 'Nhập mã bệnh nhân' }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="diagnosisDate" label="Ngày chẩn đoán" rules={[{ required: true, message: 'Chọn ngày' }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="clinicalStage" label="Giai đoạn lâm sàng" rules={[{ required: true, message: 'Chọn giai đoạn' }]}><Select options={[{ value: 1, label: 'Giai đoạn 1' }, { value: 2, label: 'Giai đoạn 2' }, { value: 3, label: 'Giai đoạn 3' }, { value: 4, label: 'Giai đoạn 4' }]} /></Form.Item></Col>
          </Row>
          <Form.Item name="arvRegimen" label="Phác đồ ARV"><Input placeholder="VD: TDF + 3TC + DTG" /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Cấp phát ARV" open={arvModal} onCancel={() => setArvModal(false)} onOk={() => arvForm.submit()} okText="Lưu" cancelText="Hủy">
        <Form form={arvForm} layout="vertical" onFinish={handleArvDispense}>
          <Form.Item name="regimen" label="Phác đồ" rules={[{ required: true, message: 'Nhập phác đồ' }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: 'Chọn ngày' }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="dispensedDays" label="Số ngày cấp" rules={[{ required: true, message: 'Nhập số ngày' }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="cd4" label="CD4"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="viralLoad" label="Tải lượng virus"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="adherence" label="Tuân thủ" rules={[{ required: true, message: 'Chọn mức' }]}><Select options={[{ value: 'Tốt', label: 'Tốt' }, { value: 'TB', label: 'Trung bình' }, { value: 'Kém', label: 'Kém' }]} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </Spin>
  );
}
