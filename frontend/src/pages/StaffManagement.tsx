import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Input, Space, Form, Row, Col, DatePicker, Select, Checkbox, Popconfirm, Tabs } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
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
    try {
      const res = await staffApi.getList({ keyword, pageSize: 30 });
      setStaffList(res.data.items);
      setTotal(res.data.total);
    } catch { setStaffList([]); } finally { setLoading(false); }
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
      if (editing) {
        await staffApi.update(editing.id, data);
        message.success('Cập nhật thành công');
      } else {
        await staffApi.create(data);
        message.success('Thêm thành công');
      }
      setModal(false); form.resetFields(); setEditing(null); fetchStaff();
    } catch { message.warning('Lỗi lưu dữ liệu'); }
  };

  const handleEdit = (record: StaffDto) => {
    setEditing(record);
    form.setFieldsValue({ ...record, dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : undefined });
    setModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await staffApi.delete(id);
      message.success('Xóa thành công');
      fetchStaff();
    } catch { message.warning('Lỗi xóa'); }
  };

  const columns: ColumnsType<StaffDto> = [
    { title: 'Mã', dataIndex: 'code', width: 70 },
    { title: 'Họ tên', dataIndex: 'fullName', width: 150 },
    { title: 'Chức vụ', dataIndex: 'position', width: 100 },
    { title: 'Trình độ', dataIndex: 'qualification', width: 100 },
    { title: 'Chuyên môn', dataIndex: 'specialization', width: 120 },
    { title: 'SĐT', dataIndex: 'phoneNumber', width: 100 },
    { title: 'Kê đơn', dataIndex: 'canPrescribe', width: 60, render: (v: boolean) => v ? <Tag color="green">Có</Tag> : null },
    { title: 'Trạng thái', dataIndex: 'status', width: 80, render: (v: number) => v === 1 ? <Tag color="green">HĐ</Tag> : <Tag>Nghỉ</Tag> },
    {
      title: '', width: 80, fixed: 'right',
      render: (_: unknown, r: StaffDto) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          <Popconfirm title="Xóa nhân viên này?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'list', label: 'Danh sách nhân viên',
          children: (
            <Card extra={
              <Space>
                <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchStaff()} style={{ width: 200 }} allowClear />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModal(true); }}>Thêm</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchStaff} />
              </Space>
            }>
              <Table columns={columns} dataSource={staffList} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 960 }} />
            </Card>
          ),
        },
        {
          key: 'reports', label: 'Báo cáo nhân lực',
          children: (
            <Card title="Báo cáo nhân lực y tế">
              <Space>
                <DatePicker picker="year" placeholder="Chọn năm" />
                <Button type="primary">Xuất báo cáo</Button>
              </Space>
            </Card>
          ),
        },
      ]} />

      <Modal title={editing ? 'Sửa nhân viên' : 'Thêm nhân viên'} open={modal} onCancel={() => setModal(false)} onOk={() => form.submit()} okText="Lưu" cancelText="Hủy" width={700}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="code" label="Mã NV" rules={[{ required: true, message: 'Nhập mã NV' }]}><Input /></Form.Item></Col>
            <Col span={16}><Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="dateOfBirth" label="Ngày sinh"><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="gender" label="Giới tính"><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nữ' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="position" label="Chức vụ" rules={[{ required: true, message: 'Chọn chức vụ' }]}><Select options={[{ value: 'Bác sĩ', label: 'Bác sĩ' }, { value: 'Y sĩ', label: 'Y sĩ' }, { value: 'Điều dưỡng', label: 'Điều dưỡng' }, { value: 'Hộ sinh', label: 'Hộ sinh' }, { value: 'Dược sĩ', label: 'Dược sĩ' }, { value: 'KTV', label: 'KTV' }, { value: 'Hành chính', label: 'Hành chính' }]} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="qualification" label="Trình độ"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="specialization" label="Chuyên môn"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="licenseNumber" label="Số CCHN"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="phoneNumber" label="SĐT"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="email" label="Email"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="canPrescribe" valuePropName="checked"><Checkbox>Kê đơn điện tử</Checkbox></Form.Item></Col>
          </Row>
          <Form.Item name="electronicPrescriptionMapping" label="Mã liên thông đơn thuốc ĐT"><Input placeholder="Mã bác sĩ trên hệ thống đơn thuốc quốc gia" /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
