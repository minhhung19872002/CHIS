import { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Spin, Button, Segmented, Tag } from 'antd';
import {
  UserOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  HeartOutlined,
  TeamOutlined,
  ReloadOutlined,
  AlertOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import dayjs from 'dayjs';
import client from '../api/client';

interface DashboardData {
  todayOutpatients: number;
  todayInpatients: number;
  todayLabOrders: number;
  todayPrescriptions: number;
  monthlyVisits: number;
  insuranceRate: number;
  chronicPatients: number;
  immunizationRate: number;
  weeklyTrend: { date: string; outpatient: number; inpatient: number }[];
  diseaseDistribution: { name: string; count: number }[];
  departmentStats: { name: string; visits: number }[];
}

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [chartView, setChartView] = useState<string>('trend');
  const [lastUpdate, setLastUpdate] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('/dashboard');
      setData(res.data);
      setLastUpdate(dayjs().format('HH:mm:ss'));
    } catch {
      setData({
        todayOutpatients: 0, todayInpatients: 0, todayLabOrders: 0, todayPrescriptions: 0,
        monthlyVisits: 0, insuranceRate: 0, chronicPatients: 0, immunizationRate: 0,
        weeklyTrend: [], diseaseDistribution: [], departmentStats: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Tong quan</h2>
          {lastUpdate && <Tag color="blue">Cap nhat: {lastUpdate}</Tag>}
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchData}>Lam moi</Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Kham ngoai tru" value={data?.todayOutpatients || 0} prefix={<UserOutlined />} styles={{ content: { color: '#1890ff' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Noi tru" value={data?.todayInpatients || 0} prefix={<HomeOutlined />} styles={{ content: { color: '#52c41a' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Xet nghiem" value={data?.todayLabOrders || 0} prefix={<ExperimentOutlined />} styles={{ content: { color: '#faad14' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Don thuoc" value={data?.todayPrescriptions || 0} prefix={<MedicineBoxOutlined />} styles={{ content: { color: '#722ed1' } }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Luot kham thang" value={data?.monthlyVisits || 0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Ty le BHYT (%)" value={data?.insuranceRate || 0} suffix="%" prefix={<HeartOutlined />} styles={{ content: { color: '#13c2c2' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="BN man tinh" value={data?.chronicPatients || 0} prefix={<MedicineBoxOutlined />} styles={{ content: { color: '#f5222d' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Ty le tiem chung (%)" value={data?.immunizationRate || 0} suffix="%" prefix={<AlertOutlined />} styles={{ content: { color: '#52c41a' } }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Bieu do thong ke</h3>
          <Segmented
            options={[
              { label: 'Xu huong', value: 'trend' },
              { label: 'Benh', value: 'disease' },
              { label: 'Phong kham', value: 'department' },
            ]}
            value={chartView}
            onChange={(v) => setChartView(v as string)}
          />
        </div>

        {chartView === 'trend' && (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data?.weeklyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="outpatient" name="Ngoai tru" stroke="#1890ff" fill="#1890ff" fillOpacity={0.2} />
              <Area type="monotone" dataKey="inpatient" name="Noi tru" stroke="#52c41a" fill="#52c41a" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {chartView === 'disease' && (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={data?.diseaseDistribution || []} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={120} innerRadius={60} label>
                {(data?.diseaseDistribution || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}

        {chartView === 'department' && (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data?.departmentStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visits" name="Luot kham" fill="#1890ff" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </Spin>
  );
}
