import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, Checkbox, Popconfirm } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, AlertOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { communicableDiseaseApi } from '../api/communicableDisease';
import type { DiseaseCaseDto, WeeklyReportDto } from '../api/communicableDisease';

const DISEASE_LIST = [
  { value: 'A09', label: 'Tiêu chảy' }, { value: 'A01', label: 'Thương hàn' },
  { value: 'A90', label: 'Sốt xuất huyết' }, { value: 'B05', label: 'Sởi' },
  { value: 'A37', label: 'Ho gà' }, { value: 'B01', label: 'Thủy đậu' },
  { value: 'A87', label: 'Viêm màng não' }, { value: 'J09', label: 'Cúm' },
  { value: 'A00', label: 'Tả' }, { value: 'B17', label: 'Viêm gan' },
];

export default function CommunicableDisease() {
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState<DiseaseCaseDto[]>([]);
  const [total, setTotal] = useState(0);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReportDto[]>([]);
  const [keyword, setKeyword] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState<string | undefined>(undefined);
  const [caseModal, setCaseModal] = useState(false);
  const [editing, setEditing] = useState<DiseaseCaseDto | null>(null);
  const [caseForm] = Form.useForm();

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await communicableDiseaseApi.getCases({ keyword, diseaseCode: diseaseFilter, pageSize: 30 });
      setCases(res.data.items);
      setTotal(res.data.total);
    } catch { setCases([]); } finally { setLoading(false); }
  }, [keyword, diseaseFilter]);

  const fetchReports = useCallback(async () => {
    try { const res = await communicableDiseaseApi.getWeeklyReports({ year: dayjs().year() }); setWeeklyReports(res.data); } catch { setWeeklyReports([]); }
  }, []);

  useEffect(() => { fetchCases(); fetchReports(); }, [fetchCases, fetchReports]);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      const data = {
        patientName: values.patientName as string,
        dateOfBirth: (values.dateOfBirth as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        gender: values.gender as number, address: values.address as string,
        diseaseCode: values.diseaseCode as string,
        diseaseName: DISEASE_LIST.find(d => d.value === values.diseaseCode)?.label || values.diseaseCode as string,
        onsetDate: (values.onsetDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        reportDate: dayjs().format('YYYY-MM-DD'),
        hospitalized: values.hospitalized as boolean,
        labConfirmed: values.labConfirmed as boolean,
        reportedBy: values.reportedBy as string,
        contactTracing: values.contactTracing as string,
      };
      if (editing) {
        await communicableDiseaseApi.updateCase(editing.id, data);
        message.success('Cập nhật thành công');
      } else {
        await communicableDiseaseApi.reportCase(data);
        message.success('Báo cáo ca bệnh thành công');
      }
      setCaseModal(false); caseForm.resetFields(); setEditing(null); fetchCases();
    } catch { message.warning('Lỗi lưu dữ liệu'); }
  };

  const handleEdit = (record: DiseaseCaseDto) => {
    setEditing(record);
    caseForm.setFieldsValue({
      ...record,
      dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : undefined,
      onsetDate: record.onsetDate ? dayjs(record.onsetDate) : undefined,
    });
    setCaseModal(true);
  };

  const handleDelete = async (id: string) => {
    try { await communicableDiseaseApi.deleteCase(id); message.success('Xóa thành công'); fetchCases(); } catch { message.warning('Lỗi xóa'); }
  };

  const columns: ColumnsType<DiseaseCaseDto> = [
    { title: 'Họ tên', dataIndex: 'patientName', width: 140 },
    { title: 'Bệnh', dataIndex: 'diseaseName', width: 120 },
    { title: 'ICD', dataIndex: 'diseaseCode', width: 60 },
    { title: 'Ngày phát bệnh', dataIndex: 'onsetDate', width: 105, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Nhập viện', dataIndex: 'hospitalized', width: 75, render: (v: boolean) => v ? <Tag color="red">Có</Tag> : <Tag>Không</Tag> },
    { title: 'XN', dataIndex: 'labConfirmed', width: 50, render: (v: boolean) => v ? <Tag color="green">Có</Tag> : <Tag>Không</Tag> },
    { title: 'Kết quả', dataIndex: 'outcome', width: 80 },
    { title: 'Trạng thái', dataIndex: 'status', width: 100, render: (v: number) => v === 0 ? <Tag color="orange">Đang điều tra</Tag> : <Tag color="green">Đã xử lý</Tag> },
    {
      title: '', width: 80, fixed: 'right',
      render: (_: unknown, r: DiseaseCaseDto) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          <Popconfirm title="Xóa ca bệnh này?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const reportColumns: ColumnsType<WeeklyReportDto> = [
    { title: 'Tuần', dataIndex: 'weekNumber', width: 60, align: 'right' },
    { title: 'Năm', dataIndex: 'year', width: 60, align: 'right' },
    { title: 'Ngày nộp', dataIndex: 'submittedDate', width: 100, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
    { title: 'Trạng thái', dataIndex: 'status', width: 100, render: (v: string) => <Tag color={v === 'submitted' ? 'green' : 'orange'}>{v === 'submitted' ? 'Đã nộp' : 'Chưa nộp'}</Tag> },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'cases', label: 'Ca bệnh',
          children: (
            <Card extra={
              <Space>
                <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchCases()} style={{ width: 200 }} allowClear />
                <Select placeholder="Bệnh" allowClear style={{ width: 160 }} options={DISEASE_LIST} value={diseaseFilter} onChange={setDiseaseFilter} />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); caseForm.resetFields(); setCaseModal(true); }}><AlertOutlined /> Báo cáo</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchCases} />
              </Space>
            }>
              <Table columns={columns} dataSource={cases} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 910 }} />
            </Card>
          ),
        },
        {
          key: 'weekly', label: 'Báo cáo tuần',
          children: <Card extra={<Button icon={<ReloadOutlined />} onClick={fetchReports} />}><Table columns={reportColumns} dataSource={weeklyReports} rowKey={(_, i) => String(i)} size="small" pagination={false} /></Card>,
        },
        {
          key: 'monthly', label: 'Báo cáo tháng',
          children: (
            <Card title="Báo cáo bệnh truyền nhiễm hàng tháng">
              <Space>
                <DatePicker picker="month" format="MM/YYYY" placeholder="Chọn tháng" />
                <Button type="primary">Xuất báo cáo</Button>
              </Space>
            </Card>
          ),
        },
      ]} />

      <Modal title={editing ? 'Sửa ca bệnh truyền nhiễm' : 'Báo cáo ca bệnh truyền nhiễm'} open={caseModal} onCancel={() => setCaseModal(false)} onOk={() => caseForm.submit()} okText={editing ? 'Lưu' : 'Báo cáo'} cancelText="Hủy" width={600}>
        <Form form={caseForm} layout="vertical" onFinish={handleSave}>
          <Form.Item name="patientName" label="Họ tên bệnh nhân" rules={[{ required: true, message: 'Nhập họ tên' }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="dateOfBirth" label="Ngày sinh"><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Chọn giới tính' }]}><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nữ' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="diseaseCode" label="Bệnh" rules={[{ required: true, message: 'Chọn bệnh' }]}><Select options={DISEASE_LIST} showSearch /></Form.Item></Col>
          </Row>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Nhập địa chỉ' }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="onsetDate" label="Ngày phát bệnh" rules={[{ required: true, message: 'Chọn ngày' }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="reportedBy" label="Người báo cáo" rules={[{ required: true, message: 'Nhập người báo cáo' }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="hospitalized" valuePropName="checked"><Checkbox>Nhập viện</Checkbox></Form.Item></Col>
            <Col span={12}><Form.Item name="labConfirmed" valuePropName="checked"><Checkbox>Xác nhận xét nghiệm</Checkbox></Form.Item></Col>
          </Row>
          <Form.Item name="contactTracing" label="Điều tra dịch tễ"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
