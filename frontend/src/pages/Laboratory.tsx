import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, DatePicker, Input, Select, Space, Descriptions, Form, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined, CheckCircleOutlined, ExperimentOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { labApi } from '../api/lab';
import type { LabOrderDto, LabOrderItemDto } from '../api/lab';

export default function Laboratory() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<LabOrderDto[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<LabOrderDto | null>(null);
  const [resultModal, setResultModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const [resultForm] = Form.useForm();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await labApi.getOrders({ status: statusFilter, pageSize: 30 });
      setOrders(res.data.items);
      setTotal(res.data.total);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSelectOrder = async (order: LabOrderDto) => {
    try {
      const res = await labApi.getOrderById(order.id);
      setSelected(res.data);
    } catch {
      setSelected(order);
    }
  };

  const handleEnterResults = async () => {
    if (!selected) return;
    try {
      const values = resultForm.getFieldsValue();
      const results = selected.items.map(item => ({
        itemId: item.id,
        result: values[`result_${item.id}`] || '',
        note: values[`note_${item.id}`] || '',
      })).filter(r => r.result);
      await labApi.enterResults(selected.id, results);
      message.success('Nhap ket qua thanh cong');
      setResultModal(false);
      fetchOrders();
    } catch {
      message.warning('Loi nhap ket qua');
    }
  };

  const handleApprove = async (orderId: string) => {
    try {
      await labApi.approveResults(orderId);
      message.success('Duyet ket qua thanh cong');
      fetchOrders();
    } catch {
      message.warning('Loi duyet ket qua');
    }
  };

  const orderColumns: ColumnsType<LabOrderDto> = [
    { title: 'Ho ten', dataIndex: 'patientName', width: 150 },
    { title: 'Ngay', dataIndex: 'orderDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'BS chi dinh', dataIndex: 'doctorName', width: 120 },
    { title: 'So XN', width: 60, render: (_: unknown, r: LabOrderDto) => r.items?.length || 0 },
    {
      title: 'Trang thai', dataIndex: 'status', width: 110,
      render: (v: number) => v === 0 ? <Tag color="orange">Cho</Tag> : v === 1 ? <Tag color="blue">Dang lam</Tag> : v === 2 ? <Tag color="cyan">Co KQ</Tag> : <Tag color="green">Da duyet</Tag>,
    },
    {
      title: '', width: 180,
      render: (_: unknown, r: LabOrderDto) => (
        <Space>
          <Button size="small" onClick={() => handleSelectOrder(r)}>Chi tiet</Button>
          {r.status === 0 && <Button size="small" type="primary" icon={<ExperimentOutlined />} onClick={() => { handleSelectOrder(r); setResultModal(true); }}>Nhap KQ</Button>}
          {r.status === 2 && <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApprove(r.id)}>Duyet</Button>}
        </Space>
      ),
    },
  ];

  const itemColumns: ColumnsType<LabOrderItemDto> = [
    { title: 'Ten xet nghiem', dataIndex: 'testName' },
    { title: 'Nhom', dataIndex: 'testGroup', width: 100 },
    { title: 'Ket qua', dataIndex: 'result', width: 100 },
    { title: 'Don vi', dataIndex: 'unit', width: 60 },
    { title: 'Tham chieu', dataIndex: 'normalRange', width: 120 },
    {
      title: 'Bat thuong', dataIndex: 'isAbnormal', width: 80,
      render: (v: boolean) => v ? <Tag color="red">Co</Tag> : null,
    },
    {
      title: 'Trang thai', dataIndex: 'status', width: 80,
      render: (v: number) => v === 0 ? <Tag>Cho</Tag> : v === 1 ? <Tag color="blue">Da nhap</Tag> : <Tag color="green">Da duyet</Tag>,
    },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'orders', label: 'Phieu xet nghiem',
          children: (
            <Card>
              <Space style={{ marginBottom: 16 }}>
                <Input placeholder="Tim kiem..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} style={{ width: 200 }} />
                <Select placeholder="Trang thai" allowClear style={{ width: 140 }} value={statusFilter} onChange={setStatusFilter}
                  options={[{ value: 0, label: 'Cho' }, { value: 1, label: 'Dang lam' }, { value: 2, label: 'Co KQ' }, { value: 3, label: 'Da duyet' }]}
                />
                <Button icon={<ReloadOutlined />} onClick={fetchOrders} />
              </Space>
              <Table columns={orderColumns} dataSource={orders} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 820 }} />

              {selected && !resultModal && (
                <Card size="small" title={`Chi tiet - ${selected.patientName}`} style={{ marginTop: 16 }}>
                  <Table columns={itemColumns} dataSource={selected.items} rowKey="id" size="small" pagination={false} />
                </Card>
              )}
            </Card>
          ),
        },
        {
          key: 'report', label: 'Bao cao',
          children: (
            <Card title="Bao cao xet nghiem">
              <DatePicker.RangePicker format="DD/MM/YYYY" style={{ marginBottom: 16 }} />
              <br />
              <Button type="primary">Xuat bao cao</Button>
            </Card>
          ),
        },
      ]} />

      <Modal title="Nhap ket qua xet nghiem" open={resultModal} onCancel={() => setResultModal(false)} onOk={handleEnterResults} okText="Luu" width={700}>
        {selected && (
          <Form form={resultForm} layout="vertical">
            {selected.items.map(item => (
              <Row key={item.id} gutter={12} style={{ marginBottom: 8 }}>
                <Col span={8}>
                  <span style={{ fontWeight: 600 }}>{item.testName}</span>
                  {item.normalRange && <span style={{ color: '#999', marginLeft: 8 }}>({item.normalRange} {item.unit})</span>}
                </Col>
                <Col span={8}>
                  <Form.Item name={`result_${item.id}`} noStyle>
                    <Input placeholder="Ket qua" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={`note_${item.id}`} noStyle>
                    <Input placeholder="Ghi chu" />
                  </Form.Item>
                </Col>
              </Row>
            ))}
          </Form>
        )}
      </Modal>
    </Spin>
  );
}
