"use client";

import { useQuery } from '@tanstack/react-query';
import { getSessions } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Video, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Session } from '@/types';

export default function StudentDashboard() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: getSessions,
  });

  const sessions: Session[] = response?.data || [];
  
  // Quick hack to distinguish upcoming vs past based on status for the mock UI
  const upcomingSessions = sessions.filter(s => s.status === 'upcoming');
  const pastSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground">Here is your learning overview for today.</p>
        </div>
        <Link href="/tutors">
          <Button>Book a New Session</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-md bg-linear-to-br from-blue-500 to-indigo-600 text-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Upcoming Sessions</CardTitle>
            <div className="bg-white/20 p-2 rounded-lg"><Clock className="h-4 w-4 text-white" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-white/80 mt-1">Next one in 2 days</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white dark:bg-black/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Lessons</CardTitle>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg"><Video className="h-4 w-4 text-purple-600 dark:text-purple-400" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{pastSessions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">+2 from last month</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white dark:bg-black/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assignments Pending</CardTitle>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg"><FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">1</div>
            <p className="text-xs text-muted-foreground mt-1">Due tomorrow</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-md bg-white dark:bg-black/50">
          <CardHeader>
            <CardTitle className="text-xl">Upcoming Schedule</CardTitle>
            <CardDescription>Your planned learning sessions for this week.</CardDescription>
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
                        <p className="font-semibold text-foreground">Session with {session.tutorId}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {new Date(session.startTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="default" className="w-full sm:w-auto rounded-xl">Join Room</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/10">
                No upcoming sessions scheduled.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-md bg-white dark:bg-black/50">
          <CardHeader>
            <CardTitle className="text-xl">Recent Tutors</CardTitle>
            <CardDescription>Pick up where you left off.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center justify-between group hover:bg-muted/30 p-2 -mx-2 rounded-xl transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-muted rounded-full overflow-hidden border-2 border-background shadow-xs">
                        <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="Tutor avatar" className="object-cover h-full w-full" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-none text-foreground">Tutor Name</p>
                        <p className="text-sm text-muted-foreground mt-1">Mathematics</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
