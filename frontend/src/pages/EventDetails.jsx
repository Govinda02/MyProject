import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { eventsAPI, registrationsAPI, donationsAPI } from '@/utils/api';
import { Calendar, MapPin, Users, Trophy, DollarSign, Clock, Award } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

export default function EventDetails({ user, logout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [donationData, setDonationData] = useState({
    donor_name: user?.full_name || '',
    donor_email: user?.email || '',
    amount: '',
    message: '',
    payment_method: 'esewa',
  });

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const [eventRes, regsRes, donationsRes] = await Promise.all([
        eventsAPI.getEvent(id),
        registrationsAPI.getEventRegistrations(id),
        donationsAPI.getEventDonations(id),
      ]);

      setEvent(eventRes.data);
      setRegistrations(regsRes.data);
      setDonations(donationsRes.data);

      if (user) {
        const userReg = regsRes.data.find((reg) => reg.user_id === user.id);
        setIsRegistered(!!userReg);
      }
    } catch (error) {
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login to register');
      navigate('/');
      return;
    }

    try {
      await registrationsAPI.register({ event_id: id });
      toast.success('Successfully registered for the event!');
      fetchEventDetails();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to register');
    }
  };

  const handleDonation = async (e) => {
    e.preventDefault();
    try {
      await donationsAPI.createDonation({ ...donationData, event_id: id });
      toast.success('Thank you for your donation!');
      setDonationOpen(false);
      fetchEventDetails();
    } catch (error) {
      toast.error('Failed to process donation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50">
        <Navbar user={user} logout={logout} />
        <div className="pt-24 text-center">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Event not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      <Navbar user={user} logout={logout} />

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-red-500 via-red-600 to-blue-600 rounded-3xl p-12 mb-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10">
                <Badge className="bg-white/20 text-white border-white/30 mb-4" data-testid="event-sport-badge">
                  {event.sport_type}
                </Badge>
                <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="event-detail-title">{event.title}</h1>
                <p className="text-lg opacity-90 mb-6" data-testid="event-detail-description">{event.description}</p>

                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span data-testid="event-detail-date">{format(new Date(event.event_date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span data-testid="event-detail-time">{format(new Date(event.event_date), 'p')}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span data-testid="event-detail-location">{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    <span data-testid="event-detail-organizer">Organized by {event.organizer_name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Event Info */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Event Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Entry Fee</div>
                        <div className="text-lg font-semibold" data-testid="event-detail-fee">
                          {event.entry_fee > 0 ? `Rs. ${event.entry_fee}` : 'Free'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Prize Pool</div>
                        <div className="text-lg font-semibold" data-testid="event-detail-prize">
                          {event.prize_pool || 'TBA'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Participants</div>
                        <div className="text-lg font-semibold" data-testid="event-detail-participants">
                          {event.current_participants}
                          {event.max_participants ? `/${event.max_participants}` : ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Registration Deadline</div>
                        <div className="text-lg font-semibold" data-testid="event-detail-deadline">
                          {format(new Date(event.registration_deadline), 'PP')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Participants */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                      <Users className="h-6 w-6 mr-2 text-red-600" />
                      Registered Participants ({registrations.length})
                    </h2>
                    {registrations.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" data-testid="participants-list">
                        {registrations.map((reg) => (
                          <div key={reg.id} className="flex items-center space-x-2" data-testid={`participant-${reg.user_id}`}>
                            <Avatar className="h-10 w-10 bg-gradient-to-br from-red-500 to-blue-500">
                              <AvatarFallback className="text-white font-semibold">
                                {reg.user_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-sm font-medium truncate">{reg.user_name}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No participants yet. Be the first to register!</p>
                    )}
                  </CardContent>
                </Card>

                {/* Donations */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                      <Award className="h-6 w-6 mr-2 text-red-600" />
                      Recent Donations ({donations.length})
                    </h2>
                    {donations.length > 0 ? (
                      <div className="space-y-3" data-testid="donations-list">
                        {donations.slice(0, 5).map((donation) => (
                          <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-semibold">{donation.donor_name}</div>
                              {donation.message && <div className="text-sm text-gray-600">"{donation.message}"</div>}
                            </div>
                            <div className="text-lg font-bold text-green-600">Rs. {donation.amount}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No donations yet. Support this event!</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Action Card */}
                <Card className="sticky top-24">
                  <CardContent className="p-6 space-y-4">
                    {isRegistered ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="font-semibold text-green-700">You're registered!</p>
                      </div>
                    ) : (
                      <Button
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 py-6 text-lg"
                        onClick={handleRegister}
                        disabled={!user}
                        data-testid="register-event-button"
                      >
                        {user ? 'Register Now' : 'Login to Register'}
                      </Button>
                    )}

                    <Dialog open={donationOpen} onOpenChange={setDonationOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50 py-6 text-lg"
                          data-testid="donate-button"
                        >
                          <DollarSign className="mr-2 h-5 w-5" />
                          Support with Donation
                        </Button>
                      </DialogTrigger>
                      <DialogContent data-testid="donation-dialog">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">Support This Event</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleDonation} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label>Your Name</Label>
                            <Input
                              value={donationData.donor_name}
                              onChange={(e) => setDonationData({ ...donationData, donor_name: e.target.value })}
                              required
                              data-testid="donation-name-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email (Optional)</Label>
                            <Input
                              type="email"
                              value={donationData.donor_email}
                              onChange={(e) => setDonationData({ ...donationData, donor_email: e.target.value })}
                              data-testid="donation-email-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Amount (Rs.)</Label>
                            <Input
                              type="number"
                              value={donationData.amount}
                              onChange={(e) => setDonationData({ ...donationData, amount: e.target.value })}
                              required
                              min="1"
                              data-testid="donation-amount-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Message (Optional)</Label>
                            <Textarea
                              value={donationData.message}
                              onChange={(e) => setDonationData({ ...donationData, message: e.target.value })}
                              placeholder="Leave a message of support"
                              data-testid="donation-message-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select
                              value={donationData.payment_method}
                              onValueChange={(value) => setDonationData({ ...donationData, payment_method: value })}
                            >
                              <SelectTrigger data-testid="donation-payment-select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="esewa">eSewa</SelectItem>
                                <SelectItem value="khalti">Khalti</SelectItem>
                                <SelectItem value="stripe">Stripe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-green-600 to-green-700"
                            data-testid="donation-submit-button"
                          >
                            Donate Now
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
