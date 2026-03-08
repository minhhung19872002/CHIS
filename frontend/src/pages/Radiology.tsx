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
  const [keyword, setKeyword] = useState('');
  const [resultForm] = Form.useForm();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await radiologyApi.getOrders({ keyword, status: statusFilter, pageSize: 30 });
      setOrders(res.data.items);
      setTotal(res.data.total);
    } catch { setOrders([]); } finally { setLoading(false); }
  }, [statusFilter, keyword]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleEnterResult = async (values: { result: string; conclusion: string }) => {
    if (!selected) return;
    try {
      await radiologyApi.enterResult(selected.id, values);
      message.success('Nhập kết quả thành công');
      setResultModal(false);
      fetchOrders();
    } catch { message.warning('Lỗi nhập kết quả'); }
  };

  const handleApprove = async (id: string) => {
    try {
      await radiologyApi.approve(id);
      message.success('Duyệt kết quả thành công');
      fetchOrders();
    } catch { message.warning('Lỗi duyệt'); }
  };

  const columns: ColumnsType<RadiologyOrderDto> = [
    { title: 'Họ tên', dataIndex: 'patientName', width: 150 },
    { title: 'Loại', dataIndex: 'modality', width: 80 },
    { title: 'Bộ phận', dataIndex: 'bodyPart', width: 120 },
    { title: 'Ngày', dataIndex: 'orderDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'BS chỉ định', dataIndex: 'doctorName', width: 120 },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 100,
      render: (v: number) => v === 0 ? <Tag color="orange">Chờ</Tag> : v === 1 ? <Tag color="blue">Có KQ</Tag> : <Tag color="green">Đã duyệt</Tag>,
    },
    {
      title: '', width: 200,
      render: (_: unknown, r: RadiologyOrderDto) => (
        <Space>
          <Button size="small" onClick={() => setSelected(r)}>Chi tiết</Button>
          {r.status === 0 && <Button size="small" type="primary" onClick={() => { setSelected(r); resultForm.resetFields(); setResultModal(true); }}>Nhập KQ</Button>}
          {r.status === 1 && <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApprove(r.id)}>Duyệt</Button>}
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'orders', label: 'Phiếu CĐHA',
          children: (
            <Card>
              <Space style={{ marginBottom: 16 }}>
                <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchOrders()} style={{ width: 200 }} allowClear />
                <Select placeholder="Trạng thái" allowClear style={{ width: 140 }} value={statusFilter} onChange={setStatusFilter}
                  options={[{ value: 0, label: 'Chờ' }, { value: 1, label: 'Có KQ' }, { value: 2, label: 'Đã duyệt' }]}
                />
                <Select placeholder="Loại" allowClear style={{ width: 120 }}
                  options={[{ value: 'XQ', label: 'X-Quang' }, { value: 'SA', label: 'Siêu âm' }, { value: 'CT', label: 'CT' }]}
                />
                <Button icon={<ReloadOutlined />} onClick={fetchOrders} />
              </Space>
              <Table columns={columns} dataSource={orders} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 870 }} />

              {selected && !resultModal && (
                <Card size="small" title={`Kết quả - ${selected.patientName}`} style={{ marginTop: 16 }}>
                  <p><strong>Loại:</strong> {selected.modality} - {selected.bodyPart}</p>
                  <p><strong>Thông tin lâm sàng:</strong> {selected.clinicalInfo}</p>
                  {selected.result && <p><strong>Mô tả:</strong> {selected.result}</p>}
                  {selected.conclusion && <p><strong>Kết luận:</strong> {selected.conclusion}</p>}
                  {selected.reportDoctorName && <p><strong>BS đọc KQ:</strong> {selected.reportDoctorName}</p>}
                </Card>
              )}
            </Card>
          ),
        },
        {
          key: 'report', label: 'Báo cáo',
          children: (
            <Card title="Báo cáo CĐHA">
              <Space>
                <DatePicker.RangePicker format="DD/MM/YYYY" />
                <Button type="primary">Xuất báo cáo</Button>
              </Space>
            </Card>
          ),
        },
      ]} />

      <Modal title="Nhập kết quả CĐHA" open={resultModal} onCancel={() => setResultModal(false)} onOk={() => resultForm.submit()} okText="Lưu" cancelText="Hủy" width={600}>
        <Form form={resultForm} layout="vertical" onFinish={handleEnterResult}>
          <Form.Item name="result" label="Mô tả hình ảnh" rules={[{ required: true, message: 'Nhập mô tả' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="conclusion" label="Kết luận" rules={[{ required: true, message: 'Nhập kết luận' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
