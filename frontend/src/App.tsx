
import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import ConnectionDashboard from './pages/ConnectionDashboard';

type Page = 'login' | 'register' | 'dashboard';

interface Account {
  name: string;
  email: string;
  password: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [account, setAccount] = useState<Account | null>(null);
  const [userName, setUserName] = useState('');

  function handleRegisterSuccess(newAccount: Account) {
    const normalizedEmail = newAccount.email.trim().toLowerCase();

    if (account?.email.trim().toLowerCase() === normalizedEmail) {
      return 'An account with this email already exists.';
    }

    setAccount({ ...newAccount, email: normalizedEmail });
    setUserName(newAccount.name.trim());
    setCurrentPage('dashboard');

    return null;
  }

  function handleLogin(email: string, password: string) {
    if (!account) {
      return 'No account found. Please create an account first.';
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail !== account.email ||
      password !== account.password
    ) {
      return 'Invalid email or password.';
    }

    setUserName(account.name);
    setCurrentPage('dashboard');

    return null;
  }

  function handleLogout() {
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

  return (
    <ConnectionDashboard
      userName={userName || 'User'}
      onLogout={handleLogout}
    />
  );
}
