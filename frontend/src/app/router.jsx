import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LandingPage from '../pages/landing/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import RoleDashboardPage from '../pages/dashboard/RoleDashboardPage';
import SubmitIdeaPage from '../pages/startup/SubmitIdeaPage';
import MyIdeasPage from '../pages/startup/MyIdeasPage';
import StartupInvestorRequestsPage from '../pages/startup/StartupInvestorRequestsPage';
import MentorIdeasPage from '../pages/mentor/MentorIdeasPage';
import InvestorInterestsPage from '../pages/investor/InvestorInterestsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import NotificationsPage from '../pages/profile/NotificationsPage';

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<RoleDashboardPage />} />
      <Route path="/profile/notifications" element={<NotificationsPage />} />
    </Route>

    <Route element={<ProtectedRoute roles={['startup']} />}>
      <Route path="/startup/submit" element={<SubmitIdeaPage />} />
      <Route path="/startup/ideas" element={<MyIdeasPage />} />
      <Route path="/startup/investor-requests" element={<StartupInvestorRequestsPage />} />
    </Route>

    <Route element={<ProtectedRoute roles={['mentor', 'admin']} />}>
      <Route path="/mentor/all-ideas" element={<MentorIdeasPage />} />
    </Route>

    <Route element={<ProtectedRoute roles={['investor']} />}>
      <Route path="/investor/interests" element={<InvestorInterestsPage />} />
    </Route>

    <Route element={<ProtectedRoute roles={['admin']} />}>
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRouter;
