import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Trophy } from 'lucide-react';
import { format } from 'date-fns';

const sportIcons = {
  Football: '⚽',
  Volleyball: '🏐',
  Badminton: '🏸',
  Basketball: '🏀',
  Marathon: '🏃',
  Cricket: '🏏',
  'E-Sports': '🎮',
  Other: '🏆',
};

export default function EventCard({ event }) {
  const navigate = useNavigate();

  return (
    <Card
      className="sport-card overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/event/${event.id}`)}
      data-testid={`event-card-${event.id}`}
    >
      <div className="h-48 bg-gradient-to-br from-red-500 via-red-600 to-blue-600 flex items-center justify-center text-8xl">
        {sportIcons[event.sport_type] || '🏆'}
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors" data-testid="event-title">
            {event.title}
          </h3>
          <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200">
            {event.sport_type}
          </Badge>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2" data-testid="event-description">{event.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-700">
            <Calendar className="h-4 w-4 mr-2 text-red-600" />
            <span data-testid="event-date">{format(new Date(event.event_date), 'PPP')}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <MapPin className="h-4 w-4 mr-2 text-red-600" />
            <span data-testid="event-location">{event.location}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Users className="h-4 w-4 mr-2 text-red-600" />
            <span data-testid="event-participants">
              {event.current_participants}
              {event.max_participants ? `/${event.max_participants}` : ''} Participants
            </span>
          </div>
          <div className="flex items-center text-gray-700">
            <Trophy className="h-4 w-4 mr-2 text-red-600" />
            <span className="font-medium" data-testid="event-organizer">by {event.organizer_name}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 p-4">
        <Button
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/event/${event.id}`);
          }}
          data-testid="event-view-details-button"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
