/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './components/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { AddMedication } from './pages/AddMedication';
import { Analyses } from './pages/Analyses';
import { History } from './pages/History';
import { Settings } from './pages/Settings';

import { MedicalProfile } from './pages/MedicalProfile';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-medication" element={<AddMedication />} />
            <Route path="/analyses" element={<Analyses />} />
            <Route path="/history" element={<History />} />
            <Route path="/medical-profile" element={<MedicalProfile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
