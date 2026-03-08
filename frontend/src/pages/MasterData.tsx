import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, InputNumber, Switch, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { systemApi } from '../api/system';
import type { CatalogItemDto } from '../api/system';

const CATEGORIES = [
  { key: 'staff', label: 'Cán bộ' },
  { key: 'medicines', label: 'Thuốc' },
  { key: 'supplies', label: 'Vật tư' },
  { key: 'services', label: 'Dịch vụ' },
  { key: 'departments', label: 'Khoa/Phòng' },
  { key: 'suppliers', label: 'Nhà cung cấp' },
  { key: 'equipment-types', label: 'Loại thiết bị' },
  { key: 'beds', label: 'Giường bệnh' },
  { key: 'collaborators', label: 'CTV sức khỏe' },
  { key: 'icd', label: 'Mã ICD-10' },
  { key: 'vaccines', label: 'Vaccine' },
  { key: 'prescription-templates', label: 'Mẫu đơn thuốc' },
  { key: 'service-pricing', label: 'Bảng giá DV' },
  { key: 'insurance-policies', label: 'Chính sách BHYT' },
  { key: 'wards', label: 'Xã/Phường' },
  { key: 'ethnic-groups', label: 'Dân tộc' },
  { key: 'occupations', label: 'Nghề nghiệp' },
];

export default function MasterData() {
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('staff');
  const [items, setItems] = useState<CatalogItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<CatalogItemDto | null>(null);
  const [form] = Form.useForm();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await systemApi.getCatalog(activeCategory, { keyword, pageSize: 50 });
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [activeCategory, keyword]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      const data: Partial<CatalogItemDto> = {
        code: values.code as string,
        name: values.name as string,
        category: activeCategory,
        sortOrder: values.sortOrder as number || 0,
        isActive: values.isActive as boolean ?? true,
      };
      if (editing) {
        await systemApi.updateCatalogItem(activeCategory, editing.id, data);
        message.success('Cập nhật thành công');
      } else {
        await systemApi.createCatalogItem(activeCategory, data);
        message.success('Thêm thành công');
      }
      setModal(false); form.resetFields(); setEditing(null); fetchItems();
    } catch { message.warning('Lỗi lưu dữ liệu'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await systemApi.deleteCatalogItem(activeCategory, id);
      message.success('Xóa thành công');
      fetchItems();
    } catch { message.warning('Lỗi xóa'); }
  };

  const handleEdit = (record: CatalogItemDto) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModal(true);
  };

  const columns: ColumnsType<CatalogItemDto> = [
    { title: 'Mã', dataIndex: 'code', width: 100 },
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Thứ tự', dataIndex: 'sortOrder', width: 70, align: 'right' },
    { title: 'Hoạt động', dataIndex: 'isActive', width: 80, render: (v: boolean) => <Switch checked={v} size="small" disabled /> },
    {
      title: '', width: 80,
      render: (_: unknown, r: CatalogItemDto) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          <Popconfirm title="Xóa mục này?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Card title="Danh mục dữ liệu" size="small">
        <Tabs
          tabPlacement="left"
          activeKey={activeCategory}
          onChange={(k) => { setActiveCategory(k); setKeyword(''); }}
          items={CATEGORIES.map(c => ({
            key: c.key,
            label: c.label,
            children: (
              <div>
                <Space style={{ marginBottom: 12 }}>
                  <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchItems()} style={{ width: 220 }} allowClear />
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); form.setFieldsValue({ isActive: true }); setModal(true); }}>Thêm mới</Button>
                  <Button icon={<ReloadOutlined />} onClick={fetchItems} />
                </Space>
                <Table columns={columns} dataSource={items} rowKey="id" size="small" pagination={{ total, pageSize: 50 }} scroll={{ x: 500 }} />
              </div>
            ),
          }))}
        />
      </Card>

      <Modal title={editing ? 'Sửa danh mục' : 'Thêm danh mục'} open={modal} onCancel={() => setModal(false)} onOk={() => form.submit()} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="code" label="Mã" rules={[{ required: true, message: 'Nhập mã' }]}><Input /></Form.Item></Col>
            <Col span={16}><Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Nhập tên' }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="sortOrder" label="Thứ tự"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={12}><Form.Item name="isActive" label="Hoạt động" valuePropName="checked"><Switch /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </Spin>
  );
}
