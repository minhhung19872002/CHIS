import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, InputNumber, Statistic } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, DollarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { financeApi } from '../api/finance';
import type { VoucherDto } from '../api/finance';

export default function Finance() {
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState<VoucherDto[]>([]);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [voucherModal, setVoucherModal] = useState(false);
  const [voucherType, setVoucherType] = useState<'income' | 'expense'>('income');
  const [form] = Form.useForm();

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try { const res = await financeApi.getVouchers({ voucherType: typeFilter, pageSize: 30 }); setVouchers(res.data.items); setTotal(res.data.total); } catch { setVouchers([]); } finally { setLoading(false); }
  }, [typeFilter]);
  useEffect(() => { fetchVouchers(); }, [fetchVouchers]);

  const handleCreate = async (values: Record<string, unknown>) => {
    try {
      await financeApi.createVoucher({
        voucherType, date: (values.date as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        amount: values.amount as number, description: values.description as string,
        category: values.category as string, payerOrReceiver: values.payerOrReceiver as string,
        paymentMethod: values.paymentMethod as string,
      });
      message.success('Tao phieu thanh cong'); setVoucherModal(false); form.resetFields(); fetchVouchers();
    } catch { message.warning('Loi tao phieu'); }
  };

  const totalIncome = vouchers.filter(v => v.voucherType === 'income').reduce((s, v) => s + v.amount, 0);
  const totalExpense = vouchers.filter(v => v.voucherType === 'expense').reduce((s, v) => s + v.amount, 0);

  const columns: ColumnsType<VoucherDto> = [
    { title: 'So phieu', dataIndex: 'voucherNumber', width: 100 },
    { title: 'Loai', dataIndex: 'voucherType', width: 70, render: (v: string) => v === 'income' ? <Tag color="green">Thu</Tag> : <Tag color="red">Chi</Tag> },
    { title: 'Ngay', dataIndex: 'date', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'So tien', dataIndex: 'amount', width: 120, render: (v: number) => v?.toLocaleString() },
    { title: 'Dien giai', dataIndex: 'description' },
    { title: 'Nguoi nop/nhan', dataIndex: 'payerOrReceiver', width: 120 },
    { title: 'Trang thai', dataIndex: 'status', width: 90, render: (v: number) => v === 0 ? <Tag color="orange">Cho duyet</Tag> : v === 1 ? <Tag color="green">Da duyet</Tag> : <Tag color="red">Huy</Tag> },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'vouchers', label: 'Thu/Chi',
          children: (
            <Card>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}><Card><Statistic title="Tong thu" value={totalIncome} suffix="d" styles={{ content: { color: '#52c41a' } }} prefix={<DollarOutlined />} /></Card></Col>
                <Col span={8}><Card><Statistic title="Tong chi" value={totalExpense} suffix="d" styles={{ content: { color: '#f5222d' } }} prefix={<DollarOutlined />} /></Card></Col>
                <Col span={8}><Card><Statistic title="Con lai" value={totalIncome - totalExpense} suffix="d" styles={{ content: { color: '#1890ff' } }} prefix={<DollarOutlined />} /></Card></Col>
              </Row>
              <Space style={{ marginBottom: 16 }}>
                <Select placeholder="Loai" allowClear style={{ width: 120 }} value={typeFilter} onChange={setTypeFilter} options={[{ value: 'income', label: 'Thu' }, { value: 'expense', label: 'Chi' }]} />
                <Button type="primary" onClick={() => { setVoucherType('income'); form.resetFields(); setVoucherModal(true); }}>+ Phieu thu</Button>
                <Button danger onClick={() => { setVoucherType('expense'); form.resetFields(); setVoucherModal(true); }}>+ Phieu chi</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchVouchers} />
              </Space>
              <Table columns={columns} dataSource={vouchers} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 800 }} />
            </Card>
          ),
        },
        {
          key: 'reports', label: 'Bao cao',
          children: (
            <Card title="Bao cao tai chinh">
              <Space orientation="vertical">
                <Button>So quy tien mat</Button>
                <Button>Bao cao thu chi</Button>
                <Button>Bao cao can doi</Button>
              </Space>
            </Card>
          ),
        },
      ]} />

      <Modal title={voucherType === 'income' ? 'Phieu thu' : 'Phieu chi'} open={voucherModal} onCancel={() => setVoucherModal(false)} onOk={() => form.submit()} okText="Luu">
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="date" label="Ngay" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="amount" label="So tien" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item></Col>
          </Row>
          <Form.Item name="description" label="Dien giai" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="category" label="Muc" rules={[{ required: true }]}><Select options={[
              { value: 'BHYT', label: 'Thu BHYT' }, { value: 'VienPhi', label: 'Vien phi' },
              { value: 'Luong', label: 'Luong' }, { value: 'VatTu', label: 'Vat tu' },
              { value: 'Khac', label: 'Khac' },
            ]} /></Form.Item></Col>
            <Col span={12}><Form.Item name="paymentMethod" label="Hinh thuc" rules={[{ required: true }]}><Select options={[{ value: 'Tien mat', label: 'Tien mat' }, { value: 'Chuyen khoan', label: 'Chuyen khoan' }]} /></Form.Item></Col>
          </Row>
          <Form.Item name="payerOrReceiver" label={voucherType === 'income' ? 'Nguoi nop' : 'Nguoi nhan'} rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
