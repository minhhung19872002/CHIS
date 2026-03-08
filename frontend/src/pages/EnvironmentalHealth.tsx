import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, Checkbox, Popconfirm, InputNumber } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { environmentalHealthApi } from '../api/environmentalHealth';
import type { SanitationFacilityDto, WaterSourceDto } from '../api/environmentalHealth';

export default function EnvironmentalHealth() {
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<SanitationFacilityDto[]>([]);
  const [fTotal, setFTotal] = useState(0);
  const [waterSources, setWaterSources] = useState<WaterSourceDto[]>([]);
  const [wTotal, setWTotal] = useState(0);
  const [fKeyword, setFKeyword] = useState('');
  const [wKeyword, setWKeyword] = useState('');
  const [facilityModal, setFacilityModal] = useState(false);
  const [waterModal, setWaterModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<SanitationFacilityDto | null>(null);
  const [editingWater, setEditingWater] = useState<WaterSourceDto | null>(null);
  const [facilityForm] = Form.useForm();
  const [waterForm] = Form.useForm();

  const fetchFacilities = useCallback(async () => {
    setLoading(true);
    try { const res = await environmentalHealthApi.getSanitationFacilities({ keyword: fKeyword, pageSize: 30 }); setFacilities(res.data.items); setFTotal(res.data.total); } catch { setFacilities([]); } finally { setLoading(false); }
  }, [fKeyword]);

  const fetchWater = useCallback(async () => {
    try { const res = await environmentalHealthApi.getWaterSources({ keyword: wKeyword, pageSize: 30 }); setWaterSources(res.data.items); setWTotal(res.data.total); } catch { setWaterSources([]); }
  }, [wKeyword]);

  useEffect(() => { fetchFacilities(); fetchWater(); }, [fetchFacilities, fetchWater]);

  const handleSaveFacility = async (values: Record<string, unknown>) => {
    try {
      const data = {
        householdId: values.householdId as string, householdHead: values.householdHead as string,
        address: values.address as string, facilityType: values.facilityType as string,
        condition: values.condition as string, meetsStandard: values.meetsStandard as boolean,
        inspectionDate: (values.inspectionDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        inspectorName: values.inspectorName as string,
      };
      if (editingFacility) {
        await environmentalHealthApi.updateFacility(editingFacility.id, data);
        message.success('Cập nhật thành công');
      } else {
        await environmentalHealthApi.createFacility(data);
        message.success('Thêm thành công');
      }
      setFacilityModal(false); facilityForm.resetFields(); setEditingFacility(null); fetchFacilities();
    } catch { message.warning('Lỗi lưu dữ liệu'); }
  };

  const handleSaveWater = async (values: Record<string, unknown>) => {
    try {
      const data = {
        name: values.name as string, sourceType: values.sourceType as string,
        location: values.location as string, servingHouseholds: values.servingHouseholds as number,
        meetsStandard: values.meetsStandard as boolean,
      };
      if (editingWater) {
        await environmentalHealthApi.updateWaterSource(editingWater.id, data);
        message.success('Cập nhật thành công');
      } else {
        await environmentalHealthApi.createWaterSource(data);
        message.success('Thêm thành công');
      }
      setWaterModal(false); waterForm.resetFields(); setEditingWater(null); fetchWater();
    } catch { message.warning('Lỗi lưu dữ liệu'); }
  };

  const handleDeleteFacility = async (id: string) => {
    try { await environmentalHealthApi.deleteFacility(id); message.success('Xóa thành công'); fetchFacilities(); } catch { message.warning('Lỗi xóa'); }
  };

  const handleDeleteWater = async (id: string) => {
    try { await environmentalHealthApi.deleteWaterSource(id); message.success('Xóa thành công'); fetchWater(); } catch { message.warning('Lỗi xóa'); }
  };

  const facilityColumns: ColumnsType<SanitationFacilityDto> = [
    { title: 'Chủ hộ', dataIndex: 'householdHead', width: 140 },
    { title: 'Địa chỉ', dataIndex: 'address', width: 180 },
    { title: 'Loại', dataIndex: 'facilityType', width: 120 },
    { title: 'Tình trạng', dataIndex: 'condition', width: 100 },
    { title: 'Đạt chuẩn', dataIndex: 'meetsStandard', width: 80, render: (v: boolean) => v ? <Tag color="green">Đạt</Tag> : <Tag color="red">Không</Tag> },
    { title: 'Ngày KT', dataIndex: 'inspectionDate', width: 100, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
    {
      title: '', width: 80, fixed: 'right',
      render: (_: unknown, r: SanitationFacilityDto) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingFacility(r); facilityForm.setFieldsValue({ ...r, inspectionDate: r.inspectionDate ? dayjs(r.inspectionDate) : undefined }); setFacilityModal(true); }} />
          <Popconfirm title="Xóa công trình này?" onConfirm={() => handleDeleteFacility(r.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const waterColumns: ColumnsType<WaterSourceDto> = [
    { title: 'Tên', dataIndex: 'name', width: 150 },
    { title: 'Loại', dataIndex: 'sourceType', width: 100 },
    { title: 'Vị trí', dataIndex: 'location', width: 150 },
    { title: 'Số hộ', dataIndex: 'servingHouseholds', width: 60, align: 'right' },
    { title: 'Chất lượng', dataIndex: 'qualityStatus', width: 100 },
    { title: 'Đạt chuẩn', dataIndex: 'meetsStandard', width: 80, render: (v: boolean) => v ? <Tag color="green">Đạt</Tag> : <Tag color="red">Không</Tag> },
    { title: 'Ngày XN', dataIndex: 'lastTestDate', width: 100, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
    {
      title: '', width: 80, fixed: 'right',
      render: (_: unknown, r: WaterSourceDto) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingWater(r); waterForm.setFieldsValue(r); setWaterModal(true); }} />
          <Popconfirm title="Xóa nguồn nước này?" onConfirm={() => handleDeleteWater(r.id)} okText="Xóa" cancelText="Hủy">
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
          key: 'sanitation', label: 'Công trình vệ sinh',
          children: (
            <Card extra={
              <Space>
                <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={fKeyword} onChange={e => setFKeyword(e.target.value)} onPressEnter={() => fetchFacilities()} style={{ width: 200 }} allowClear />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingFacility(null); facilityForm.resetFields(); setFacilityModal(true); }}>Thêm</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchFacilities} />
              </Space>
            }>
              <Table columns={facilityColumns} dataSource={facilities} rowKey="id" size="small" pagination={{ total: fTotal, pageSize: 30 }} scroll={{ x: 900 }} />
            </Card>
          ),
        },
        {
          key: 'water', label: 'Nguồn nước',
          children: (
            <Card extra={
              <Space>
                <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={wKeyword} onChange={e => setWKeyword(e.target.value)} onPressEnter={() => fetchWater()} style={{ width: 200 }} allowClear />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingWater(null); waterForm.resetFields(); setWaterModal(true); }}>Thêm</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchWater} />
              </Space>
            }>
              <Table columns={waterColumns} dataSource={waterSources} rowKey="id" size="small" pagination={{ total: wTotal, pageSize: 30 }} scroll={{ x: 830 }} />
            </Card>
          ),
        },
        {
          key: 'reports', label: 'Báo cáo',
          children: (
            <Card title="Báo cáo vệ sinh môi trường">
              <Space>
                <DatePicker picker="year" placeholder="Chọn năm" />
                <Button type="primary">Xuất báo cáo</Button>
              </Space>
            </Card>
          ),
        },
      ]} />

      <Modal title={editingFacility ? 'Sửa công trình vệ sinh' : 'Thêm công trình vệ sinh'} open={facilityModal} onCancel={() => setFacilityModal(false)} onOk={() => facilityForm.submit()} okText="Lưu" cancelText="Hủy">
        <Form form={facilityForm} layout="vertical" onFinish={handleSaveFacility}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="householdHead" label="Chủ hộ" rules={[{ required: true, message: 'Nhập tên chủ hộ' }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="facilityType" label="Loại" rules={[{ required: true, message: 'Chọn loại' }]}><Select options={[{ value: 'Nhà tiêu hợp vệ sinh', label: 'Nhà tiêu HVS' }, { value: 'Nhà tiêu tự hoại', label: 'Nhà tiêu tự hoại' }, { value: 'Nhà tiêu đôi', label: 'Nhà tiêu đôi' }, { value: 'Không có', label: 'Không có' }]} /></Form.Item></Col>
          </Row>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Nhập địa chỉ' }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="condition" label="Tình trạng"><Select options={[{ value: 'Tốt', label: 'Tốt' }, { value: 'Trung bình', label: 'Trung bình' }, { value: 'Kém', label: 'Kém' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="inspectionDate" label="Ngày kiểm tra"><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="inspectorName" label="Người KT"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="meetsStandard" valuePropName="checked"><Checkbox>Đạt tiêu chuẩn</Checkbox></Form.Item>
        </Form>
      </Modal>

      <Modal title={editingWater ? 'Sửa nguồn nước' : 'Thêm nguồn nước'} open={waterModal} onCancel={() => setWaterModal(false)} onOk={() => waterForm.submit()} okText="Lưu" cancelText="Hủy">
        <Form form={waterForm} layout="vertical" onFinish={handleSaveWater}>
          <Form.Item name="name" label="Tên nguồn nước" rules={[{ required: true, message: 'Nhập tên' }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="sourceType" label="Loại" rules={[{ required: true, message: 'Chọn loại' }]}><Select options={[{ value: 'Giếng khoan', label: 'Giếng khoan' }, { value: 'Giếng đào', label: 'Giếng đào' }, { value: 'Nước máy', label: 'Nước máy' }, { value: 'Nước mưa', label: 'Nước mưa' }, { value: 'Sông/Suối', label: 'Sông/Suối' }]} /></Form.Item></Col>
            <Col span={12}><Form.Item name="location" label="Vị trí" rules={[{ required: true, message: 'Nhập vị trí' }]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="servingHouseholds" label="Số hộ sử dụng"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item name="meetsStandard" valuePropName="checked"><Checkbox>Đạt tiêu chuẩn</Checkbox></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
