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
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Tổng quan',
  },
  {
    key: 'clinical',
    icon: <MedicineBoxOutlined />,
    label: 'Khám chữa bệnh',
    children: [
      { key: '/reception', icon: <UserOutlined />, label: 'Tiếp đón' },
      { key: '/examination', icon: <SolutionOutlined />, label: 'Khám bệnh' },
      { key: '/inpatient', icon: <HomeOutlined />, label: 'Nội trú' },
      { key: '/billing', icon: <BankOutlined />, label: 'Viện phí' },
      { key: '/laboratory', icon: <ExperimentOutlined />, label: 'Xét nghiệm' },
      { key: '/radiology', icon: <FundOutlined />, label: 'Chẩn đoán hình ảnh' },
      { key: '/driver-license-exam', icon: <CarOutlined />, label: 'Khám lái xe' },
    ],
  },
  {
    key: 'pharmacy',
    icon: <ContainerOutlined />,
    label: 'Dược phẩm',
    children: [
      { key: '/pharmacy', icon: <ShoppingOutlined />, label: 'Kho dược' },
    ],
  },
  {
    key: 'community-health',
    icon: <HeartOutlined />,
    label: 'Y tế cơ sở',
    children: [
      { key: '/population', icon: <TeamOutlined />, label: 'Quản lý dân số' },
      { key: '/communicable-disease', icon: <AlertOutlined />, label: 'Bệnh truyền nhiễm' },
      { key: '/chronic-disease', icon: <MedicineBoxOutlined />, label: 'Bệnh mạn tính' },
      { key: '/reproductive-health', icon: <HeartOutlined />, label: 'CSSKSS' },
      { key: '/hiv-aids', icon: <SafetyOutlined />, label: 'Phòng chống HIV' },
      { key: '/immunization', icon: <ExperimentOutlined />, label: 'Tiêm chủng' },
      { key: '/vitamin-a', icon: <MedicineBoxOutlined />, label: 'Vitamin A' },
      { key: '/nutrition', icon: <HeartOutlined />, label: 'Phòng chống SDD' },
      { key: '/injury-prevention', icon: <AlertOutlined />, label: 'TNTT' },
      { key: '/death-tracking', icon: <FileTextOutlined />, label: 'Tử vong' },
    ],
  },
  {
    key: 'management',
    icon: <AuditOutlined />,
    label: 'Quản lý',
    children: [
      { key: '/health-education', icon: <TeamOutlined />, label: 'Truyền thông GDSK' },
      { key: '/environmental-health', icon: <HomeOutlined />, label: 'VSMT' },
      { key: '/food-safety', icon: <SafetyOutlined />, label: 'ATTP' },
      { key: '/finance', icon: <BankOutlined />, label: 'Tài chính kế toán' },
      { key: '/staff-management', icon: <TeamOutlined />, label: 'Nhân lực' },
      { key: '/equipment-management', icon: <ToolOutlined />, label: 'Tài sản thiết bị' },
    ],
  },
  {
    key: 'system',
    icon: <SettingOutlined />,
    label: 'Hệ thống',
    children: [
      { key: '/master-data', icon: <ContainerOutlined />, label: 'Danh mục' },
      { key: '/reports', icon: <BarChartOutlined />, label: 'Báo cáo' },
      { key: '/system-admin', icon: <SettingOutlined />, label: 'Quản trị' },
      { key: '/data-interop', icon: <CloudSyncOutlined />, label: 'Liên thông dữ liệu' },
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
      { key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'logout') {
        logout();
        navigate('/login');
      }
    },
  };

  const sidebarContent = (
    <>
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <MedicineBoxOutlined />
        </div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            <span className="name">CHIS</span>
            <span className="desc">Y tế cơ sở</span>
          </div>
        )}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={findOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        className="sidebar-menu"
      />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={260}
          className="layout-sidebar"
          style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}
          theme="dark"
        >
          {sidebarContent}
        </Sider>
      )}

      {isMobile && (
        <Drawer
          open={mobileDrawer}
          onClose={() => setMobileDrawer(false)}
          placement="left"
          width={280}
          className="mobile-drawer"
          styles={{ body: { padding: 0 } }}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 260), transition: 'margin-left 0.2s' }}>
        <Header className="layout-header">
          <div className="header-left">
            {isMobile && (
              <Button type="text" icon={<MenuOutlined />} onClick={() => setMobileDrawer(true)} />
            )}
            <span className="header-title">Hệ thống Thông tin Y tế Cơ sở</span>
          </div>
          <div className="header-right">
            <Badge count={unreadCount} size="small">
              <BellOutlined className="header-bell" />
            </Badge>
            <Dropdown menu={userMenu} trigger={['click']}>
              <div className="header-user">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="header-user-name">{user?.fullName || 'User'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="layout-content">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Content>
      </Layout>
    </Layout>
  );
}
