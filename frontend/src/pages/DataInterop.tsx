import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Spin, message, Tabs, Space, DatePicker, Descriptions, Row, Col, Statistic, Input } from 'antd';
import { SyncOutlined, ReloadOutlined, CloudSyncOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
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
      message.success('Dong bo BHYT thanh cong');
      fetchData();
    } catch { message.warning('Loi dong bo BHYT'); }
  };

  const handleSyncHssk = async () => {
    try { await dataInteropApi.syncHssk(); message.success('Dong bo HSSK thanh cong'); fetchData(); } catch { message.warning('Loi dong bo'); }
  };

  const handleSyncV20 = async () => {
    try { await dataInteropApi.syncV20({ month: dayjs().month() + 1, year: dayjs().year() }); message.success('Dong bo V20 thanh cong'); fetchData(); } catch { message.warning('Loi dong bo'); }
  };

  const handleCheckCard = async (insuranceNumber: string) => {
    try {
      const res = await dataInteropApi.checkInsuranceCard(insuranceNumber);
      message.success(`Ket qua: ${JSON.stringify(res.data)}`);
    } catch { message.warning('Khong kiem tra duoc the'); }
  };

  const historyColumns: ColumnsType<SyncJobDto> = [
    { title: 'Loai', dataIndex: 'jobType', width: 100 },
    { title: 'Huong', dataIndex: 'direction', width: 80, render: (v: string) => v === 'upload' ? <Tag color="blue">Gui</Tag> : <Tag color="green">Nhan</Tag> },
    { title: 'Bat dau', dataIndex: 'startTime', width: 130, render: (v: string) => dayjs(v).format('DD/MM HH:mm') },
    { title: 'Ban ghi', dataIndex: 'recordCount', width: 70 },
    { title: 'TC', dataIndex: 'successCount', width: 50 },
    { title: 'Loi', dataIndex: 'errorCount', width: 50 },
    { title: 'Trang thai', dataIndex: 'status', width: 90, render: (v: string) => v === 'success' ? <Tag color="green">TC</Tag> : v === 'failed' ? <Tag color="red">Loi</Tag> : <Tag color="blue">Dang chay</Tag> },
  ];

  const claimColumns: ColumnsType<InsuranceClaimDto> = [
    { title: 'Ho ten', dataIndex: 'patientName', width: 140 },
    { title: 'So BHYT', dataIndex: 'insuranceNumber', width: 140 },
    { title: 'Ngay kham', dataIndex: 'examinationDate', width: 100, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Tong phi', dataIndex: 'totalAmount', width: 100, render: (v: number) => v?.toLocaleString() },
    { title: 'BHYT', dataIndex: 'claimAmount', width: 100, render: (v: number) => v?.toLocaleString() },
    { title: 'TT', dataIndex: 'status', width: 80 },
    { title: 'Dong bo', dataIndex: 'syncStatus', width: 90, render: (v: string) => v === 'synced' ? <Tag color="green">Da gui</Tag> : <Tag color="orange">Chua gui</Tag> },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs items={[
        {
          key: 'overview', label: 'Tong quan',
          children: (
            <Row gutter={16}>
              <Col span={8}>
                <Card title="Lien thong BHYT" size="small" extra={<Button type="primary" size="small" icon={<SyncOutlined />} onClick={handleSyncBhyt}>Dong bo</Button>}>
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Trang thai">{bhytStatus?.connected ? <Tag color="green"><CheckCircleOutlined /> Ket noi</Tag> : <Tag color="red"><CloseCircleOutlined /> Khong</Tag>}</Descriptions.Item>
                    <Descriptions.Item label="Lan cuoi">{bhytStatus?.lastSync ? dayjs(bhytStatus.lastSync as string).format('DD/MM HH:mm') : 'Chua'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Ho so suc khoe (HSSK)" size="small" extra={<Button size="small" icon={<SyncOutlined />} onClick={handleSyncHssk}>Dong bo</Button>}>
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Trang thai">{hsskStatus?.connected ? <Tag color="green">Ket noi</Tag> : <Tag color="red">Khong</Tag>}</Descriptions.Item>
                    <Descriptions.Item label="Lan cuoi">{hsskStatus?.lastSync ? dayjs(hsskStatus.lastSync as string).format('DD/MM HH:mm') : 'Chua'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="V20 (Bao cao tuyen)" size="small" extra={<Button size="small" icon={<SyncOutlined />} onClick={handleSyncV20}>Dong bo</Button>}>
                  <p style={{ fontSize: 13, color: '#666' }}>Gui bao cao hang thang len tuyen tren</p>
                </Card>
              </Col>
            </Row>
          ),
        },
        {
          key: 'bhyt-claims', label: 'Ho so BHYT',
          children: <Card extra={<Space><Button icon={<ReloadOutlined />} onClick={fetchData} /></Space>}>
            <Table columns={claimColumns} dataSource={claims} rowKey="id" size="small" pagination={{ total: cTotal, pageSize: 30 }} scroll={{ x: 850 }} />
          </Card>,
        },
        {
          key: 'check-card', label: 'Tra cuu the BHYT',
          children: (
            <Card title="Tra cuu thong tin the BHYT">
              <Space>
                <Input placeholder="Nhap so the BHYT" style={{ width: 300 }} id="cardInput" />
                <Button type="primary" onClick={() => {
                  const input = document.getElementById('cardInput') as HTMLInputElement;
                  if (input?.value) handleCheckCard(input.value);
                }}>Tra cuu</Button>
              </Space>
            </Card>
          ),
        },
        {
          key: 'history', label: 'Lich su dong bo',
          children: <Card extra={<Button icon={<ReloadOutlined />} onClick={fetchData} />}><Table columns={historyColumns} dataSource={syncHistory} rowKey="id" size="small" pagination={{ pageSize: 20 }} scroll={{ x: 670 }} /></Card>,
        },
      ]} />
    </Spin>
  );
}
