import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, InputNumber, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
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
  const [editing, setEditing] = useState<EquipmentDto | null>(null);
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

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      const data = {
        code: values.code as string, name: values.name as string, category: values.category as string,
        manufacturer: values.manufacturer as string, serialNumber: values.serialNumber as string,
        purchaseDate: (values.purchaseDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        purchasePrice: values.purchasePrice as number, location: values.location as string,
      };
      if (editing) {
        await equipmentApi.update(editing.id, data);
        message.success('Cập nhật thành công');
      } else {
        await equipmentApi.create(data);
        message.success('Thêm thành công');
      }
      setEquipModal(false); equipForm.resetFields(); setEditing(null); fetchItems();
    } catch { message.warning('Lỗi lưu dữ liệu'); }
  };

  const handleDelete = async (id: string) => {
    try { await equipmentApi.delete(id); message.success('Xóa thành công'); fetchItems(); } catch { message.warning('Lỗi xóa'); }
  };

  const handleEdit = (record: EquipmentDto) => {
    setEditing(record);
    equipForm.setFieldsValue({ ...record, purchaseDate: record.purchaseDate ? dayjs(record.purchaseDate) : undefined });
    setEquipModal(true);
  };

  const handleTransfer = async (values: Record<string, unknown>) => {
    try {
      await equipmentApi.transfer({
        equipmentId: values.equipmentId as string,
        fromLocation: values.fromLocation as string, toLocation: values.toLocation as string,
        reason: values.reason as string,
      });
      message.success('Điều chuyển thành công'); setTransferModal(false); transferForm.resetFields(); fetchTransfers(); fetchItems();
    } catch { message.warning('Lỗi điều chuyển'); }
  };

  const columns: ColumnsType<EquipmentDto> = [
    { title: 'Mã', dataIndex: 'code', width: 80 },
    { title: 'Tên', dataIndex: 'name', width: 180 },
    { title: 'Nhóm', dataIndex: 'category', width: 100 },
    { title: 'Nhà SX', dataIndex: 'manufacturer', width: 120 },
    { title: 'S/N', dataIndex: 'serialNumber', width: 100 },
    { title: 'Vị trí', dataIndex: 'location', width: 100 },
    { title: 'Giá trị', dataIndex: 'currentValue', width: 100, align: 'right', render: (v: number) => v?.toLocaleString() },
    { title: 'Trạng thái', dataIndex: 'status', width: 80, render: (v: number) => v === 1 ? <Tag color="green">Tốt</Tag> : v === 2 ? <Tag color="orange">Sửa</Tag> : <Tag color="red">Hỏng</Tag> },
    {
      title: '', width: 80, fixed: 'right',
      render: (_: unknown, r: EquipmentDto) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          <Popconfirm title="Xóa tài sản này?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const transferColumns: ColumnsType<EquipmentTransferDto> = [
    { title: 'Thiết bị', dataIndex: 'equipmentName' },
    { title: 'Từ', dataIndex: 'fromLocation', width: 120 },
    { title: 'Đến', dataIndex: 'toLocation', width: 120 },
    { title: 'Ngày', dataIndex: 'transferDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Lý do', dataIndex: 'reason', ellipsis: true },
    { title: 'Trạng thái', dataIndex: 'status', width: 90, render: (v: number) => v === 1 ? <Tag color="green">Đã duyệt</Tag> : <Tag color="orange">Chờ</Tag> },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'list', label: 'Tài sản',
          children: (
            <Card extra={
              <Space>
                <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchItems()} style={{ width: 200 }} allowClear />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); equipForm.resetFields(); setEquipModal(true); }}>Thêm</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchItems} />
              </Space>
            }>
              <Table columns={columns} dataSource={items} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 940 }} />
            </Card>
          ),
        },
        {
          key: 'transfers', label: 'Điều chuyển',
          children: (
            <Card extra={
              <Space>
                <Button type="primary" icon={<SwapOutlined />} onClick={() => { transferForm.resetFields(); setTransferModal(true); }}>Điều chuyển</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchTransfers} />
              </Space>
            }>
              <Table columns={transferColumns} dataSource={transfers} rowKey="id" size="small" pagination={{ pageSize: 20 }} />
            </Card>
          ),
        },
        {
          key: 'tracking', label: 'Sổ theo dõi',
          children: (
            <Card title="Sổ theo dõi TSCĐ">
              <Space>
                <DatePicker picker="year" placeholder="Chọn năm" />
                <Button type="primary">Xuất sổ</Button>
              </Space>
            </Card>
          ),
        },
      ]} />

      <Modal title={editing ? 'Sửa tài sản' : 'Thêm tài sản'} open={equipModal} onCancel={() => setEquipModal(false)} onOk={() => equipForm.submit()} okText="Lưu" cancelText="Hủy">
        <Form form={equipForm} layout="vertical" onFinish={handleSave}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="code" label="Mã TS" rules={[{ required: true, message: 'Nhập mã' }]}><Input /></Form.Item></Col>
            <Col span={16}><Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Nhập tên' }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="category" label="Nhóm" rules={[{ required: true, message: 'Chọn nhóm' }]}><Select options={[{ value: 'Y tế', label: 'Thiết bị y tế' }, { value: 'Văn phòng', label: 'Văn phòng' }, { value: 'CNTT', label: 'CNTT' }, { value: 'Khác', label: 'Khác' }]} /></Form.Item></Col>
            <Col span={12}><Form.Item name="manufacturer" label="Nhà SX"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="serialNumber" label="Số serial"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="location" label="Vị trí"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="purchaseDate" label="Ngày mua"><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="purchasePrice" label="Giá mua"><InputNumber style={{ width: '100%' }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal title="Điều chuyển tài sản" open={transferModal} onCancel={() => setTransferModal(false)} onOk={() => transferForm.submit()} okText="Lưu" cancelText="Hủy">
        <Form form={transferForm} layout="vertical" onFinish={handleTransfer}>
          <Form.Item name="equipmentId" label="Mã tài sản" rules={[{ required: true, message: 'Nhập mã tài sản' }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="fromLocation" label="Từ" rules={[{ required: true, message: 'Nhập nơi chuyển' }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="toLocation" label="Đến" rules={[{ required: true, message: 'Nhập nơi nhận' }]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="reason" label="Lý do" rules={[{ required: true, message: 'Nhập lý do' }]}><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
