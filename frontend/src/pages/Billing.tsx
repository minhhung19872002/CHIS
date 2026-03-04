import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Row, Col, Tag, Spin, message, Modal, Descriptions, Tabs, DatePicker, Input, Select, Space, Statistic } from 'antd';
import { SearchOutlined, ReloadOutlined, PrinterOutlined, CheckCircleOutlined, DollarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { billingApi } from '../api/billing';
import type { BillingDto, BillingItemDto } from '../api/billing';

export default function Billing() {
  const [loading, setLoading] = useState(false);
  const [billings, setBillings] = useState<BillingDto[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<BillingDto | null>(null);
  const [detailModal, setDetailModal] = useState(false);
  const [collectModal, setCollectModal] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const fetchBillings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await billingApi.search({
        keyword,
        status: statusFilter,
        fromDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        toDate: dateRange?.[1]?.format('YYYY-MM-DD'),
        pageSize: 30,
      });
      setBillings(res.data.items);
      setTotal(res.data.total);
    } catch {
      setBillings([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter, dateRange]);

  useEffect(() => { fetchBillings(); }, [fetchBillings]);

  const handleConfirmInsurance = async (id: string) => {
    try {
      await billingApi.confirmInsurance(id);
      message.success('Xac nhan BHYT thanh cong');
      fetchBillings();
    } catch {
      message.warning('Loi xac nhan BHYT');
    }
  };

  const handleCollect = async () => {
    if (!selected) return;
    try {
      await billingApi.collectPayment(selected.id, { paymentMethod: 'cash', amount: selected.patientPay });
      message.success('Thu phi thanh cong');
      setCollectModal(false);
      fetchBillings();
    } catch {
      message.warning('Loi thu phi');
    }
  };

  const columns: ColumnsType<BillingDto> = [
    { title: 'Ho ten', dataIndex: 'patientName', width: 150 },
    { title: 'So BHYT', dataIndex: 'insuranceNumber', width: 140 },
    { title: 'Tong phi', dataIndex: 'totalAmount', width: 100, render: (v: number) => v?.toLocaleString() },
    { title: 'BHYT tra', dataIndex: 'insurancePay', width: 100, render: (v: number) => v?.toLocaleString() },
    { title: 'BN tra', dataIndex: 'patientPay', width: 100, render: (v: number) => v?.toLocaleString(), },
    {
      title: 'Trang thai', dataIndex: 'status', width: 110,
      render: (v: number) => v === 0 ? <Tag color="orange">Chua thu</Tag> : v === 1 ? <Tag color="green">Da thu</Tag> : <Tag color="red">Huy</Tag>,
    },
    { title: 'Ngay', dataIndex: 'paymentDate', width: 100, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
    {
      title: '', width: 180,
      render: (_: unknown, r: BillingDto) => (
        <Space>
          <Button size="small" onClick={() => { setSelected(r); setDetailModal(true); }}>Chi tiet</Button>
          {r.status === 0 && <Button size="small" type="primary" icon={<DollarOutlined />} onClick={() => { setSelected(r); setCollectModal(true); }}>Thu</Button>}
          {r.insuranceNumber && r.status === 0 && <Button size="small" onClick={() => handleConfirmInsurance(r.id)}>BHYT</Button>}
        </Space>
      ),
    },
  ];

  const itemColumns: ColumnsType<BillingItemDto> = [
    { title: 'Dich vu', dataIndex: 'serviceName' },
    { title: 'SL', dataIndex: 'quantity', width: 50 },
    { title: 'Don gia', dataIndex: 'unitPrice', width: 100, render: (v: number) => v?.toLocaleString() },
    { title: 'Thanh tien', dataIndex: 'totalPrice', width: 100, render: (v: number) => v?.toLocaleString() },
    { title: 'BHYT (%)', dataIndex: 'insuranceRate', width: 80, render: (v: number) => `${(v * 100).toFixed(0)}%` },
    { title: 'BHYT tra', dataIndex: 'insurancePay', width: 100, render: (v: number) => v?.toLocaleString() },
    { title: 'BN tra', dataIndex: 'patientPay', width: 100, render: (v: number) => v?.toLocaleString() },
  ];

  const paidTotal = billings.filter(b => b.status === 1).reduce((s, b) => s + b.patientPay, 0);
  const unpaidTotal = billings.filter(b => b.status === 0).reduce((s, b) => s + b.patientPay, 0);

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'billing', label: 'Vien phi',
          children: (
            <Card>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col xs={12} sm={6}><Card><Statistic title="Tong hoa don" value={billings.length} /></Card></Col>
                <Col xs={12} sm={6}><Card><Statistic title="Chua thu" value={billings.filter(b => b.status === 0).length} styles={{ content: { color: '#faad14' } }} /></Card></Col>
                <Col xs={12} sm={6}><Card><Statistic title="Da thu" value={paidTotal.toLocaleString()} suffix="d" styles={{ content: { color: '#52c41a' } }} /></Card></Col>
                <Col xs={12} sm={6}><Card><Statistic title="Con no" value={unpaidTotal.toLocaleString()} suffix="d" styles={{ content: { color: '#f5222d' } }} /></Card></Col>
              </Row>

              <Space style={{ marginBottom: 16 }}>
                <Input placeholder="Tim kiem..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchBillings()} style={{ width: 200 }} />
                <Select placeholder="Trang thai" allowClear style={{ width: 140 }} value={statusFilter} onChange={setStatusFilter}
                  options={[{ value: 0, label: 'Chua thu' }, { value: 1, label: 'Da thu' }]}
                />
                <DatePicker.RangePicker format="DD/MM/YYYY" onChange={(d) => setDateRange(d as [dayjs.Dayjs, dayjs.Dayjs] | null)} />
                <Button icon={<ReloadOutlined />} onClick={fetchBillings} />
              </Space>

              <Table columns={columns} dataSource={billings} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 1080 }} />
            </Card>
          ),
        },
        {
          key: 'report', label: 'Bao cao',
          children: (
            <Card title="Bao cao vien phi">
              <p>Chon khoang thoi gian de xuat bao cao thu chi.</p>
              <DatePicker.RangePicker format="DD/MM/YYYY" style={{ marginBottom: 16 }} />
              <br />
              <Button type="primary" icon={<PrinterOutlined />}>Xuat bao cao</Button>
            </Card>
          ),
        },
      ]} />

      <Modal title="Chi tiet vien phi" open={detailModal} onCancel={() => setDetailModal(false)} footer={[
        <Button key="print" icon={<PrinterOutlined />}>In hoa don</Button>,
        <Button key="close" onClick={() => setDetailModal(false)}>Dong</Button>,
      ]} width={800}>
        {selected && (
          <>
            <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Ho ten">{selected.patientName}</Descriptions.Item>
              <Descriptions.Item label="So BHYT">{selected.insuranceNumber}</Descriptions.Item>
              <Descriptions.Item label="Tong phi">{selected.totalAmount?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="BHYT tra">{selected.insurancePay?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="BN tra">{selected.patientPay?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="So phieu">{selected.receiptNumber}</Descriptions.Item>
            </Descriptions>
            <Table columns={itemColumns} dataSource={selected.items} rowKey="id" size="small" pagination={false} />
          </>
        )}
      </Modal>

      <Modal title="Thu phi" open={collectModal} onCancel={() => setCollectModal(false)} onOk={handleCollect} okText="Thu phi">
        {selected && (
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Ho ten">{selected.patientName}</Descriptions.Item>
            <Descriptions.Item label="So tien BN phai tra">
              <span style={{ fontSize: 18, fontWeight: 700, color: '#f5222d' }}>{selected.patientPay?.toLocaleString()} VND</span>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Spin>
  );
}
