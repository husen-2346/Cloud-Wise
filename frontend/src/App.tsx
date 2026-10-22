
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import ConnectionDashboard from './pages/ConnectionDashboard';
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from './services/authApi';

type Page = 'login' | 'register' | 'dashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [userName, setUserName] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('cloudwise_token');

    if (!savedToken) {
      setIsCheckingSession(false);
      return;
    }

    getCurrentUser(savedToken)
      .then((user) => {
        setToken(savedToken);
        setUserName(
          sessionStorage.getItem('cloudwise_user_name') ||
          user.email.split('@')[0],
        );
        setCurrentPage('dashboard');
      })
      .catch(() => {
        sessionStorage.removeItem('cloudwise_token');
        sessionStorage.removeItem('cloudwise_user_name');
        setToken(null);
        setUserName('');
        setCurrentPage('login');
      })
      .finally(() => {
        setIsCheckingSession(false);
      });
  }, []);

  if (isCheckingSession) {
  return (
    <div className="min-h-screen bg-[#0b1116] flex items-center justify-center text-white">
      Checking session...
    </div>
  );
}

  async function handleRegisterSuccess(account: {
    name: string;
    email: string;
    password: string;
  }): Promise<string | null> {
    try {
      await registerUser({
        name: account.name.trim(),
        email: account.email.trim().toLowerCase(),
        password: account.password,
      });

      setCurrentPage('login');
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : 'Registration failed. Please try again.';
    }
  }

  async function handleLogin(
    email: string,
    password: string,
  ): Promise<string | null> {
    try {
      const response = await loginUser(
        email.trim().toLowerCase(),
        password,
      );

      await getCurrentUser(response.token);

      sessionStorage.setItem('cloudwise_token', response.token);
      sessionStorage.setItem('cloudwise_user_name', response.name);

      setToken(response.token);
      setUserName(response.name);
      setCurrentPage('dashboard');

      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : 'Login failed. Please try again.';
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('cloudwise_token');
    sessionStorage.removeItem('cloudwise_user_name');

    setToken(null);
    setUserName('');
    setCurrentPage('login');
  }

  if (currentPage === 'login') {
    return (
      <Login
        onRegister={() => setCurrentPage('register')}
        onLogin={handleLogin}
      />
    );
  }

  if (currentPage === 'register') {
    return (
      <Register
        onLogin={() => setCurrentPage('login')}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  if (!token) {
    return <Login onRegister={() => setCurrentPage('register')} onLogin={handleLogin} />;
  }
  return (
  <ConnectionDashboard
    userName={userName || 'User'}
    token={token}
    onLogout={handleLogout}
  />
);
}
