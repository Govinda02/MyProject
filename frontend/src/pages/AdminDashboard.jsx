import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminAPI, statsAPI } from '@/utils/api';
import { Shield, Calendar, MapPin, Users, CheckCircle, Trophy, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminDashboard({ user, logout }) {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [pendingRes, statsRes] = await Promise.all([
        adminAPI.getPendingEvents(),
        statsAPI.getStats(),
      ]);
      setPendingEvents(pendingRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      await adminAPI.approveEvent(eventId);
      toast.success('Event approved successfully');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to approve event');
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
              <h1 className="text-4xl sm:text-5xl font-bold mb-2" data-testid="admin-title">
                <span className="gradient-text">Admin Dashboard</span>
              </h1>
              <p className="text-gray-600 text-lg">Manage platform events and users</p>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
                  <CardContent className="p-6">
                    <Trophy className="h-8 w-8 mb-2 opacity-80" />
                    <div className="text-3xl font-bold" data-testid="admin-stat-events">{stats.total_events}</div>
                    <div className="text-sm opacity-90">Total Events</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                  <CardContent className="p-6">
                    <Users className="h-8 w-8 mb-2 opacity-80" />
                    <div className="text-3xl font-bold" data-testid="admin-stat-users">{stats.total_users}</div>
                    <div className="text-sm opacity-90">Total Users</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                  <CardContent className="p-6">
                    <Calendar className="h-8 w-8 mb-2 opacity-80" />
                    <div className="text-3xl font-bold" data-testid="admin-stat-registrations">{stats.total_registrations}</div>
                    <div className="text-sm opacity-90">Registrations</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                  <CardContent className="p-6">
                    <DollarSign className="h-8 w-8 mb-2 opacity-80" />
                    <div className="text-3xl font-bold" data-testid="admin-stat-donations">{stats.total_donations}</div>
                    <div className="text-sm opacity-90">Donations</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Pending Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-red-600" />
                  Pending Event Approvals ({pendingEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  </div>
                ) : pendingEvents.length > 0 ? (
                  <div className="space-y-4" data-testid="pending-events-list">
                    {pendingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                        data-testid={`pending-event-${event.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold" data-testid="pending-event-title">{event.title}</h3>
                            <Badge className="bg-red-100 text-red-700">{event.sport_type}</Badge>
                          </div>
                          <p className="text-gray-600 mb-3" data-testid="pending-event-description">{event.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-red-600" />
                              <span data-testid="pending-event-date">{format(new Date(event.event_date), 'PPP')}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-red-600" />
                              <span data-testid="pending-event-location">{event.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Trophy className="h-4 w-4 mr-1 text-red-600" />
                              <span data-testid="pending-event-organizer">by {event.organizer_name}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleApprove(event.id)}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 ml-4"
                          data-testid={`approve-event-button-${event.id}`}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No pending events to review</p>
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
