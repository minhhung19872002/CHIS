import { useState, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Form, Input, Row, Col, DatePicker, Select, InputNumber, Space, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, PrinterOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
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
  const [editing, setEditing] = useState<DriverExamDto | null>(null);
  const [form] = Form.useForm();

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('/driver-license-exam', { params: { keyword, pageSize: 30 } });
      const d = res.data as { items: DriverExamDto[]; total: number };
      setExams(d.items || []); setTotal(d.total || 0);
    } catch { setExams([]); } finally { setLoading(false); }
  }, [keyword]);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      const data = {
        fullName: values.fullName, dateOfBirth: (values.dateOfBirth as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        gender: values.gender, idNumber: values.idNumber, address: values.address,
        licenseClass: values.licenseClass, examDate: editing ? editing.examDate : dayjs().format('YYYY-MM-DD'),
        height: values.height, weight: values.weight,
        bloodPressureSystolic: values.bloodPressureSystolic, bloodPressureDiastolic: values.bloodPressureDiastolic,
        heartRate: values.heartRate, visionLeft: values.visionLeft, visionRight: values.visionRight,
        colorVision: values.colorVision, hearingStatus: values.hearingStatus,
        mentalStatus: values.mentalStatus, neurologicalStatus: values.neurologicalStatus,
        musculoskeletalStatus: values.musculoskeletalStatus, result: values.result,
        doctorName: values.doctorName, note: values.note,
      };
      if (editing) {
        await client.put(`/driver-license-exam/${editing.id}`, data);
        message.success('Cập nhật thành công');
      } else {
        await client.post('/driver-license-exam', data);
        message.success('Lưu kết quả khám thành công');
      }
      setModal(false); form.resetFields(); setEditing(null); fetchExams();
    } catch { message.warning('Lỗi lưu kết quả'); }
  };

  const handleEdit = (record: DriverExamDto) => {
    setEditing(record);
    form.setFieldsValue({ ...record, dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : undefined });
    setModal(true);
  };

  const handleDelete = async (id: string) => {
    try { await client.delete(`/driver-license-exam/${id}`); message.success('Xóa thành công'); fetchExams(); } catch { message.warning('Lỗi xóa'); }
  };

  const columns: ColumnsType<DriverExamDto> = [
    { title: 'Họ tên', dataIndex: 'fullName', width: 150 },
    { title: 'Ngày sinh', dataIndex: 'dateOfBirth', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'CCCD', dataIndex: 'idNumber', width: 120 },
    { title: 'Hạng', dataIndex: 'licenseClass', width: 60 },
    { title: 'Ngày khám', dataIndex: 'examDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'HA', width: 80, render: (_: unknown, r: DriverExamDto) => `${r.bloodPressureSystolic}/${r.bloodPressureDiastolic}` },
    { title: 'Thị lực', width: 80, render: (_: unknown, r: DriverExamDto) => `${r.visionLeft}/${r.visionRight}` },
    { title: 'Kết quả', dataIndex: 'result', width: 90, render: (v: string) => v === 'Dat' ? <Tag color="green">Đạt</Tag> : <Tag color="red">Không đạt</Tag> },
    { title: 'CKS', dataIndex: 'digitalSignature', width: 50, render: (v: boolean) => v ? <Tag color="green">Có</Tag> : null },
    { title: 'BS', dataIndex: 'doctorName', width: 120 },
    {
      title: '', width: 120, fixed: 'right',
      render: (_: unknown, r: DriverExamDto) => (
        <Space size="small">
          <Button size="small" icon={<PrinterOutlined />} />
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          <Popconfirm title="Xóa phiếu khám này?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Card title="Khám sức khỏe lái xe" extra={
        <Space>
          <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchExams()} style={{ width: 200 }} allowClear />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModal(true); }}>Khám mới</Button>
          <Button icon={<ReloadOutlined />} onClick={fetchExams} />
        </Space>
      }>
        <Table columns={columns} dataSource={exams} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 1150 }} />
      </Card>

      <Modal title={editing ? 'Sửa phiếu khám GPLX' : 'Khám sức khỏe lái xe'} open={modal} onCancel={() => setModal(false)} onOk={() => form.submit()} okText="Lưu" cancelText="Hủy" width={800}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="dateOfBirth" label="Ngày sinh" rules={[{ required: true, message: 'Chọn ngày sinh' }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={6}><Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Chọn giới tính' }]}><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nữ' }]} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="idNumber" label="Số CCCD" rules={[{ required: true, message: 'Nhập CCCD' }]}><Input maxLength={12} /></Form.Item></Col>
            <Col span={8}><Form.Item name="licenseClass" label="Hạng GPLX" rules={[{ required: true, message: 'Chọn hạng' }]}><Select options={[{ value: 'A1', label: 'A1' }, { value: 'A2', label: 'A2' }, { value: 'B1', label: 'B1' }, { value: 'B2', label: 'B2' }, { value: 'C', label: 'C' }, { value: 'D', label: 'D' }, { value: 'E', label: 'E' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="doctorName" label="Bác sĩ khám" rules={[{ required: true, message: 'Nhập tên BS' }]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Nhập địa chỉ' }]}><Input /></Form.Item>

          <Card size="small" title="Khám thể lực" style={{ marginBottom: 12 }}>
            <Row gutter={12}>
              <Col span={6}><Form.Item name="height" label="Chiều cao (cm)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={6}><Form.Item name="weight" label="Cân nặng (kg)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} step={0.1} /></Form.Item></Col>
              <Col span={4}><Form.Item name="bloodPressureSystolic" label="HA tâm thu" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={4}><Form.Item name="bloodPressureDiastolic" label="HA tâm trương" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={4}><Form.Item name="heartRate" label="Mạch" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
          </Card>

          <Card size="small" title="Khám chuyên khoa" style={{ marginBottom: 12 }}>
            <Row gutter={12}>
              <Col span={6}><Form.Item name="visionLeft" label="Thị lực trái" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} step={0.1} min={0} max={10} /></Form.Item></Col>
              <Col span={6}><Form.Item name="visionRight" label="Thị lực phải" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} step={0.1} min={0} max={10} /></Form.Item></Col>
              <Col span={6}><Form.Item name="colorVision" label="Sắc giác" rules={[{ required: true }]}><Select options={[{ value: 'Bình thường', label: 'Bình thường' }, { value: 'Bất thường', label: 'Bất thường' }]} /></Form.Item></Col>
              <Col span={6}><Form.Item name="hearingStatus" label="Thính lực" rules={[{ required: true }]}><Select options={[{ value: 'Bình thường', label: 'Bình thường' }, { value: 'Giảm', label: 'Giảm' }]} /></Form.Item></Col>
            </Row>
            <Row gutter={12}>
              <Col span={8}><Form.Item name="mentalStatus" label="Tâm thần kinh" rules={[{ required: true }]}><Select options={[{ value: 'Bình thường', label: 'Bình thường' }, { value: 'Bất thường', label: 'Bất thường' }]} /></Form.Item></Col>
              <Col span={8}><Form.Item name="neurologicalStatus" label="Thần kinh" rules={[{ required: true }]}><Select options={[{ value: 'Bình thường', label: 'Bình thường' }, { value: 'Bất thường', label: 'Bất thường' }]} /></Form.Item></Col>
              <Col span={8}><Form.Item name="musculoskeletalStatus" label="Cơ xương khớp" rules={[{ required: true }]}><Select options={[{ value: 'Bình thường', label: 'Bình thường' }, { value: 'Bất thường', label: 'Bất thường' }]} /></Form.Item></Col>
            </Row>
          </Card>

          <Row gutter={12}>
            <Col span={12}><Form.Item name="result" label="Kết luận" rules={[{ required: true, message: 'Chọn kết luận' }]}><Select options={[{ value: 'Dat', label: 'Đủ điều kiện' }, { value: 'Khong dat', label: 'Không đủ điều kiện' }]} /></Form.Item></Col>
            <Col span={12}><Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </Spin>
  );
}
