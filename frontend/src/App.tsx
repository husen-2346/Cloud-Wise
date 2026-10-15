import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  const [currentPage, setCurrentPage] = useState<
    'login' | 'register'
  >('login');

  return currentPage === 'login' ? (
    <Login onRegister={() => setCurrentPage('register')} />
  ) : (
    <Register onLogin={() => setCurrentPage('login')} />
  );
}