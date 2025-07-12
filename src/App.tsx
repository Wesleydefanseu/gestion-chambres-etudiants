import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Help from './pages/Help';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import RoomsList from './pages/Rooms/RoomsList';
import RoomDetail from './pages/Rooms/RoomDetail';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import OwnerDashboard from './pages/Dashboard/OwnerDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';

function PrivateRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user?.role === 'student') {
    return <Navigate to="/student/dashboard" />;
  } else if (user?.role === 'owner') {
    return <Navigate to="/owner/dashboard" />;
  } else if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  }

  return <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/help" element={<Help />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/rooms" element={<RoomsList />} />
              <Route path="/rooms/:id" element={<RoomDetail />} />
              
              {/* Protected Routes */}
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              
              {/* Dashboard redirect */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <DashboardRedirect />
                </PrivateRoute>
              } />
              
              {/* Student routes */}
              <Route path="/student/dashboard" element={
                <PrivateRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </PrivateRoute>
              } />
              
              {/* Owner routes */}
              <Route path="/owner/dashboard" element={
                <PrivateRoute allowedRoles={['owner']}>
                  <OwnerDashboard />
                </PrivateRoute>
              } />
              
              {/* Admin routes */}
              <Route path="/admin/dashboard" element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;