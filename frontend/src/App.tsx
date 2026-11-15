import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { AppLayout } from './layouts/AppLayout';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { MembersPage } from './pages/admin/MembersPage';
import { PlansPage } from './pages/admin/PlansPage';
import { PaymentsPage } from './pages/admin/PaymentsPage';
import { EventsPage } from './pages/admin/EventsPage';
import { ReportsPage } from './pages/admin/ReportsPage';

// Member Pages
import { MemberDashboard } from './pages/member/MemberDashboard';
import { MemberProfilePage } from './pages/member/MemberProfilePage';
import { MemberPlanPage } from './pages/member/MemberPlanPage';
import { MemberPaymentsPage } from './pages/member/MemberPaymentsPage';
import { MemberEventsPage } from './pages/member/MemberEventsPage';

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/member/dashboard'} replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Admin Protected Routes */}
          <Route element={<AppLayout requiredRole="ADMIN" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/members" element={<MembersPage />} />
            <Route path="/admin/plans" element={<PlansPage />} />
            <Route path="/admin/payments" element={<PaymentsPage />} />
            <Route path="/admin/events" element={<EventsPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
          </Route>

          {/* Member Protected Routes */}
          <Route element={<AppLayout requiredRole="MEMBER" />}>
            <Route path="/member/dashboard" element={<MemberDashboard />} />
            <Route path="/member/profile" element={<MemberProfilePage />} />
            <Route path="/member/membership" element={<MemberPlanPage />} />
            <Route path="/member/payments" element={<MemberPaymentsPage />} />
            <Route path="/member/events" element={<MemberEventsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
