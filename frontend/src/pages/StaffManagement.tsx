import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Input, Space, Form, Row, Col, DatePicker, Select, Checkbox } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { staffApi } from '../api/staff';
import type { StaffDto } from '../api/staff';

export default function StaffManagement() {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<StaffDto[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<StaffDto | null>(null);
  const [form] = Form.useForm();

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try { const res = await staffApi.getList({ keyword, pageSize: 30 }); setStaffList(res.data.items); setTotal(res.data.total); } catch { setStaffList([]); } finally { setLoading(false); }
  }, [keyword]);
  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      const data: Partial<StaffDto> = {
        code: values.code as string, fullName: values.fullName as string,
        dateOfBirth: (values.dateOfBirth as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        gender: values.gender as number, position: values.position as string,
        qualification: values.qualification as string, specialization: values.specialization as string,
        licenseNumber: values.licenseNumber as string, phoneNumber: values.phoneNumber as string,
        email: values.email as string, canPrescribe: values.canPrescribe as boolean,
        electronicPrescriptionMapping: values.electronicPrescriptionMapping as string,
      };
      if (editing) { await staffApi.update(editing.id, data); message.success('Cap nhat thanh cong'); }
      else { await staffApi.create(data); message.success('Them thanh cong'); }
      setModal(false); form.resetFields(); setEditing(null); fetchStaff();
    } catch { message.warning('Loi luu'); }
  };

  const handleEdit = (record: StaffDto) => {
    setEditing(record);
    form.setFieldsValue({ ...record, dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : undefined });
    setModal(true);
  };

  const columns: ColumnsType<StaffDto> = [
    { title: 'Ma', dataIndex: 'code', width: 70 },
    { title: 'Ho ten', dataIndex: 'fullName', width: 150 },
    { title: 'Chuc vu', dataIndex: 'position', width: 100 },
    { title: 'Trinh do', dataIndex: 'qualification', width: 100 },
    { title: 'Chuyen mon', dataIndex: 'specialization', width: 120 },
    { title: 'SDT', dataIndex: 'phoneNumber', width: 100 },
    { title: 'Ke don', dataIndex: 'canPrescribe', width: 60, render: (v: boolean) => v ? <Tag color="green">Co</Tag> : null },
    { title: 'Trang thai', dataIndex: 'status', width: 80, render: (v: number) => v === 1 ? <Tag color="green">HD</Tag> : <Tag>Nghi</Tag> },
    { title: '', width: 60, render: (_: unknown, r: StaffDto) => <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} /> },
  ];

  return (
    <Spin spinning={loading}>
      <Card title="Quan ly nhan luc" extra={<Space>
        <Input placeholder="Tim kiem..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchStaff()} style={{ width: 200 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModal(true); }}>Them</Button>
        <Button icon={<ReloadOutlined />} onClick={fetchStaff} />
      </Space>}>
        <Table columns={columns} dataSource={staffList} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 930 }} />
      </Card>

      <Modal title={editing ? 'Sua nhan vien' : 'Them nhan vien'} open={modal} onCancel={() => setModal(false)} onOk={() => form.submit()} okText="Luu" width={700}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="code" label="Ma NV" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={16}><Form.Item name="fullName" label="Ho ten" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="dateOfBirth" label="Ngay sinh"><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="gender" label="Gioi tinh"><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nu' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="position" label="Chuc vu" rules={[{ required: true }]}><Select options={[{ value: 'Bac si', label: 'Bac si' }, { value: 'Y si', label: 'Y si' }, { value: 'Dieu duong', label: 'Dieu duong' }, { value: 'Ho sinh', label: 'Ho sinh' }, { value: 'Duoc si', label: 'Duoc si' }, { value: 'KTV', label: 'KTV' }, { value: 'Hanh chinh', label: 'Hanh chinh' }]} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="qualification" label="Trinh do"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="specialization" label="Chuyen mon"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="licenseNumber" label="So CCHN"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="phoneNumber" label="SDT"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="email" label="Email"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="canPrescribe" valuePropName="checked"><Checkbox>Ke don dien tu</Checkbox></Form.Item></Col>
          </Row>
          <Form.Item name="electronicPrescriptionMapping" label="Ma lien thong don thuoc DT"><Input placeholder="Ma bac si tren he thong don thuoc quoc gia" /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
