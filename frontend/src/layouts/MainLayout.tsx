import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Drawer } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  ExperimentOutlined,
  BankOutlined,
  HeartOutlined,
  SafetyOutlined,
  AlertOutlined,
  BarChartOutlined,
  SettingOutlined,
  CloudSyncOutlined,
  MenuOutlined,
  LogoutOutlined,
  BellOutlined,
  HomeOutlined,
  SolutionOutlined,
  ContainerOutlined,
  ShoppingOutlined,
  FundOutlined,
  ToolOutlined,
  FileTextOutlined,
  AuditOutlined,
  CarOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { notificationApi } from '../api/notification';
import ErrorBoundary from '../components/ErrorBoundary';

const { Header, Sider, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Tong quan',
  },
  {
    key: 'clinical',
    icon: <MedicineBoxOutlined />,
    label: 'Kham chua benh',
    children: [
      { key: '/reception', icon: <UserOutlined />, label: 'Tiep don' },
      { key: '/examination', icon: <SolutionOutlined />, label: 'Kham benh' },
      { key: '/inpatient', icon: <HomeOutlined />, label: 'Noi tru' },
      { key: '/billing', icon: <BankOutlined />, label: 'Vien phi' },
      { key: '/laboratory', icon: <ExperimentOutlined />, label: 'Xet nghiem' },
      { key: '/radiology', icon: <FundOutlined />, label: 'Chan doan hinh anh' },
      { key: '/driver-license-exam', icon: <CarOutlined />, label: 'Kham lai xe' },
    ],
  },
  {
    key: 'pharmacy',
    icon: <ContainerOutlined />,
    label: 'Duoc pham',
    children: [
      { key: '/pharmacy', icon: <ShoppingOutlined />, label: 'Kho duoc' },
    ],
  },
  {
    key: 'community-health',
    icon: <HeartOutlined />,
    label: 'Y te co so',
    children: [
      { key: '/population', icon: <TeamOutlined />, label: 'Quan ly dan so' },
      { key: '/communicable-disease', icon: <AlertOutlined />, label: 'Benh truyen nhiem' },
      { key: '/chronic-disease', icon: <MedicineBoxOutlined />, label: 'Benh man tinh' },
      { key: '/reproductive-health', icon: <HeartOutlined />, label: 'CSSKSS' },
      { key: '/hiv-aids', icon: <SafetyOutlined />, label: 'Phong chong HIV' },
      { key: '/immunization', icon: <ExperimentOutlined />, label: 'Tiem chung' },
      { key: '/vitamin-a', icon: <MedicineBoxOutlined />, label: 'Vitamin A' },
      { key: '/nutrition', icon: <HeartOutlined />, label: 'Phong chong SDD' },
      { key: '/injury-prevention', icon: <AlertOutlined />, label: 'TNTT' },
      { key: '/death-tracking', icon: <FileTextOutlined />, label: 'Tu vong' },
    ],
  },
  {
    key: 'management',
    icon: <AuditOutlined />,
    label: 'Quan ly',
    children: [
      { key: '/health-education', icon: <TeamOutlined />, label: 'Truyen thong GDSK' },
      { key: '/environmental-health', icon: <HomeOutlined />, label: 'VSMT' },
      { key: '/food-safety', icon: <SafetyOutlined />, label: 'ATTP' },
      { key: '/finance', icon: <BankOutlined />, label: 'Tai chinh ke toan' },
      { key: '/staff-management', icon: <TeamOutlined />, label: 'Nhan luc' },
      { key: '/equipment-management', icon: <ToolOutlined />, label: 'Tai san thiet bi' },
    ],
  },
  {
    key: 'system',
    icon: <SettingOutlined />,
    label: 'He thong',
    children: [
      { key: '/master-data', icon: <ContainerOutlined />, label: 'Danh muc' },
      { key: '/reports', icon: <BarChartOutlined />, label: 'Bao cao' },
      { key: '/system-admin', icon: <SettingOutlined />, label: 'Quan tri' },
      { key: '/data-interop', icon: <CloudSyncOutlined />, label: 'Lien thong du lieu' },
    ],
  },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileDrawer(false);
      if (window.innerWidth < 1024 && window.innerWidth >= 768) setCollapsed(true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    notificationApi.getUnreadCount()
      .then(res => setUnreadCount(res.data.count))
      .catch(() => { /* ignore */ });
    const interval = setInterval(() => {
      notificationApi.getUnreadCount()
        .then(res => setUnreadCount(res.data.count))
        .catch(() => { /* ignore */ });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
    if (isMobile) setMobileDrawer(false);
  };

  const findOpenKeys = (): string[] => {
    const path = location.pathname;
    for (const item of menuItems) {
      if (item && 'children' in item && item.children) {
        for (const child of item.children) {
          if (child && 'key' in child && child.key === path) {
            return [item.key as string];
          }
        }
      }
    }
    return [];
  };

  const userMenu: MenuProps = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'Thong tin ca nhan' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Dang xuat', danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'logout') {
        logout();
        navigate('/login');
      }
    },
  };

  const sidebarContent = (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      defaultOpenKeys={findOpenKeys()}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ borderRight: 0 }}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={260}
          style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}
          theme="light"
        >
          <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
            <MedicineBoxOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            {!collapsed && <span style={{ marginLeft: 8, fontWeight: 700, fontSize: 15 }}>CHIS</span>}
          </div>
          {sidebarContent}
        </Sider>
      )}

      {isMobile && (
        <Drawer
          open={mobileDrawer}
          onClose={() => setMobileDrawer(false)}
          placement="left"
          width={280}
          styles={{ body: { padding: 0 } }}
        >
          <div style={{ height: 48, display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
            <MedicineBoxOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <span style={{ marginLeft: 8, fontWeight: 700, fontSize: 15 }}>CHIS</span>
          </div>
          {sidebarContent}
        </Drawer>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 260), transition: 'margin-left 0.2s' }}>
        <Header style={{ padding: '0 16px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 99 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && (
              <Button type="text" icon={<MenuOutlined />} onClick={() => setMobileDrawer(true)} />
            )}
            <span style={{ fontSize: 14, color: '#666' }}>He thong thong tin y te co so</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={unreadCount} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={userMenu} trigger={['click']}>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <span style={{ fontSize: 13 }}>{user?.fullName || 'User'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: 16, minHeight: 280 }}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Content>
      </Layout>
    </Layout>
  );
}
