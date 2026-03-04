import { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Spin, Button, Segmented } from 'antd';
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
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import dayjs from 'dayjs';
import client from '../api/client';
import './Dashboard.css';

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

const COLORS = ['#0e7490', '#047857', '#b45309', '#be123c', '#6d28d9', '#0891b2', '#c2410c', '#4338ca'];

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

  const kpiCards = [
    { key: 'outpatient', cls: 'kpi-outpatient', ico: 'ico-blue', icon: <UserOutlined />, value: data?.todayOutpatients, label: 'Khám ngoại trú' },
    { key: 'inpatient', cls: 'kpi-inpatient', ico: 'ico-green', icon: <HomeOutlined />, value: data?.todayInpatients, label: 'Nội trú' },
    { key: 'lab', cls: 'kpi-lab', ico: 'ico-amber', icon: <ExperimentOutlined />, value: data?.todayLabOrders, label: 'Xét nghiệm' },
    { key: 'rx', cls: 'kpi-rx', ico: 'ico-purple', icon: <MedicineBoxOutlined />, value: data?.todayPrescriptions, label: 'Đơn thuốc' },
  ];

  const kpiCards2 = [
    { key: 'monthly', cls: 'kpi-monthly', ico: 'ico-indigo', icon: <TeamOutlined />, value: data?.monthlyVisits, label: 'Lượt khám tháng' },
    { key: 'insurance', cls: 'kpi-insurance', ico: 'ico-cyan', icon: <HeartOutlined />, value: data?.insuranceRate, label: 'Tỷ lệ BHYT (%)', suffix: '%' },
    { key: 'chronic', cls: 'kpi-chronic', ico: 'ico-rose', icon: <MedicineBoxOutlined />, value: data?.chronicPatients, label: 'BN mạn tính' },
    { key: 'immun', cls: 'kpi-immun', ico: 'ico-emerald', icon: <AlertOutlined />, value: data?.immunizationRate, label: 'Tiêm chủng (%)', suffix: '%' },
  ];

  return (
    <Spin spinning={loading}>
      <div className="dash-page">
        {/* Header */}
        <div className="dash-header">
          <div className="dash-header-left">
            <h2>Tổng quan</h2>
            {lastUpdate && (
              <span className="dash-update-tag">
                <span className="dot" />
                Cập nhật lúc {lastUpdate}
              </span>
            )}
          </div>
          <Button icon={<ReloadOutlined />} onClick={fetchData} className="dash-refresh-btn">
            Làm mới
          </Button>
        </div>

        {/* KPI Row 1 */}
        <Row gutter={[16, 16]}>
          {kpiCards.map((kpi) => (
            <Col xs={12} sm={6} key={kpi.key} className="dash-kpi-enter">
              <Card className={`dash-kpi-card ${kpi.cls}`}>
                <div className={`dash-kpi-icon ${kpi.ico}`}>{kpi.icon}</div>
                <div className="dash-kpi-value">
                  {kpi.value ?? 0}{kpi.suffix || ''}
                </div>
                <div className="dash-kpi-label">{kpi.label}</div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* KPI Row 2 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }} className="dash-row-2">
          {kpiCards2.map((kpi) => (
            <Col xs={12} sm={6} key={kpi.key} className="dash-kpi-enter">
              <Card className={`dash-kpi-card ${kpi.cls}`}>
                <div className={`dash-kpi-icon ${kpi.ico}`}>{kpi.icon}</div>
                <div className="dash-kpi-value">
                  {kpi.value ?? 0}{kpi.suffix || ''}
                </div>
                <div className="dash-kpi-label">{kpi.label}</div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Chart Section */}
        <Card className="dash-chart-card">
          <div className="dash-chart-header">
            <h3>Biểu đồ thống kê</h3>
            <Segmented
              options={[
                { label: 'Xu hướng', value: 'trend' },
                { label: 'Bệnh', value: 'disease' },
                { label: 'Phòng khám', value: 'department' },
              ]}
              value={chartView}
              onChange={(v) => setChartView(v as string)}
            />
          </div>

          {chartView === 'trend' && (
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={data?.weeklyTrend || []}>
                <defs>
                  <linearGradient id="gradOutpatient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0e7490" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0e7490" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradInpatient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#8892a4' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8892a4' }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="outpatient" name="Ngoại trú" stroke="#0e7490" strokeWidth={2} fill="url(#gradOutpatient)" />
                <Area type="monotone" dataKey="inpatient" name="Nội trú" stroke="#047857" strokeWidth={2} fill="url(#gradInpatient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {chartView === 'disease' && (
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie
                  data={data?.diseaseDistribution || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  innerRadius={70}
                  strokeWidth={2}
                  stroke="#fff"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
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
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={data?.departmentStats || []} barSize={32}>
                <defs>
                  <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0e7490" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8892a4' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8892a4' }} />
                <Tooltip />
                <Bar dataKey="visits" name="Lượt khám" fill="url(#gradBar)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </Spin>
  );
}
