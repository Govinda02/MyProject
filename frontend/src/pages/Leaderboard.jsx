import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { leaderboardAPI } from '@/utils/api';
import { Trophy, Award, Medal, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function Leaderboard({ user, logout }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.getLeaderboard(50);
      setLeaderboard(response.data);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50' };
    if (rank === 2) return { icon: Award, color: 'text-gray-400', bg: 'bg-gray-50' };
    if (rank === 3) return { icon: Medal, color: 'text-orange-500', bg: 'bg-orange-50' };
    return { icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      <Navbar user={user} logout={logout} />

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="leaderboard-title">
                <span className="gradient-text">Leaderboard</span>
              </h1>
              <p className="text-gray-600 text-lg">Top athletes competing across Nepal</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              </div>
            ) : leaderboard.length > 0 ? (
              <>
                {/* Top 3 Podium */}
                {leaderboard.length >= 3 && (
                  <div className="grid grid-cols-3 gap-4 mb-12" data-testid="podium-section">
                    {/* 2nd Place */}
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="flex flex-col items-center"
                    >
                      <Card className="w-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300">
                        <CardContent className="p-6 text-center">
                          <Avatar className="h-20 w-20 mx-auto mb-3 bg-gradient-to-br from-gray-400 to-gray-500">
                            <AvatarFallback className="text-white font-bold text-2xl">
                              {leaderboard[1].full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <Badge className="bg-gray-400 text-white mb-2">2nd Place</Badge>
                          <h3 className="font-bold text-lg mb-1">{leaderboard[1].full_name}</h3>
                          <div className="text-3xl font-bold text-gray-700">{leaderboard[1].points}</div>
                          <div className="text-sm text-gray-600">points</div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* 1st Place */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-col items-center -mt-8"
                    >
                      <Card className="w-full bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-500">
                        <CardContent className="p-6 text-center">
                          <div className="relative">
                            <Avatar className="h-24 w-24 mx-auto mb-3 bg-gradient-to-br from-yellow-400 to-yellow-600">
                              <AvatarFallback className="text-white font-bold text-3xl">
                                {leaderboard[0].full_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <Trophy className="absolute top-0 -right-2 h-8 w-8 text-yellow-600" />
                          </div>
                          <Badge className="bg-yellow-600 text-white mb-2">Champion</Badge>
                          <h3 className="font-bold text-xl mb-1">{leaderboard[0].full_name}</h3>
                          <div className="text-4xl font-bold text-yellow-700">{leaderboard[0].points}</div>
                          <div className="text-sm text-gray-600">points</div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* 3rd Place */}
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="flex flex-col items-center"
                    >
                      <Card className="w-full bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300">
                        <CardContent className="p-6 text-center">
                          <Avatar className="h-20 w-20 mx-auto mb-3 bg-gradient-to-br from-orange-400 to-orange-600">
                            <AvatarFallback className="text-white font-bold text-2xl">
                              {leaderboard[2].full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <Badge className="bg-orange-500 text-white mb-2">3rd Place</Badge>
                          <h3 className="font-bold text-lg mb-1">{leaderboard[2].full_name}</h3>
                          <div className="text-3xl font-bold text-orange-700">{leaderboard[2].points}</div>
                          <div className="text-sm text-gray-600">points</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}

                {/* Rest of Leaderboard */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-3" data-testid="leaderboard-list">
                      {leaderboard.slice(3).map((entry, idx) => {
                        const rankData = getRankIcon(entry.rank);
                        return (
                          <motion.div
                            key={entry.user_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            className={`flex items-center justify-between p-4 rounded-lg hover:shadow-md transition-all ${
                              user?.id === entry.user_id ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'
                            }`}
                            data-testid={`leaderboard-entry-${entry.rank}`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-full ${rankData.bg} flex items-center justify-center`}>
                                <span className="font-bold text-lg" data-testid={`rank-${entry.rank}`}>{entry.rank}</span>
                              </div>
                              <Avatar className="h-12 w-12 bg-gradient-to-br from-red-500 to-blue-500">
                                <AvatarFallback className="text-white font-semibold">
                                  {entry.full_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-lg" data-testid={`name-${entry.rank}`}>{entry.full_name}</div>
                                <div className="text-sm text-gray-600">
                                  {entry.participation_count} events • {entry.wins} wins
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-red-600" data-testid={`points-${entry.rank}`}>{entry.points}</div>
                              <div className="text-sm text-gray-600">points</div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600">No leaderboard data yet</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
