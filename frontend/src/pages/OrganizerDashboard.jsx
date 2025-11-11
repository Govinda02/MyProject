import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { eventsAPI } from '@/utils/api';
import { Plus, Calendar, MapPin, Users, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const sportTypes = ['Football', 'Volleyball', 'Badminton', 'Basketball', 'Marathon', 'Cricket', 'E-Sports', 'Other'];

export default function OrganizerDashboard({ user, logout }) {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    sport_type: 'Football',
    location: '',
    event_date: '',
    registration_deadline: '',
    max_participants: '',
    entry_fee: '0',
    prize_pool: '',
  });

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const response = await eventsAPI.getEvents();
      const myEvents = response.data.filter((event) => event.organizer_id === user.id);
      setMyEvents(myEvents);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await eventsAPI.createEvent({
        ...eventData,
        max_participants: eventData.max_participants ? parseInt(eventData.max_participants) : null,
        entry_fee: parseFloat(eventData.entry_fee),
      });
      toast.success('Event created successfully!');
      setCreateOpen(false);
      fetchMyEvents();
      setEventData({
        title: '',
        description: '',
        sport_type: 'Football',
        location: '',
        event_date: '',
        registration_deadline: '',
        max_participants: '',
        entry_fee: '0',
        prize_pool: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create event');
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-2" data-testid="organizer-title">
                  <span className="gradient-text">Organizer Dashboard</span>
                </h1>
                <p className="text-gray-600 text-lg">Manage your sports events</p>
              </div>

              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                    data-testid="create-event-button"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="create-event-dialog">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Create New Event</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateEvent} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Event Title</Label>
                      <Input
                        value={eventData.title}
                        onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                        required
                        placeholder="Summer Football Championship"
                        data-testid="event-title-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={eventData.description}
                        onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                        required
                        rows={4}
                        placeholder="Describe your event..."
                        data-testid="event-description-input"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Sport Type</Label>
                        <Select
                          value={eventData.sport_type}
                          onValueChange={(value) => setEventData({ ...eventData, sport_type: value })}
                        >
                          <SelectTrigger data-testid="event-sport-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sportTypes.map((sport) => (
                              <SelectItem key={sport} value={sport}>
                                {sport}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          value={eventData.location}
                          onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                          required
                          placeholder="Kathmandu, Nepal"
                          data-testid="event-location-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Event Date & Time</Label>
                        <Input
                          type="datetime-local"
                          value={eventData.event_date}
                          onChange={(e) => setEventData({ ...eventData, event_date: e.target.value })}
                          required
                          data-testid="event-date-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Registration Deadline</Label>
                        <Input
                          type="datetime-local"
                          value={eventData.registration_deadline}
                          onChange={(e) => setEventData({ ...eventData, registration_deadline: e.target.value })}
                          required
                          data-testid="event-deadline-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Max Participants</Label>
                        <Input
                          type="number"
                          value={eventData.max_participants}
                          onChange={(e) => setEventData({ ...eventData, max_participants: e.target.value })}
                          placeholder="Optional"
                          data-testid="event-max-participants-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Entry Fee (Rs.)</Label>
                        <Input
                          type="number"
                          value={eventData.entry_fee}
                          onChange={(e) => setEventData({ ...eventData, entry_fee: e.target.value })}
                          min="0"
                          required
                          data-testid="event-fee-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Prize Pool</Label>
                        <Input
                          value={eventData.prize_pool}
                          onChange={(e) => setEventData({ ...eventData, prize_pool: e.target.value })}
                          placeholder="Rs. 50,000"
                          data-testid="event-prize-input"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                      data-testid="submit-event-button"
                    >
                      Create Event
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Events List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              </div>
            ) : myEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-6" data-testid="organizer-events-list">
                {myEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden" data-testid={`organizer-event-${event.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold" data-testid="event-card-title">{event.title}</h3>
                            <Badge
                              className={
                                event.status === 'approved'
                                  ? 'bg-green-100 text-green-700'
                                  : event.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }
                            >
                              {event.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600" data-testid="event-card-description">{event.description}</p>
                        </div>
                        <Badge variant="secondary" className="bg-red-100 text-red-700">
                          {event.sport_type}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar className="h-4 w-4 mr-2 text-red-600" />
                          <span data-testid="event-card-date">{format(new Date(event.event_date), 'PP')}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <MapPin className="h-4 w-4 mr-2 text-red-600" />
                          <span data-testid="event-card-location">{event.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <Users className="h-4 w-4 mr-2 text-red-600" />
                          <span data-testid="event-card-participants">
                            {event.current_participants}
                            {event.max_participants ? `/${event.max_participants}` : ''} Registered
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-gray-700">
                          Entry: {event.entry_fee > 0 ? `Rs. ${event.entry_fee}` : 'Free'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600 mb-4">No events created yet</p>
                  <Button
                    onClick={() => setCreateOpen(true)}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  >
                    Create Your First Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
