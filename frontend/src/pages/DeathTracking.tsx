import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Modal, Tabs, Input, Space, Form, Row, Col, DatePicker, Select, InputNumber, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import client from '../api/client';

interface DeathRecordDto {
  id: string; deceasedName: string; dateOfDeath: string; age: number; gender: number;
  address: string; causeOfDeath: string; icdCode: string; deathPlace: string;
  classification: string; reporterName: string; note?: string;
}

export default function DeathTracking() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<DeathRecordDto[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<DeathRecordDto | null>(null);
  const [form] = Form.useForm();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('/death-tracking/records', { params: { keyword, year: dayjs().year(), pageSize: 30 } });
      const d = res.data as { items: DeathRecordDto[]; total: number };
      setRecords(d.items || []);
      setTotal(d.total || 0);
    } catch { setRecords([]); } finally { setLoading(false); }
  }, [keyword]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      const data = {
        deceasedName: values.deceasedName, dateOfDeath: (values.dateOfDeath as dayjs.Dayjs)?.format('YYYY-MM-DD'),
        age: values.age, gender: values.gender, address: values.address,
        causeOfDeath: values.causeOfDeath, icdCode: values.icdCode,
        deathPlace: values.deathPlace, classification: values.classification,
        reporterName: values.reporterName, note: values.note,
      };
      if (editing) {
        await client.put(`/death-tracking/records/${editing.id}`, data);
        message.success('Cập nhật thành công');
      } else {
        await client.post('/death-tracking/records', data);
        message.success('Ghi nhận thành công');
      }
      setModal(false); form.resetFields(); setEditing(null); fetchRecords();
    } catch { message.warning('Lỗi lưu dữ liệu'); }
  };

  const handleEdit = (record: DeathRecordDto) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      dateOfDeath: record.dateOfDeath ? dayjs(record.dateOfDeath) : undefined,
    });
    setModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await client.delete(`/death-tracking/records/${id}`);
      message.success('Xóa thành công');
      fetchRecords();
    } catch { message.warning('Lỗi xóa'); }
  };

  const columns: ColumnsType<DeathRecordDto> = [
    { title: 'Họ tên', dataIndex: 'deceasedName', width: 140 },
    { title: 'Ngày mất', dataIndex: 'dateOfDeath', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Tuổi', dataIndex: 'age', width: 50, align: 'right' },
    { title: 'Giới', dataIndex: 'gender', width: 50, render: (v: number) => v === 1 ? 'Nam' : 'Nữ' },
    { title: 'Nguyên nhân', dataIndex: 'causeOfDeath', ellipsis: true },
    { title: 'ICD', dataIndex: 'icdCode', width: 70 },
    { title: 'Nơi mất', dataIndex: 'deathPlace', width: 100 },
    { title: 'Phân loại', dataIndex: 'classification', width: 100, render: (v: string) => v === 'Benh' ? <Tag>Do bệnh</Tag> : v === 'TNTT' ? <Tag color="orange">TNTT</Tag> : <Tag>{v}</Tag> },
    {
      title: '', width: 80, fixed: 'right',
      render: (_: unknown, r: DeathRecordDto) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          <Popconfirm title="Xóa bản ghi này?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
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
          key: 'records', label: 'Ghi nhận tử vong',
          children: (
            <Card extra={
              <Space>
                <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={keyword} onChange={e => setKeyword(e.target.value)} onPressEnter={() => fetchRecords()} style={{ width: 200 }} allowClear />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModal(true); }}>Ghi nhận</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchRecords} />
              </Space>
            }>
              <Table columns={columns} dataSource={records} rowKey="id" size="small" pagination={{ total, pageSize: 30 }} scroll={{ x: 870 }} />
            </Card>
          ),
        },
        {
          key: 'report', label: 'Báo cáo A6/YTCS',
          children: (
            <Card title="Báo cáo tử vong A6/YTCS">
              <Space>
                <DatePicker picker="year" placeholder="Chọn năm" />
                <Button type="primary">Xuất báo cáo</Button>
              </Space>
            </Card>
          ),
        },
      ]} />

      <Modal title={editing ? 'Sửa bản ghi tử vong' : 'Ghi nhận tử vong'} open={modal} onCancel={() => setModal(false)} onOk={() => form.submit()} okText="Lưu" cancelText="Hủy" width={600}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="deceasedName" label="Họ tên người mất" rules={[{ required: true, message: 'Nhập họ tên' }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="dateOfDeath" label="Ngày mất" rules={[{ required: true, message: 'Chọn ngày' }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="age" label="Tuổi" rules={[{ required: true, message: 'Nhập tuổi' }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={8}><Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Chọn giới tính' }]}><Select options={[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nữ' }]} /></Form.Item></Col>
          </Row>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Nhập địa chỉ' }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="causeOfDeath" label="Nguyên nhân tử vong" rules={[{ required: true, message: 'Nhập nguyên nhân' }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="icdCode" label="Mã ICD"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="deathPlace" label="Nơi mất" rules={[{ required: true, message: 'Chọn nơi mất' }]}><Select options={[{ value: 'Bệnh viện', label: 'Bệnh viện' }, { value: 'Trạm y tế', label: 'Trạm y tế' }, { value: 'Nhà', label: 'Tại nhà' }, { value: 'Khác', label: 'Khác' }]} /></Form.Item></Col>
            <Col span={12}><Form.Item name="classification" label="Phân loại"><Select options={[{ value: 'Benh', label: 'Do bệnh' }, { value: 'TNTT', label: 'TNTT' }, { value: 'Khác', label: 'Khác' }]} /></Form.Item></Col>
          </Row>
          <Form.Item name="reporterName" label="Người báo cáo" rules={[{ required: true, message: 'Nhập người báo cáo' }]}><Input /></Form.Item>
          <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
