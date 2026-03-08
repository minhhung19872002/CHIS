import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, InputNumber, Statistic, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined, DollarOutlined } from '@ant-design/icons';
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
  const [editing, setEditing] = useState<VoucherDto | null>(null);
  const [form] = Form.useForm();

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try { const res = await financeApi.getVouchers({ voucherType: typeFilter, pageSize: 30 }); setVouchers(res.data.items); setTotal(res.data.total); } catch { setVouchers([]); } finally { setLoading(false); }
  }, [typeFilter]);

  useEffect(() => { fetchVouchers(); }, [fetchVouchers]);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      const data = {
        voucherType: editing ? editing.voucherType : voucherType,
        date: (values.date as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        amount: values.amount as number, description: values.description as string,
        category: values.category as string, payerOrReceiver: values.payerOrReceiver as string,
        paymentMethod: values.paymentMethod as string,
      };
      if (editing) {
        await financeApi.updateVoucher(editing.id, data);
        message.success('Cập nhật thành công');
      } else {
        await financeApi.createVoucher(data);
        message.success('Tạo phiếu thành công');
      }
      setVoucherModal(false); form.resetFields(); setEditing(null); fetchVouchers();
    } catch { message.warning('Lỗi lưu dữ liệu'); }
  };

  const handleEdit = (record: VoucherDto) => {
    setEditing(record);
    form.setFieldsValue({ ...record, date: record.date ? dayjs(record.date) : undefined });
    setVoucherModal(true);
  };

  const handleDelete = async (id: string) => {
    try { await financeApi.deleteVoucher(id); message.success('Xóa thành công'); fetchVouchers(); } catch { message.warning('Lỗi xóa'); }
  };

  const totalIncome = vouchers.filter(v => v.voucherType === 'income').reduce((s, v) => s + v.amount, 0);
  const totalExpense = vouchers.filter(v => v.voucherType === 'expense').reduce((s, v) => s + v.amount, 0);

  const columns: ColumnsType<VoucherDto> = [
    { title: 'Số phiếu', dataIndex: 'voucherNumber', width: 100 },
    { title: 'Loại', dataIndex: 'voucherType', width: 70, render: (v: string) => v === 'income' ? <Tag color="green">Thu</Tag> : <Tag color="red">Chi</Tag> },
    { title: 'Ngày', dataIndex: 'date', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Số tiền', dataIndex: 'amount', width: 120, align: 'right', render: (v: number) => v?.toLocaleString() },
    { title: 'Diễn giải', dataIndex: 'description', ellipsis: true },
    { title: 'Người nộp/nhận', dataIndex: 'payerOrReceiver', width: 120 },
    { title: 'Trạng thái', dataIndex: 'status', width: 90, render: (v: number) => v === 0 ? <Tag color="orange">Chờ duyệt</Tag> : v === 1 ? <Tag color="green">Đã duyệt</Tag> : <Tag color="red">Hủy</Tag> },
    {
      title: '', width: 80, fixed: 'right',
      render: (_: unknown, r: VoucherDto) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          <Popconfirm title="Xóa phiếu này?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
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
          key: 'vouchers', label: 'Thu/Chi',
          children: (
            <Card>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}><Card><Statistic title="Tổng thu" value={totalIncome} suffix="đ" styles={{ content: { color: '#52c41a' } }} prefix={<DollarOutlined />} /></Card></Col>
                <Col span={8}><Card><Statistic title="Tổng chi" value={totalExpense} suffix="đ" styles={{ content: { color: '#f5222d' } }} prefix={<DollarOutlined />} /></Card></Col>
                <Col span={8}><Card><Statistic title="Còn lại" value={totalIncome - totalExpense} suffix="đ" styles={{ content: { color: '#1890ff' } }} prefix={<DollarOutlined />} /></Card></Col>
              </Row>
              <Space style={{ marginBottom: 16 }}>
                <Select placeholder="Loại" allowClear style={{ width: 120 }} value={typeFilter} onChange={setTypeFilter} options={[{ value: 'income', label: 'Thu' }, { value: 'expense', label: 'Chi' }]} />
                <Button type="primary" onClick={() => { setEditing(null); setVoucherType('income'); form.resetFields(); setVoucherModal(true); }}>+ Phiếu thu</Button>
                <Button danger onClick={() => { setEditing(null); setVoucherType('expense'); form.resetFields(); setVoucherModal(true); }}>+ Phiếu chi</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchVouchers} />
              </Space>
              <Table columns={columns} dataSource={vouchers} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 900 }} />
            </Card>
          ),
        },
        {
          key: 'reports', label: 'Báo cáo',
          children: (
            <Card title="Báo cáo tài chính">
              <Space>
                <DatePicker picker="month" placeholder="Chọn tháng" />
                <Button type="primary">Sổ quỹ tiền mặt</Button>
                <Button>Báo cáo thu chi</Button>
                <Button>Báo cáo cân đối</Button>
              </Space>
            </Card>
          ),
        },
      ]} />

      <Modal title={editing ? 'Sửa phiếu' : (voucherType === 'income' ? 'Phiếu thu' : 'Phiếu chi')} open={voucherModal} onCancel={() => setVoucherModal(false)} onOk={() => form.submit()} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="date" label="Ngày" rules={[{ required: true, message: 'Chọn ngày' }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="amount" label="Số tiền" rules={[{ required: true, message: 'Nhập số tiền' }]}><InputNumber style={{ width: '100%' }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item></Col>
          </Row>
          <Form.Item name="description" label="Diễn giải" rules={[{ required: true, message: 'Nhập diễn giải' }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="category" label="Mục" rules={[{ required: true, message: 'Chọn mục' }]}><Select options={[
              { value: 'BHYT', label: 'Thu BHYT' }, { value: 'VienPhi', label: 'Viện phí' },
              { value: 'Luong', label: 'Lương' }, { value: 'VatTu', label: 'Vật tư' },
              { value: 'Khac', label: 'Khác' },
            ]} /></Form.Item></Col>
            <Col span={12}><Form.Item name="paymentMethod" label="Hình thức" rules={[{ required: true, message: 'Chọn hình thức' }]}><Select options={[{ value: 'Tiền mặt', label: 'Tiền mặt' }, { value: 'Chuyển khoản', label: 'Chuyển khoản' }]} /></Form.Item></Col>
          </Row>
          <Form.Item name="payerOrReceiver" label={editing ? 'Người nộp/nhận' : (voucherType === 'income' ? 'Người nộp' : 'Người nhận')} rules={[{ required: true, message: 'Nhập tên' }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
