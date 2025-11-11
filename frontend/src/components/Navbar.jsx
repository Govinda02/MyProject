import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Trophy, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';

export default function Navbar({ user, logout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
            <Trophy className="h-8 w-8 text-red-600" />
            <span className="text-2xl font-bold gradient-text">Khelcha Nepal</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-red-600 font-medium transition-colors" data-testid="nav-home">
              Events
            </Link>
            <Link to="/leaderboard" className="text-gray-700 hover:text-red-600 font-medium transition-colors" data-testid="nav-leaderboard">
              Leaderboard
            </Link>
            {user && (
              <Link to="/dashboard" className="text-gray-700 hover:text-red-600 font-medium transition-colors" data-testid="nav-dashboard">
                Dashboard
              </Link>
            )}
            {(user?.role === 'organizer' || user?.role === 'admin') && (
              <Link to="/organizer" className="text-gray-700 hover:text-red-600 font-medium transition-colors" data-testid="nav-organizer">
                Organize
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-gray-700 hover:text-red-600 font-medium transition-colors" data-testid="nav-admin">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2" data-testid="user-menu-trigger">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline text-sm font-medium">{user.full_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="menu-profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="menu-dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  {(user.role === 'organizer' || user.role === 'admin') && (
                    <DropdownMenuItem onClick={() => navigate('/organizer')} data-testid="menu-organize">
                      <Trophy className="mr-2 h-4 w-4" />
                      <span>Organize Events</span>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} data-testid="menu-admin">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600" data-testid="menu-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800" data-testid="login-button">
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
