import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import TasksPlaceholder from './pages/TasksPlaceholder';
import ProfilePlaceholder from './pages/ProfilePlaceholder';
import SettingsPlaceholder from './pages/SettingsPlaceholder';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Guest Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure Layout Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="tasks" element={<TasksPlaceholder />} />
            <Route path="profile" element={<ProfilePlaceholder />} />
            <Route path="settings" element={<SettingsPlaceholder />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      {/* Toast Alert Config */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-slate-900 dark:text-white border dark:border-slate-800 font-sans text-sm',
          duration: 4000
        }}
      />
    </AuthProvider>
  );
}

export default App;
