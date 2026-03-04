import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, InputNumber, Switch } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { systemApi } from '../api/system';
import type { CatalogItemDto } from '../api/system';

const CATEGORIES = [
  { key: 'staff', label: 'Can bo' },
  { key: 'medicines', label: 'Thuoc' },
  { key: 'supplies', label: 'Vat tu' },
  { key: 'services', label: 'Dich vu' },
  { key: 'departments', label: 'Khoa/Phong' },
  { key: 'suppliers', label: 'Nha cung cap' },
  { key: 'equipment-types', label: 'Loai thiet bi' },
  { key: 'beds', label: 'Giuong benh' },
  { key: 'collaborators', label: 'CTV suc khoe' },
  { key: 'icd', label: 'Ma ICD-10' },
  { key: 'vaccines', label: 'Vaccine' },
  { key: 'prescription-templates', label: 'Mau don thuoc' },
  { key: 'service-pricing', label: 'Bang gia DV' },
  { key: 'insurance-policies', label: 'Chinh sach BHYT' },
  { key: 'wards', label: 'Xa/Phuong' },
  { key: 'ethnic-groups', label: 'Dan toc' },
  { key: 'occupations', label: 'Nghe nghiep' },
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
        message.success('Cap nhat thanh cong');
      } else {
        await systemApi.createCatalogItem(activeCategory, data);
        message.success('Them thanh cong');
      }
      setModal(false); form.resetFields(); setEditing(null); fetchItems();
    } catch { message.warning('Loi luu'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await systemApi.deleteCatalogItem(activeCategory, id);
      message.success('Xoa thanh cong');
      fetchItems();
    } catch { message.warning('Loi xoa'); }
  };

  const handleEdit = (record: CatalogItemDto) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModal(true);
  };

  const columns: ColumnsType<CatalogItemDto> = [
    { title: 'Ma', dataIndex: 'code', width: 100 },
    { title: 'Ten', dataIndex: 'name' },
    { title: 'Thu tu', dataIndex: 'sortOrder', width: 70 },
    { title: 'Hoat dong', dataIndex: 'isActive', width: 80, render: (v: boolean) => <Switch checked={v} size="small" disabled /> },
    {
      title: '', width: 100,
      render: (_: unknown, r: CatalogItemDto) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Card title="Danh muc du lieu" size="small">
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
                  <Input placeholder="Tim kiem..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchItems()} style={{ width: 220 }} />
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); form.setFieldsValue({ isActive: true }); setModal(true); }}>Them moi</Button>
                  <Button icon={<ReloadOutlined />} onClick={fetchItems} />
                </Space>
                <Table columns={columns} dataSource={items} rowKey="id" size="small" pagination={{ total, pageSize: 50 }} scroll={{ x: 500 }} />
              </div>
            ),
          }))}
        />
      </Card>

      <Modal title={editing ? 'Sua danh muc' : 'Them danh muc'} open={modal} onCancel={() => setModal(false)} onOk={() => form.submit()} okText="Luu">
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="code" label="Ma" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={16}><Form.Item name="name" label="Ten" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="sortOrder" label="Thu tu"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={12}><Form.Item name="isActive" label="Hoat dong" valuePropName="checked"><Switch /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </Spin>
  );
}
