import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ConnectionsProvider } from './context/ConnectionsContext';

// Layouts & Guards
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';

// Pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OverviewPage from './pages/app/OverviewPage';
import ConnectPage from './pages/app/ConnectPage';
import ConnectAwsPage from './pages/app/ConnectAwsPage';
import AccountsPage from './pages/app/AccountsPage';
import Ec2Page from './pages/app/Ec2Page';
import EbsPage from './pages/app/EbsPage';
import CostPage from './pages/app/CostPage';
import InsightsPage from './pages/app/InsightsPage';
import HistoryPage from './pages/app/HistoryPage';
import SettingsPage from './pages/app/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import Styleguide from './pages/dev/Styleguide';

// Protected App Layout wrapper with AppShell
function ProtectedAppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ConnectionsProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Route */}
            <Route path="/" element={<LandingPage />} />

            {/* Unauthenticated Only Routes (redirect to /app/overview if already authenticated) */}
            <Route element={<ProtectedRoute redirectIfAuthenticated />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected App Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<ProtectedAppLayout />}>
                <Route index element={<Navigate to="/app/overview" replace />} />
                <Route path="overview" element={<OverviewPage />} />
                <Route path="connect" element={<ConnectPage />} />
                <Route path="connect/aws" element={<ConnectAwsPage />} />
                <Route path="accounts" element={<AccountsPage />} />
                <Route path="resources/ec2" element={<Ec2Page />} />
                <Route path="resources/ebs" element={<EbsPage />} />
                <Route path="cost" element={<CostPage />} />
                <Route path="insights" element={<InsightsPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Development Only Styleguide (Excluded from production) */}
            {import.meta.env.DEV && (
              <Route path="/__styleguide" element={<Styleguide />} />
            )}

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ConnectionsProvider>
    </AuthProvider>
  );
}
