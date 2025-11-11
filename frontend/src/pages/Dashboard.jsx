import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { registrationsAPI, eventsAPI } from '@/utils/api';
import { Trophy, Calendar, MapPin, Award } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Dashboard({ user, logout }) {
  const [registrations, setRegistrations] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const regsResponse = await registrationsAPI.getUserRegistrations();
      setRegistrations(regsResponse.data);

      // Fetch event details for each registration
      const eventPromises = regsResponse.data.map((reg) => eventsAPI.getEvent(reg.event_id));
      const eventsResponse = await Promise.all(eventPromises);
      setRegisteredEvents(eventsResponse.map((res) => res.data));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      <Navbar user={user} logout={logout} />

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold mb-2" data-testid="dashboard-title">
                Welcome back, <span className="gradient-text">{user.full_name}</span>
              </h1>
              <p className="text-gray-600 text-lg">Track your sports journey and achievements</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
                <CardContent className="p-6">
                  <Trophy className="h-8 w-8 mb-2 opacity-80" />
                  <div className="text-3xl font-bold" data-testid="stat-points">{user.points}</div>
                  <div className="text-sm opacity-90">Total Points</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-6">
                  <Calendar className="h-8 w-8 mb-2 opacity-80" />
                  <div className="text-3xl font-bold" data-testid="stat-participation">{user.participation_count}</div>
                  <div className="text-sm opacity-90">Events Joined</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-6">
                  <Award className="h-8 w-8 mb-2 opacity-80" />
                  <div className="text-3xl font-bold" data-testid="stat-wins">{user.wins}</div>
                  <div className="text-sm opacity-90">Wins</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-6">
                  <MapPin className="h-8 w-8 mb-2 opacity-80" />
                  <div className="text-2xl font-bold" data-testid="stat-location">{user.location || 'Nepal'}</div>
                  <div className="text-sm opacity-90">Location</div>
                </CardContent>
              </Card>
            </div>

            {/* Registered Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">My Registered Events</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  </div>
                ) : registeredEvents.length > 0 ? (
                  <div className="space-y-4" data-testid="registered-events-list">
                    {registeredEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        data-testid={`registered-event-${event.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl">
                            🏆
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              {format(new Date(event.event_date), 'PPP')}
                              <span className="mx-2">•</span>
                              <MapPin className="h-4 w-4 mr-1" />
                              {event.location}
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Registered</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No events registered yet. Explore events to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
