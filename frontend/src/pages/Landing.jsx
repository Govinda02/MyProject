import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import AuthDialog from '@/components/AuthDialog';
import EventCard from '@/components/EventCard';
import { eventsAPI } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Trophy, Users, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const sportTypes = ['Football', 'Volleyball', 'Badminton', 'Basketball', 'Marathon', 'Cricket', 'E-Sports', 'Other'];

export default function Landing({ user, setUser, logout }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sport_type: '',
    location: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const params = {};
      if (filters.sport_type) params.sport_type = filters.sport_type;
      if (filters.location) params.location = filters.location;

      const response = await eventsAPI.getEvents(params);
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setLoading(true);
    fetchEvents();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      <Navbar user={user} logout={logout} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-red-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight" data-testid="hero-title">
              Connect. Compete.
              <br />
              <span className="gradient-text">Conquer Together.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto" data-testid="hero-subtitle">
              Join Nepal's premier sports community connecting athletes across rural and urban areas.
              Discover events, climb the leaderboard, and support local sports culture.
            </p>
            {!user && (
              <Button
                size="lg"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-lg px-8 py-6"
                onClick={() => setAuthOpen(true)}
                data-testid="hero-get-started-button"
              >
                Get Started Now
              </Button>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
          >
            {[
              { icon: Trophy, label: 'Active Events', value: events.length, testId: 'stat-events' },
              { icon: Users, label: 'Athletes', value: '2.5K+', testId: 'stat-athletes' },
              { icon: Calendar, label: 'Events Hosted', value: '150+', testId: 'stat-hosted' },
              { icon: TrendingUp, label: 'Growing Daily', value: '+25%', testId: 'stat-growth' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-lg" data-testid={stat.testId}>
                <stat.icon className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 px-4" data-testid="events-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="events-section-title">
              Upcoming <span className="gradient-text">Sports Events</span>
            </h2>
            <p className="text-gray-600 text-lg">Find and join exciting sports events happening near you</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8" data-testid="filter-bar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={filters.sport_type}
                onValueChange={(value) => setFilters({ ...filters, sport_type: value })}
              >
                <SelectTrigger data-testid="filter-sport-select">
                  <SelectValue placeholder="Select Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  {sportTypes.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Search by location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                data-testid="filter-location-input"
              />

              <Button
                onClick={handleFilter}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                data-testid="filter-apply-button"
              >
                <Search className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="events-grid">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No events found. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Trophy className="h-8 w-8 text-red-500" />
            <span className="text-2xl font-bold">Khelcha Nepal</span>
          </div>
          <p className="text-gray-400 mb-4">Connecting athletes and sports enthusiasts across Nepal</p>
          <div className="text-sm text-gray-500">
            © 2025 Khelcha Nepal. All rights reserved.
          </div>
        </div>
      </footer>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} onSuccess={setUser} />
    </div>
  );
}
