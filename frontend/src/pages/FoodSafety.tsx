import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, InputNumber, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { foodSafetyApi } from '../api/foodSafety';
import type { FoodBusinessDto, FoodPoisoningDto } from '../api/foodSafety';

export default function FoodSafety() {
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState<FoodBusinessDto[]>([]);
  const [bTotal, setBTotal] = useState(0);
  const [poisonings, setPoisonings] = useState<FoodPoisoningDto[]>([]);
  const [keyword, setKeyword] = useState('');
  const [businessModal, setBusinessModal] = useState(false);
  const [poisoningModal, setPoisoningModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<FoodBusinessDto | null>(null);
  const [businessForm] = Form.useForm();
  const [poisoningForm] = Form.useForm();

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    try { const res = await foodSafetyApi.getBusinesses({ keyword, pageSize: 30 }); setBusinesses(res.data.items); setBTotal(res.data.total); } catch { setBusinesses([]); } finally { setLoading(false); }
  }, [keyword]);

  const fetchPoisonings = useCallback(async () => {
    try { const res = await foodSafetyApi.getPoisoningIncidents({ year: dayjs().year() }); setPoisonings(res.data.items); } catch { setPoisonings([]); }
  }, []);

  useEffect(() => { fetchBusinesses(); fetchPoisonings(); }, [fetchBusinesses, fetchPoisonings]);

  const handleSaveBusiness = async (values: Record<string, unknown>) => {
    try {
      const data = {
        name: values.name as string, address: values.address as string,
        ownerName: values.ownerName as string, phoneNumber: values.phoneNumber as string,
        businessType: values.businessType as string,
      };
      if (editingBusiness) {
        await foodSafetyApi.updateBusiness(editingBusiness.id, data);
        message.success('Cập nhật thành công');
      } else {
        await foodSafetyApi.createBusiness(data);
        message.success('Thêm cơ sở thành công');
      }
      setBusinessModal(false); businessForm.resetFields(); setEditingBusiness(null); fetchBusinesses();
    } catch { message.warning('Lỗi lưu dữ liệu'); }
  };

  const handleDeleteBusiness = async (id: string) => {
    try { await foodSafetyApi.deleteBusiness(id); message.success('Xóa thành công'); fetchBusinesses(); } catch { message.warning('Lỗi xóa'); }
  };

  const handleReportPoisoning = async (values: Record<string, unknown>) => {
    try {
      await foodSafetyApi.reportPoisoning({
        incidentDate: (values.incidentDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        location: values.location as string, affectedCount: values.affectedCount as number,
        hospitalizedCount: values.hospitalizedCount as number, suspectedFood: values.suspectedFood as string,
        source: values.source as string, reportedBy: values.reportedBy as string,
      });
      message.success('Báo cáo thành công'); setPoisoningModal(false); poisoningForm.resetFields(); fetchPoisonings();
    } catch { message.warning('Lỗi báo cáo'); }
  };

  const businessColumns: ColumnsType<FoodBusinessDto> = [
    { title: 'Tên cơ sở', dataIndex: 'name', width: 180 },
    { title: 'Địa chỉ', dataIndex: 'address', width: 180 },
    { title: 'Chủ cơ sở', dataIndex: 'ownerName', width: 120 },
    { title: 'Loại', dataIndex: 'businessType', width: 100 },
    { title: 'Giấy phép', dataIndex: 'licenseNumber', width: 100 },
    { title: 'Kiểm tra cuối', dataIndex: 'lastInspectionDate', width: 100, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
    { title: 'Trạng thái', dataIndex: 'status', width: 90, render: (v: number) => v === 1 ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Đình chỉ</Tag> },
    {
      title: '', width: 80, fixed: 'right',
      render: (_: unknown, r: FoodBusinessDto) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingBusiness(r); businessForm.setFieldsValue(r); setBusinessModal(true); }} />
          <Popconfirm title="Xóa cơ sở này?" onConfirm={() => handleDeleteBusiness(r.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const poisoningColumns: ColumnsType<FoodPoisoningDto> = [
    { title: 'Ngày', dataIndex: 'incidentDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Địa điểm', dataIndex: 'location', width: 150 },
    { title: 'Số mắc', dataIndex: 'affectedCount', width: 70, align: 'right' },
    { title: 'Nhập viện', dataIndex: 'hospitalizedCount', width: 75, align: 'right' },
    { title: 'Thực phẩm nghi ngờ', dataIndex: 'suspectedFood', width: 150 },
    { title: 'Nguồn', dataIndex: 'source', width: 120 },
    { title: 'Trạng thái', dataIndex: 'status', width: 100, render: (v: string) => <Tag color={v === 'resolved' ? 'green' : 'orange'}>{v === 'resolved' ? 'Đã xử lý' : 'Đang xử lý'}</Tag> },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'businesses', label: 'Cơ sở ATTP',
          children: (
            <Card extra={
              <Space>
                <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchBusinesses()} style={{ width: 200 }} allowClear />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingBusiness(null); businessForm.resetFields(); setBusinessModal(true); }}>Thêm</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchBusinesses} />
              </Space>
            }>
              <Table columns={businessColumns} dataSource={businesses} rowKey="id" size="small" pagination={{ total: bTotal, pageSize: 30 }} scroll={{ x: 1050 }} />
            </Card>
          ),
        },
        {
          key: 'poisoning', label: 'Ngộ độc thực phẩm',
          children: (
            <Card extra={
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { poisoningForm.resetFields(); setPoisoningModal(true); }}>Báo cáo</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchPoisonings} />
              </Space>
            }>
              <Table columns={poisoningColumns} dataSource={poisonings} rowKey="id" size="small" pagination={{ pageSize: 20 }} />
            </Card>
          ),
        },
        {
          key: 'reports', label: 'Báo cáo',
          children: (
            <Card title="Báo cáo an toàn thực phẩm">
              <Space>
                <DatePicker picker="year" placeholder="Chọn năm" />
                <Button type="primary">Xuất báo cáo</Button>
              </Space>
            </Card>
          ),
        },
      ]} />

      <Modal title={editingBusiness ? 'Sửa cơ sở ATTP' : 'Thêm cơ sở ATTP'} open={businessModal} onCancel={() => setBusinessModal(false)} onOk={() => businessForm.submit()} okText="Lưu" cancelText="Hủy">
        <Form form={businessForm} layout="vertical" onFinish={handleSaveBusiness}>
          <Form.Item name="name" label="Tên cơ sở" rules={[{ required: true, message: 'Nhập tên cơ sở' }]}><Input /></Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Nhập địa chỉ' }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="ownerName" label="Chủ cơ sở" rules={[{ required: true, message: 'Nhập tên chủ' }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="phoneNumber" label="SĐT"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="businessType" label="Loại" rules={[{ required: true, message: 'Chọn loại' }]}><Select options={[{ value: 'Quán ăn', label: 'Quán ăn' }, { value: 'Sản xuất', label: 'Sản xuất' }, { value: 'Kinh doanh', label: 'Kinh doanh' }, { value: 'Bếp ăn tập thể', label: 'Bếp ăn tập thể' }]} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal title="Báo cáo ngộ độc thực phẩm" open={poisoningModal} onCancel={() => setPoisoningModal(false)} onOk={() => poisoningForm.submit()} okText="Báo cáo" cancelText="Hủy" width={600}>
        <Form form={poisoningForm} layout="vertical" onFinish={handleReportPoisoning}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="incidentDate" label="Ngày xảy ra" rules={[{ required: true, message: 'Chọn ngày' }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="location" label="Địa điểm" rules={[{ required: true, message: 'Nhập địa điểm' }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="affectedCount" label="Số người mắc" rules={[{ required: true, message: 'Nhập số' }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={8}><Form.Item name="hospitalizedCount" label="Số nhập viện"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={8}><Form.Item name="reportedBy" label="Người báo cáo" rules={[{ required: true, message: 'Nhập tên' }]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="suspectedFood" label="Thực phẩm nghi ngờ" rules={[{ required: true, message: 'Nhập thực phẩm' }]}><Input /></Form.Item>
          <Form.Item name="source" label="Nguồn gốc"><Input /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
