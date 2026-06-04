import { RouterProvider } from 'react-router';
import { AuthProvider } from '../contexts/AuthContext';
import { router } from './routes';
import { ReactNode } from 'react';

// Conditional import for DevInspector
const DevInspector = (import.meta as any).env?.DEV
  ? (await import('./components/dev/DevInspector')).DevInspector
  : ({ children }: { children: ReactNode }) => <>{children}</>;

export default function App() {
  return (
    <AuthProvider>
      <DevInspector>
        <RouterProvider router={router} />
      </DevInspector>
    </AuthProvider>
  );
}