import { createBrowserRouter, Navigate } from 'react-router';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Wallets } from './pages/Wallets';
import { Income } from './pages/Income';
import { Expenses } from './pages/Expenses';
import { Savings } from './pages/Savings';
import { Investments } from './pages/Investments';
import { Transactions } from './pages/Transactions';
import { Layout } from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wallets',
    element: (
      <ProtectedRoute>
        <Wallets />
      </ProtectedRoute>
    ),
  },
  {
    path: '/income',
    element: (
      <ProtectedRoute>
        <Income />
      </ProtectedRoute>
    ),
  },
  {
    path: '/expenses',
    element: (
      <ProtectedRoute>
        <Expenses />
      </ProtectedRoute>
    ),
  },
  {
    path: '/savings',
    element: (
      <ProtectedRoute>
        <Savings />
      </ProtectedRoute>
    ),
  },
  {
    path: '/investments',
    element: (
      <ProtectedRoute>
        <Investments />
      </ProtectedRoute>
    ),
  },
  {
    path: '/transactions',
    element: (
      <ProtectedRoute>
        <Transactions />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
