import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, InputNumber } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { equipmentApi } from '../api/equipment';
import type { EquipmentDto, EquipmentTransferDto } from '../api/equipment';

export default function EquipmentManagement() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<EquipmentDto[]>([]);
  const [total, setTotal] = useState(0);
  const [transfers, setTransfers] = useState<EquipmentTransferDto[]>([]);
  const [keyword, setKeyword] = useState('');
  const [equipModal, setEquipModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [equipForm] = Form.useForm();
  const [transferForm] = Form.useForm();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try { const res = await equipmentApi.getList({ keyword, pageSize: 30 }); setItems(res.data.items); setTotal(res.data.total); } catch { setItems([]); } finally { setLoading(false); }
  }, [keyword]);
  const fetchTransfers = useCallback(async () => {
    try { const res = await equipmentApi.getTransfers({ pageSize: 20 }); setTransfers(res.data.items); } catch { setTransfers([]); }
  }, []);
  useEffect(() => { fetchItems(); fetchTransfers(); }, [fetchItems, fetchTransfers]);

  const handleCreate = async (values: Record<string, unknown>) => {
    try {
      await equipmentApi.create({
        code: values.code as string, name: values.name as string, category: values.category as string,
        manufacturer: values.manufacturer as string, serialNumber: values.serialNumber as string,
        purchaseDate: (values.purchaseDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        purchasePrice: values.purchasePrice as number, location: values.location as string,
      });
      message.success('Them thanh cong'); setEquipModal(false); equipForm.resetFields(); fetchItems();
    } catch { message.warning('Loi them'); }
  };

  const handleTransfer = async (values: Record<string, unknown>) => {
    try {
      await equipmentApi.transfer({
        equipmentId: values.equipmentId as string,
        fromLocation: values.fromLocation as string, toLocation: values.toLocation as string,
        reason: values.reason as string,
      });
      message.success('Dieu chuyen thanh cong'); setTransferModal(false); transferForm.resetFields(); fetchTransfers(); fetchItems();
    } catch { message.warning('Loi dieu chuyen'); }
  };

  const columns: ColumnsType<EquipmentDto> = [
    { title: 'Ma', dataIndex: 'code', width: 80 },
    { title: 'Ten', dataIndex: 'name', width: 180 },
    { title: 'Nhom', dataIndex: 'category', width: 100 },
    { title: 'Nha SX', dataIndex: 'manufacturer', width: 120 },
    { title: 'S/N', dataIndex: 'serialNumber', width: 100 },
    { title: 'Vi tri', dataIndex: 'location', width: 100 },
    { title: 'Gia tri', dataIndex: 'currentValue', width: 100, render: (v: number) => v?.toLocaleString() },
    { title: 'Trang thai', dataIndex: 'status', width: 80, render: (v: number) => v === 1 ? <Tag color="green">Tot</Tag> : v === 2 ? <Tag color="orange">Sua</Tag> : <Tag color="red">Hong</Tag> },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'list', label: 'Tai san',
          children: (
            <Card extra={<Space>
              <Input placeholder="Tim kiem..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchItems()} style={{ width: 200 }} />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { equipForm.resetFields(); setEquipModal(true); }}>Them</Button>
              <Button icon={<ReloadOutlined />} onClick={fetchItems} />
            </Space>}>
              <Table columns={columns} dataSource={items} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 860 }} />
            </Card>
          ),
        },
        {
          key: 'transfers', label: 'Dieu chuyen',
          children: (
            <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { transferForm.resetFields(); setTransferModal(true); }}>Dieu chuyen</Button>}>
              <Table dataSource={transfers} rowKey="id" size="small" pagination={{ pageSize: 20 }} columns={[
                { title: 'Thiet bi', dataIndex: 'equipmentName' },
                { title: 'Tu', dataIndex: 'fromLocation', width: 120 },
                { title: 'Den', dataIndex: 'toLocation', width: 120 },
                { title: 'Ngay', dataIndex: 'transferDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
                { title: 'Ly do', dataIndex: 'reason' },
                { title: 'Trang thai', dataIndex: 'status', width: 90, render: (v: number) => v === 1 ? <Tag color="green">Da duyet</Tag> : <Tag color="orange">Cho</Tag> },
              ]} />
            </Card>
          ),
        },
        { key: 'tracking', label: 'So theo doi', children: <Card title="So theo doi TSCD"><Button type="primary">Xuat so</Button></Card> },
      ]} />

      <Modal title="Them tai san" open={equipModal} onCancel={() => setEquipModal(false)} onOk={() => equipForm.submit()} okText="Luu">
        <Form form={equipForm} layout="vertical" onFinish={handleCreate}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="code" label="Ma TS" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={16}><Form.Item name="name" label="Ten" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="category" label="Nhom" rules={[{ required: true }]}><Select options={[{ value: 'Y te', label: 'Thiet bi y te' }, { value: 'VP', label: 'Van phong' }, { value: 'CNTT', label: 'CNTT' }, { value: 'Khac', label: 'Khac' }]} /></Form.Item></Col>
            <Col span={12}><Form.Item name="manufacturer" label="Nha SX"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="serialNumber" label="So serial"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="location" label="Vi tri"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="purchaseDate" label="Ngay mua"><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="purchasePrice" label="Gia mua"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal title="Dieu chuyen tai san" open={transferModal} onCancel={() => setTransferModal(false)} onOk={() => transferForm.submit()} okText="Luu">
        <Form form={transferForm} layout="vertical" onFinish={handleTransfer}>
          <Form.Item name="equipmentId" label="Ma tai san" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="fromLocation" label="Tu" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="toLocation" label="Den" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="reason" label="Ly do" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
