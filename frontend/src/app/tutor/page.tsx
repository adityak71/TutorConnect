"use client";

import { useQuery } from '@tanstack/react-query';
import { getSessions } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, Calendar, Star, Video } from 'lucide-react';

export default function TutorDashboard() {
  const { user } = useAuth();
  
  const { data: response, isLoading } = useQuery({
    queryKey: ['tutor-sessions', user?.role, user?.id],
    queryFn: () => getSessions(user?.role || 'tutor', user?.id || ''),
    enabled: !!user?.id,
  });

  const sessions = response?.data || [];
  const upcomingSessions = sessions.filter((s: any) => s.status === 'Pending' || s.status === 'Confirmed');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tutor Dashboard</h1>
          <p className="text-muted-foreground">Manage your classes, students, and earnings.</p>
        </div>
        <Button variant="outline">Update Availability</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-md bg-linear-to-br from-blue-500 to-indigo-600 text-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Upcoming Sessions</CardTitle>
            <div className="bg-white/20 p-2 rounded-lg"><Calendar className="h-4 w-4 text-white" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-white/80 mt-1">For this week</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-white dark:bg-black/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Students</CardTitle>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg"><Users className="h-4 w-4 text-purple-600 dark:text-purple-400" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">12</div>
            <p className="text-xs text-muted-foreground mt-1">+3 this month</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-black/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Earnings (MTD)</CardTitle>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg"><DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">$850</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-md bg-white dark:bg-black/50">
          <CardHeader>
            <CardTitle className="text-xl">Your Schedule</CardTitle>
            <CardDescription>Upcoming sessions with your students.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-20 bg-muted/50 rounded-2xl animate-pulse" />)}
              </div>
            ) : upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-border/50 bg-background/50 hover:bg-muted/30 p-4 rounded-2xl transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-3.5 rounded-2xl text-blue-600 dark:text-blue-400">
                        <Video className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Session with {session.studentName || session.studentId}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {(() => {
                            const d = new Date(session.startTime);
                            const pad = (n: number) => String(n).padStart(2, '0');
                            return `${pad(d.getUTCDate())}-${pad(d.getUTCMonth() + 1)}-${d.getUTCFullYear()} at ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
                          })()}
                        </p>
                      </div>
                    </div>
                    <Button variant="default" className="w-full sm:w-auto rounded-xl">Start Class</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/10">
                No upcoming sessions.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-md bg-white dark:bg-black/50">
          <CardHeader>
            <CardTitle className="text-xl">Recent Reviews</CardTitle>
            <CardDescription>What students are saying about you.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex gap-4 group hover:bg-muted/30 p-3 -mx-3 rounded-2xl transition-colors cursor-pointer">
                    <div className="h-10 w-10 bg-muted rounded-full overflow-hidden shrink-0 border-2 border-background shadow-xs">
                      <img src={`https://i.pravatar.cc/150?img=${i + 20}`} alt="Student avatar" className="object-cover h-full w-full" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-foreground">Student Name</p>
                        <div className="flex text-amber-500">
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;Great session! Explained the concepts very clearly and helped me solve the problems.&rdquo;</p>
                    </div>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
