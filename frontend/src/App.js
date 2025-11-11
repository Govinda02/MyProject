import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import EventDetails from '@/pages/EventDetails';
import Leaderboard from '@/pages/Leaderboard';
import OrganizerDashboard from '@/pages/OrganizerDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import Profile from '@/pages/Profile';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing user={user} setUser={setUser} logout={logout} />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} logout={logout} /> : <Navigate to="/" />} />
          <Route path="/event/:id" element={<EventDetails user={user} logout={logout} />} />
          <Route path="/leaderboard" element={<Leaderboard user={user} logout={logout} />} />
          <Route path="/organizer" element={user?.role === 'organizer' || user?.role === 'admin' ? <OrganizerDashboard user={user} logout={logout} /> : <Navigate to="/" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard user={user} logout={logout} /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <Profile user={user} logout={logout} setUser={setUser} /> : <Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
