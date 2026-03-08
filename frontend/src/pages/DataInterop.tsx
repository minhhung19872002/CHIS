import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Tabs, Space, DatePicker, Descriptions, Row, Col, Input } from 'antd';
import { SyncOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { dataInteropApi } from '../api/dataInterop';
import type { SyncJobDto, InsuranceClaimDto } from '../api/dataInterop';

export default function DataInterop() {
  const [loading, setLoading] = useState(false);
  const [syncHistory, setSyncHistory] = useState<SyncJobDto[]>([]);
  const [claims, setClaims] = useState<InsuranceClaimDto[]>([]);
  const [cTotal, setCTotal] = useState(0);
  const [bhytStatus, setBhytStatus] = useState<Record<string, unknown> | null>(null);
  const [hsskStatus, setHsskStatus] = useState<Record<string, unknown> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [hist, bhyt, hssk, cl] = await Promise.allSettled([
        dataInteropApi.getSyncHistory({ pageSize: 20 }),
        dataInteropApi.getBhytSyncStatus(),
        dataInteropApi.getHsskStatus(),
        dataInteropApi.getBhytClaims({ pageSize: 30 }),
      ]);
      if (hist.status === 'fulfilled') setSyncHistory(hist.value.data.items);
      if (bhyt.status === 'fulfilled') setBhytStatus(bhyt.value.data as Record<string, unknown>);
      if (hssk.status === 'fulfilled') setHsskStatus(hssk.value.data as Record<string, unknown>);
      if (cl.status === 'fulfilled') { setClaims(cl.value.data.items); setCTotal(cl.value.data.total); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSyncBhyt = async () => {
    try {
      await dataInteropApi.syncBhytClaims({ fromDate: dayjs().startOf('month').format('YYYY-MM-DD'), toDate: dayjs().format('YYYY-MM-DD') });
      message.success('Đồng bộ BHYT thành công');
      fetchData();
    } catch { message.warning('Lỗi đồng bộ BHYT'); }
  };

  const handleSyncHssk = async () => {
    try { await dataInteropApi.syncHssk(); message.success('Đồng bộ HSSK thành công'); fetchData(); } catch { message.warning('Lỗi đồng bộ'); }
  };

  const handleSyncV20 = async () => {
    try { await dataInteropApi.syncV20({ month: dayjs().month() + 1, year: dayjs().year() }); message.success('Đồng bộ V20 thành công'); fetchData(); } catch { message.warning('Lỗi đồng bộ'); }
  };

  const handleCheckCard = async (insuranceNumber: string) => {
    try {
      const res = await dataInteropApi.checkInsuranceCard(insuranceNumber);
      message.success(`Kết quả: ${JSON.stringify(res.data)}`);
    } catch { message.warning('Không kiểm tra được thẻ'); }
  };

  const historyColumns: ColumnsType<SyncJobDto> = [
    { title: 'Loại', dataIndex: 'jobType', width: 100 },
    { title: 'Hướng', dataIndex: 'direction', width: 80, render: (v: string) => v === 'upload' ? <Tag color="blue">Gửi</Tag> : <Tag color="green">Nhận</Tag> },
    { title: 'Bắt đầu', dataIndex: 'startTime', width: 130, render: (v: string) => dayjs(v).format('DD/MM HH:mm') },
    { title: 'Bản ghi', dataIndex: 'recordCount', width: 70, align: 'right' },
    { title: 'TC', dataIndex: 'successCount', width: 50, align: 'right' },
    { title: 'Lỗi', dataIndex: 'errorCount', width: 50, align: 'right' },
    { title: 'Trạng thái', dataIndex: 'status', width: 90, render: (v: string) => v === 'success' ? <Tag color="green">TC</Tag> : v === 'failed' ? <Tag color="red">Lỗi</Tag> : <Tag color="blue">Đang chạy</Tag> },
  ];

  const claimColumns: ColumnsType<InsuranceClaimDto> = [
    { title: 'Họ tên', dataIndex: 'patientName', width: 140 },
    { title: 'Số BHYT', dataIndex: 'insuranceNumber', width: 140 },
    { title: 'Ngày khám', dataIndex: 'examinationDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Tổng phí', dataIndex: 'totalAmount', width: 100, align: 'right', render: (v: number) => v?.toLocaleString() },
    { title: 'BHYT', dataIndex: 'claimAmount', width: 100, align: 'right', render: (v: number) => v?.toLocaleString() },
    { title: 'TT', dataIndex: 'status', width: 80 },
    { title: 'Đồng bộ', dataIndex: 'syncStatus', width: 90, render: (v: string) => v === 'synced' ? <Tag color="green">Đã gửi</Tag> : <Tag color="orange">Chưa gửi</Tag> },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'overview', label: 'Tổng quan',
          children: (
            <Row gutter={16}>
              <Col span={8}>
                <Card title="Liên thông BHYT" size="small" extra={<Button type="primary" size="small" icon={<SyncOutlined />} onClick={handleSyncBhyt}>Đồng bộ</Button>}>
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Trạng thái">{bhytStatus?.connected ? <Tag color="green"><CheckCircleOutlined /> Kết nối</Tag> : <Tag color="red"><CloseCircleOutlined /> Không</Tag>}</Descriptions.Item>
                    <Descriptions.Item label="Lần cuối">{bhytStatus?.lastSync ? dayjs(bhytStatus.lastSync as string).format('DD/MM HH:mm') : 'Chưa'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Hồ sơ sức khỏe (HSSK)" size="small" extra={<Button size="small" icon={<SyncOutlined />} onClick={handleSyncHssk}>Đồng bộ</Button>}>
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Trạng thái">{hsskStatus?.connected ? <Tag color="green">Kết nối</Tag> : <Tag color="red">Không</Tag>}</Descriptions.Item>
                    <Descriptions.Item label="Lần cuối">{hsskStatus?.lastSync ? dayjs(hsskStatus.lastSync as string).format('DD/MM HH:mm') : 'Chưa'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="V20 (Báo cáo tuyến)" size="small" extra={<Button size="small" icon={<SyncOutlined />} onClick={handleSyncV20}>Đồng bộ</Button>}>
                  <p style={{ fontSize: 13, color: '#666' }}>Gửi báo cáo hàng tháng lên tuyến trên</p>
                </Card>
              </Col>
            </Row>
          ),
        },
        {
          key: 'bhyt-claims', label: 'Hồ sơ BHYT',
          children: (
            <Card extra={<Button icon={<ReloadOutlined />} onClick={fetchData} />}>
              <Table columns={claimColumns} dataSource={claims} rowKey="id" size="small" pagination={{ total: cTotal, pageSize: 30 }} scroll={{ x: 850 }} />
            </Card>
          ),
        },
        {
          key: 'check-card', label: 'Tra cứu thẻ BHYT',
          children: (
            <Card title="Tra cứu thông tin thẻ BHYT">
              <Space>
                <Input placeholder="Nhập số thẻ BHYT" style={{ width: 300 }} id="cardInput" />
                <Button type="primary" onClick={() => {
                  const input = document.getElementById('cardInput') as HTMLInputElement;
                  if (input?.value) handleCheckCard(input.value);
                }}>Tra cứu</Button>
              </Space>
            </Card>
          ),
        },
        {
          key: 'history', label: 'Lịch sử đồng bộ',
          children: (
            <Card extra={<Button icon={<ReloadOutlined />} onClick={fetchData} />}>
              <Table columns={historyColumns} dataSource={syncHistory} rowKey="id" size="small" pagination={{ pageSize: 20 }} scroll={{ x: 670 }} />
            </Card>
          ),
        },
      ]} />
    </Spin>
  );
}
