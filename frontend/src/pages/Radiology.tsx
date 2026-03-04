import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Select, Space, Form, DatePicker } from 'antd';
import { SearchOutlined, ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { radiologyApi } from '../api/radiology';
import type { RadiologyOrderDto } from '../api/radiology';

export default function Radiology() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<RadiologyOrderDto[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<RadiologyOrderDto | null>(null);
  const [resultModal, setResultModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [resultForm] = Form.useForm();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await radiologyApi.getOrders({ status: statusFilter, pageSize: 30 });
      setOrders(res.data.items);
      setTotal(res.data.total);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleEnterResult = async (values: { result: string; conclusion: string }) => {
    if (!selected) return;
    try {
      await radiologyApi.enterResult(selected.id, values);
      message.success('Nhap ket qua thanh cong');
      setResultModal(false);
      fetchOrders();
    } catch {
      message.warning('Loi nhap ket qua');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await radiologyApi.approve(id);
      message.success('Duyet ket qua thanh cong');
      fetchOrders();
    } catch {
      message.warning('Loi duyet');
    }
  };

  const columns: ColumnsType<RadiologyOrderDto> = [
    { title: 'Ho ten', dataIndex: 'patientName', width: 150 },
    { title: 'Loai', dataIndex: 'modality', width: 80 },
    { title: 'Bo phan', dataIndex: 'bodyPart', width: 120 },
    { title: 'Ngay', dataIndex: 'orderDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'BS chi dinh', dataIndex: 'doctorName', width: 120 },
    {
      title: 'Trang thai', dataIndex: 'status', width: 100,
      render: (v: number) => v === 0 ? <Tag color="orange">Cho</Tag> : v === 1 ? <Tag color="blue">Co KQ</Tag> : <Tag color="green">Da duyet</Tag>,
    },
    {
      title: '', width: 200,
      render: (_: unknown, r: RadiologyOrderDto) => (
        <Space>
          <Button size="small" onClick={() => setSelected(r)}>Chi tiet</Button>
          {r.status === 0 && <Button size="small" type="primary" onClick={() => { setSelected(r); resultForm.resetFields(); setResultModal(true); }}>Nhap KQ</Button>}
          {r.status === 1 && <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApprove(r.id)}>Duyet</Button>}
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'orders', label: 'Phieu CDHA',
          children: (
            <Card>
              <Space style={{ marginBottom: 16 }}>
                <Input placeholder="Tim kiem..." prefix={<SearchOutlined />} style={{ width: 200 }} />
                <Select placeholder="Trang thai" allowClear style={{ width: 140 }} value={statusFilter} onChange={setStatusFilter}
                  options={[{ value: 0, label: 'Cho' }, { value: 1, label: 'Co KQ' }, { value: 2, label: 'Da duyet' }]}
                />
                <Select placeholder="Loai" allowClear style={{ width: 120 }}
                  options={[{ value: 'XQ', label: 'X-Quang' }, { value: 'SA', label: 'Sieu am' }, { value: 'CT', label: 'CT' }]}
                />
                <Button icon={<ReloadOutlined />} onClick={fetchOrders} />
              </Space>
              <Table columns={columns} dataSource={orders} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 870 }} />

              {selected && !resultModal && (
                <Card size="small" title={`Ket qua - ${selected.patientName}`} style={{ marginTop: 16 }}>
                  <p><strong>Loai:</strong> {selected.modality} - {selected.bodyPart}</p>
                  <p><strong>Thong tin lam sang:</strong> {selected.clinicalInfo}</p>
                  {selected.result && <p><strong>Mo ta:</strong> {selected.result}</p>}
                  {selected.conclusion && <p><strong>Ket luan:</strong> {selected.conclusion}</p>}
                  {selected.reportDoctorName && <p><strong>BS doc KQ:</strong> {selected.reportDoctorName}</p>}
                </Card>
              )}
            </Card>
          ),
        },
        {
          key: 'report', label: 'Bao cao',
          children: (
            <Card title="Bao cao CDHA">
              <DatePicker.RangePicker format="DD/MM/YYYY" style={{ marginBottom: 16 }} />
              <br />
              <Button type="primary">Xuat bao cao</Button>
            </Card>
          ),
        },
      ]} />

      <Modal title="Nhap ket qua CDHA" open={resultModal} onCancel={() => setResultModal(false)} onOk={() => resultForm.submit()} okText="Luu" width={600}>
        <Form form={resultForm} layout="vertical" onFinish={handleEnterResult}>
          <Form.Item name="result" label="Mo ta hinh anh" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="conclusion" label="Ket luan" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
