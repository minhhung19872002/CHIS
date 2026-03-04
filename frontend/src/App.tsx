import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reception from './pages/Reception';
import Examination from './pages/Examination';
import Inpatient from './pages/Inpatient';
import Billing from './pages/Billing';
import Laboratory from './pages/Laboratory';
import Radiology from './pages/Radiology';
import Pharmacy from './pages/Pharmacy';
import Population from './pages/Population';
import ChronicDisease from './pages/ChronicDisease';
import CommunicableDisease from './pages/CommunicableDisease';
import ReproductiveHealth from './pages/ReproductiveHealth';
import HivAids from './pages/HivAids';
import Immunization from './pages/Immunization';
import VitaminA from './pages/VitaminA';
import NutritionManagement from './pages/NutritionManagement';
import InjuryPrevention from './pages/InjuryPrevention';
import DeathTracking from './pages/DeathTracking';
import HealthEducation from './pages/HealthEducation';
import EnvironmentalHealth from './pages/EnvironmentalHealth';
import FoodSafety from './pages/FoodSafety';
import Finance from './pages/Finance';
import EquipmentManagement from './pages/EquipmentManagement';
import StaffManagement from './pages/StaffManagement';
import Reports from './pages/Reports';
import SystemAdmin from './pages/SystemAdmin';
import MasterData from './pages/MasterData';
import DataInterop from './pages/DataInterop';
import DriverLicenseExam from './pages/DriverLicenseExam';

dayjs.locale('vi');

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reception" element={<Reception />} />
          <Route path="/examination" element={<Examination />} />
          <Route path="/inpatient" element={<Inpatient />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/laboratory" element={<Laboratory />} />
          <Route path="/radiology" element={<Radiology />} />
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/population" element={<Population />} />
          <Route path="/chronic-disease" element={<ChronicDisease />} />
          <Route path="/communicable-disease" element={<CommunicableDisease />} />
          <Route path="/reproductive-health" element={<ReproductiveHealth />} />
          <Route path="/hiv-aids" element={<HivAids />} />
          <Route path="/immunization" element={<Immunization />} />
          <Route path="/vitamin-a" element={<VitaminA />} />
          <Route path="/nutrition" element={<NutritionManagement />} />
          <Route path="/injury-prevention" element={<InjuryPrevention />} />
          <Route path="/death-tracking" element={<DeathTracking />} />
          <Route path="/health-education" element={<HealthEducation />} />
          <Route path="/environmental-health" element={<EnvironmentalHealth />} />
          <Route path="/food-safety" element={<FoodSafety />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/system-admin" element={<SystemAdmin />} />
          <Route path="/master-data" element={<MasterData />} />
          <Route path="/equipment-management" element={<EquipmentManagement />} />
          <Route path="/staff-management" element={<StaffManagement />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/data-interop" element={<DataInterop />} />
          <Route path="/driver-license-exam" element={<DriverLicenseExam />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ConfigProvider locale={viVN} theme={{ token: { colorPrimary: '#1890ff', borderRadius: 6 } }}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  );
}
