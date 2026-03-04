import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, Checkbox } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { environmentalHealthApi } from '../api/environmentalHealth';
import type { SanitationFacilityDto, WaterSourceDto } from '../api/environmentalHealth';

export default function EnvironmentalHealth() {
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<SanitationFacilityDto[]>([]);
  const [fTotal, setFTotal] = useState(0);
  const [waterSources, setWaterSources] = useState<WaterSourceDto[]>([]);
  const [wTotal, setWTotal] = useState(0);
  const [facilityModal, setFacilityModal] = useState(false);
  const [waterModal, setWaterModal] = useState(false);
  const [facilityForm] = Form.useForm();
  const [waterForm] = Form.useForm();

  const fetchFacilities = useCallback(async () => {
    setLoading(true);
    try { const res = await environmentalHealthApi.getSanitationFacilities({ pageSize: 30 }); setFacilities(res.data.items); setFTotal(res.data.total); } catch { setFacilities([]); } finally { setLoading(false); }
  }, []);
  const fetchWater = useCallback(async () => {
    try { const res = await environmentalHealthApi.getWaterSources({ pageSize: 30 }); setWaterSources(res.data.items); setWTotal(res.data.total); } catch { setWaterSources([]); }
  }, []);
  useEffect(() => { fetchFacilities(); fetchWater(); }, [fetchFacilities, fetchWater]);

  const handleCreateFacility = async (values: Record<string, unknown>) => {
    try {
      await environmentalHealthApi.createFacility({
        householdId: values.householdId as string, householdHead: values.householdHead as string,
        address: values.address as string, facilityType: values.facilityType as string,
        condition: values.condition as string, meetsStandard: values.meetsStandard as boolean,
        inspectionDate: (values.inspectionDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        inspectorName: values.inspectorName as string,
      });
      message.success('Them thanh cong'); setFacilityModal(false); facilityForm.resetFields(); fetchFacilities();
    } catch { message.warning('Loi them'); }
  };

  const handleCreateWater = async (values: Record<string, unknown>) => {
    try {
      await environmentalHealthApi.createWaterSource({
        name: values.name as string, sourceType: values.sourceType as string,
        location: values.location as string, servingHouseholds: values.servingHouseholds as number,
        meetsStandard: values.meetsStandard as boolean,
      });
      message.success('Them thanh cong'); setWaterModal(false); waterForm.resetFields(); fetchWater();
    } catch { message.warning('Loi them'); }
  };

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'sanitation', label: 'Cong trinh ve sinh',
          children: (
            <Card extra={<Space><Button type="primary" icon={<PlusOutlined />} onClick={() => { facilityForm.resetFields(); setFacilityModal(true); }}>Them</Button><Button icon={<ReloadOutlined />} onClick={fetchFacilities} /></Space>}>
              <Table dataSource={facilities} rowKey="id" size="small" pagination={{ total: fTotal, pageSize: 30 }} columns={[
                { title: 'Chu ho', dataIndex: 'householdHead', width: 140 },
                { title: 'Dia chi', dataIndex: 'address', width: 180 },
                { title: 'Loai', dataIndex: 'facilityType', width: 100 },
                { title: 'Tinh trang', dataIndex: 'condition', width: 100 },
                { title: 'Dat chuan', dataIndex: 'meetsStandard', width: 80, render: (v: boolean) => v ? <Tag color="green">Dat</Tag> : <Tag color="red">Khong</Tag> },
                { title: 'Ngay KT', dataIndex: 'inspectionDate', width: 100, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
              ]} scroll={{ x: 800 }} />
            </Card>
          ),
        },
        {
          key: 'water', label: 'Nguon nuoc',
          children: (
            <Card extra={<Space><Button type="primary" icon={<PlusOutlined />} onClick={() => { waterForm.resetFields(); setWaterModal(true); }}>Them</Button><Button icon={<ReloadOutlined />} onClick={fetchWater} /></Space>}>
              <Table dataSource={waterSources} rowKey="id" size="small" pagination={{ total: wTotal, pageSize: 30 }} columns={[
                { title: 'Ten', dataIndex: 'name', width: 150 },
                { title: 'Loai', dataIndex: 'sourceType', width: 100 },
                { title: 'Vi tri', dataIndex: 'location', width: 150 },
                { title: 'So ho', dataIndex: 'servingHouseholds', width: 60 },
                { title: 'Chat luong', dataIndex: 'qualityStatus', width: 100 },
                { title: 'Dat chuan', dataIndex: 'meetsStandard', width: 80, render: (v: boolean) => v ? <Tag color="green">Dat</Tag> : <Tag color="red">Khong</Tag> },
                { title: 'Ngay XN', dataIndex: 'lastTestDate', width: 100, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
              ]} scroll={{ x: 740 }} />
            </Card>
          ),
        },
      ]} />

      <Modal title="Them cong trinh ve sinh" open={facilityModal} onCancel={() => setFacilityModal(false)} onOk={() => facilityForm.submit()} okText="Luu">
        <Form form={facilityForm} layout="vertical" onFinish={handleCreateFacility}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="householdHead" label="Chu ho" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="facilityType" label="Loai" rules={[{ required: true }]}><Select options={[{ value: 'Nha tieu hop ve sinh', label: 'Nha tieu HVS' }, { value: 'Nha tieu tu hoai', label: 'Nha tieu tu hoai' }, { value: 'Nha tieu doi', label: 'Nha tieu doi' }, { value: 'Khong co', label: 'Khong co' }]} /></Form.Item></Col>
          </Row>
          <Form.Item name="address" label="Dia chi" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="condition" label="Tinh trang"><Select options={[{ value: 'Tot', label: 'Tot' }, { value: 'Trung binh', label: 'Trung binh' }, { value: 'Kem', label: 'Kem' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="inspectionDate" label="Ngay kiem tra"><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="inspectorName" label="Nguoi KT"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="meetsStandard" valuePropName="checked"><Checkbox>Dat tieu chuan</Checkbox></Form.Item>
        </Form>
      </Modal>

      <Modal title="Them nguon nuoc" open={waterModal} onCancel={() => setWaterModal(false)} onOk={() => waterForm.submit()} okText="Luu">
        <Form form={waterForm} layout="vertical" onFinish={handleCreateWater}>
          <Form.Item name="name" label="Ten nguon nuoc" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="sourceType" label="Loai" rules={[{ required: true }]}><Select options={[{ value: 'Gieng khoan', label: 'Gieng khoan' }, { value: 'Gieng dao', label: 'Gieng dao' }, { value: 'Nuoc may', label: 'Nuoc may' }, { value: 'Nuoc mua', label: 'Nuoc mua' }, { value: 'Song/Suoi', label: 'Song/Suoi' }]} /></Form.Item></Col>
            <Col span={12}><Form.Item name="location" label="Vi tri" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="servingHouseholds" label="So ho su dung"><Input type="number" /></Form.Item>
          <Form.Item name="meetsStandard" valuePropName="checked"><Checkbox>Dat tieu chuan</Checkbox></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
