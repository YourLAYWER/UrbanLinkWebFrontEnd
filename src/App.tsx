import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardPage from '@/pages/DashboardPage';
import LoginPage from '@/pages/LoginPage';
import RoutesPage from '@/pages/RoutesPage';
import TicketsPage from '@/pages/TicketsPage';
import UsersPage from '@/pages/UsersPage';
import FleetPage from '@/pages/FleetPage';
import LiveTrackingPage from '@/pages/LiveTrackingPage';
import FinancePage from '@/pages/FinancePage';
import ShiftMonitoringPage from '@/pages/ShiftMonitoringPage';
import BroadcastAlertPage from '@/pages/BroadcastAlertPage';
import IncidentManagementPage from '@/pages/IncidentManagementPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/fleet" element={<FleetPage />} />
          <Route path="/tracking" element={<LiveTrackingPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/shifts" element={<ShiftMonitoringPage />} />
          <Route path="/broadcast" element={<BroadcastAlertPage />} />
          <Route path="/incidents" element={<IncidentManagementPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
