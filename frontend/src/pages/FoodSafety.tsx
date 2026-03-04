import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, InputNumber } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
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

  const handleCreateBusiness = async (values: Record<string, unknown>) => {
    try {
      await foodSafetyApi.createBusiness({
        name: values.name as string, address: values.address as string,
        ownerName: values.ownerName as string, phoneNumber: values.phoneNumber as string,
        businessType: values.businessType as string,
      });
      message.success('Them co so thanh cong'); setBusinessModal(false); businessForm.resetFields(); fetchBusinesses();
    } catch { message.warning('Loi them'); }
  };

  const handleReportPoisoning = async (values: Record<string, unknown>) => {
    try {
      await foodSafetyApi.reportPoisoning({
        incidentDate: (values.incidentDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        location: values.location as string, affectedCount: values.affectedCount as number,
        hospitalizedCount: values.hospitalizedCount as number, suspectedFood: values.suspectedFood as string,
        source: values.source as string, reportedBy: values.reportedBy as string,
      });
      message.success('Bao cao thanh cong'); setPoisoningModal(false); poisoningForm.resetFields(); fetchPoisonings();
    } catch { message.warning('Loi bao cao'); }
  };

  const businessColumns: ColumnsType<FoodBusinessDto> = [
    { title: 'Ten co so', dataIndex: 'name', width: 180 },
    { title: 'Dia chi', dataIndex: 'address', width: 180 },
    { title: 'Chu co so', dataIndex: 'ownerName', width: 120 },
    { title: 'Loai', dataIndex: 'businessType', width: 100 },
    { title: 'Giay phep', dataIndex: 'licenseNumber', width: 100 },
    { title: 'Kiem tra cuoi', dataIndex: 'lastInspectionDate', width: 100, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
    { title: 'Trang thai', dataIndex: 'status', width: 80, render: (v: number) => v === 1 ? <Tag color="green">HD</Tag> : <Tag color="red">Dinh chi</Tag> },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'businesses', label: 'Co so ATTP',
          children: (
            <Card extra={<Space>
              <Input placeholder="Tim kiem..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchBusinesses()} style={{ width: 200 }} />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { businessForm.resetFields(); setBusinessModal(true); }}>Them</Button><Button icon={<ReloadOutlined />} onClick={fetchBusinesses} />
            </Space>}>
              <Table columns={businessColumns} dataSource={businesses} rowKey="id" size="small" pagination={{ total: bTotal, pageSize: 30 }} scroll={{ x: 860 }} />
            </Card>
          ),
        },
        {
          key: 'poisoning', label: 'Ngo doc thuc pham',
          children: (
            <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { poisoningForm.resetFields(); setPoisoningModal(true); }}>Bao cao</Button>}>
              <Table dataSource={poisonings} rowKey="id" size="small" pagination={{ pageSize: 20 }} columns={[
                { title: 'Ngay', dataIndex: 'incidentDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                { title: 'Dia diem', dataIndex: 'location', width: 150 },
                { title: 'Anh huong', dataIndex: 'affectedCount', width: 70 },
                { title: 'Nhap vien', dataIndex: 'hospitalizedCount', width: 70 },
                { title: 'Thuc pham nghi ngo', dataIndex: 'suspectedFood', width: 150 },
                { title: 'Nguon', dataIndex: 'source', width: 120 },
                { title: 'Trang thai', dataIndex: 'status', width: 90, render: (v: string) => <Tag color={v === 'resolved' ? 'green' : 'orange'}>{v}</Tag> },
              ]} />
            </Card>
          ),
        },
      ]} />

      <Modal title="Them co so ATTP" open={businessModal} onCancel={() => setBusinessModal(false)} onOk={() => businessForm.submit()} okText="Luu">
        <Form form={businessForm} layout="vertical" onFinish={handleCreateBusiness}>
          <Form.Item name="name" label="Ten co so" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="address" label="Dia chi" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="ownerName" label="Chu co so" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="phoneNumber" label="SDT"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="businessType" label="Loai" rules={[{ required: true }]}><Select options={[{ value: 'Quan an', label: 'Quan an' }, { value: 'San xuat', label: 'San xuat' }, { value: 'Kinh doanh', label: 'Kinh doanh' }, { value: 'Bep an tap the', label: 'Bep an tap the' }]} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal title="Bao cao ngo doc thuc pham" open={poisoningModal} onCancel={() => setPoisoningModal(false)} onOk={() => poisoningForm.submit()} okText="Bao cao" width={600}>
        <Form form={poisoningForm} layout="vertical" onFinish={handleReportPoisoning}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="incidentDate" label="Ngay xay ra" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="location" label="Dia diem" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="affectedCount" label="So nguoi mac" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={8}><Form.Item name="hospitalizedCount" label="So nhap vien"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={8}><Form.Item name="reportedBy" label="Nguoi bao cao" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="suspectedFood" label="Thuc pham nghi ngo" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="source" label="Nguon goc"><Input /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
