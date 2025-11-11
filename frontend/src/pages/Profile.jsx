import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Trophy, Award, Calendar, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile({ user, logout, setUser }) {
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user.full_name,
    phone: user.phone || '',
    location: user.location || '',
    bio: user.bio || '',
  });

  const handleSave = () => {
    // In a real app, this would make an API call to update the profile
    const updatedUser = { ...user, ...profileData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    toast.success('Profile updated successfully');
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      <Navbar user={user} logout={logout} />

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Profile Header */}
            <Card className="mb-8 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-red-500 via-red-600 to-blue-600"></div>
              <CardContent className="-mt-16 relative">
                <div className="flex items-end justify-between mb-6">
                  <div className="flex items-end space-x-4">
                    <Avatar className="h-32 w-32 border-4 border-white bg-gradient-to-br from-red-500 to-blue-500">
                      <AvatarFallback className="text-white font-bold text-4xl">
                        {user.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="mb-2">
                      <h1 className="text-3xl font-bold" data-testid="profile-name">{user.full_name}</h1>
                      <Badge className="mt-2 bg-red-600 text-white" data-testid="profile-role">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant={editing ? 'default' : 'outline'}
                    onClick={() => (editing ? handleSave() : setEditing(true))}
                    className={editing ? 'bg-gradient-to-r from-red-600 to-red-700' : ''}
                    data-testid="edit-profile-button"
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    {editing ? 'Save Profile' : 'Edit Profile'}
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                  <div className="text-center">
                    <Trophy className="h-6 w-6 text-red-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold" data-testid="profile-points">{user.points}</div>
                    <div className="text-sm text-gray-600">Points</div>
                  </div>
                  <div className="text-center">
                    <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold" data-testid="profile-events">{user.participation_count}</div>
                    <div className="text-sm text-gray-600">Events</div>
                  </div>
                  <div className="text-center">
                    <Award className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold" data-testid="profile-wins">{user.wins}</div>
                    <div className="text-sm text-gray-600">Wins</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  {editing ? (
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      data-testid="profile-name-input"
                    />
                  ) : (
                    <div className="flex items-center text-gray-700 p-2">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      {user.full_name}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center text-gray-700 p-2 bg-gray-50 rounded-md">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    {user.email}
                  </div>
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {editing ? (
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="98XXXXXXXX"
                      data-testid="profile-phone-input"
                    />
                  ) : (
                    <div className="flex items-center text-gray-700 p-2">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {user.phone || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  {editing ? (
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      placeholder="Kathmandu, Nepal"
                      data-testid="profile-location-input"
                    />
                  ) : (
                    <div className="flex items-center text-gray-700 p-2">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      {user.location || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {editing ? (
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      data-testid="profile-bio-input"
                    />
                  ) : (
                    <div className="text-gray-700 p-2 bg-gray-50 rounded-md min-h-[80px]">
                      {user.bio || 'No bio provided'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
