import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Records from './pages/Records';
import Reports from './pages/Reports';
import ImportData from './pages/ImportData';
import Settings from './pages/Settings';

import Landing from './pages/Landing';

const RoleBasedRedirect = ({ user }) => {
  if (!user) return <Navigate to="/" />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'HEALTH_WORKER') return <Navigate to="/petugas/dashboard" replace />;
  if (user.role === 'VILLAGE_HEAD') return <Navigate to="/kepala-desa/dashboard" replace />;
  return <Navigate to="/login" />;
};

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <RoleBasedRedirect user={user} />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <RoleBasedRedirect user={user} /> : <Login />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<PrivateRoute allowedRoles={['ADMIN']}><DashboardLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:id" element={<PatientDetail />} />
        <Route path="records" element={<Records />} />
        <Route path="reports" element={<Reports />} />
        <Route path="import" element={<ImportData />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Petugas Kesehatan Routes */}
      <Route path="/petugas" element={<PrivateRoute allowedRoles={['HEALTH_WORKER']}><DashboardLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:id" element={<PatientDetail />} />
        <Route path="records" element={<Records />} />
        <Route path="reports" element={<Reports />} />
        <Route path="import" element={<ImportData />} />
      </Route>

      {/* Kepala Desa Routes */}
      <Route path="/kepala-desa" element={<PrivateRoute allowedRoles={['VILLAGE_HEAD']}><DashboardLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={user ? <RoleBasedRedirect user={user} /> : <Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
