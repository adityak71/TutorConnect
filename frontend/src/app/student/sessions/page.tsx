"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSessions } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Session } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Video, FileText, CalendarPlus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function MySessionsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  const { data: response, isLoading } = useQuery({
    queryKey: ['sessions', user?.role, user?.id],
    queryFn: () => getSessions(user?.role || 'student', user?.id || ''),
    enabled: !!user?.id,
  });

  const sessions: Session[] = response?.data || [];

  const upcomingSessions = sessions.filter((s) => s.status === 'Pending' || s.status === 'Confirmed');
  const pastSessions = sessions.filter((s) => s.status === 'Completed');
  const cancelledSessions = sessions.filter((s) => s.status === 'Cancelled');

  const getFilteredSessions = () => {
    if (activeTab === 'upcoming') return upcomingSessions;
    if (activeTab === 'past') return pastSessions;
    return cancelledSessions;
  };

  const filteredSessions = getFilteredSessions();

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading sessions...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Sessions</h1>
          <p className="text-muted-foreground mt-1">Manage all your tutoring sessions.</p>
        </div>
        <Link href="/student/book">
          <Button className="gap-2">
            <CalendarPlus className="h-4 w-4" />
            Book New Session
          </Button>
        </Link>
      </div>

      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            "px-6 py-3 font-medium text-sm transition-colors relative",
            activeTab === 'upcoming' ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Upcoming ({upcomingSessions.length})
          {activeTab === 'upcoming' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={cn(
            "px-6 py-3 font-medium text-sm transition-colors relative",
            activeTab === 'past' ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Past ({pastSessions.length})
          {activeTab === 'past' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={cn(
            "px-6 py-3 font-medium text-sm transition-colors relative",
            activeTab === 'cancelled' ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Cancelled ({cancelledSessions.length})
          {activeTab === 'cancelled' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
      </div>

      {filteredSessions.length === 0 ? (
        <Card className="border-dashed shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <CalendarPlus className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">No {activeTab} sessions</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              You don&apos;t have any {activeTab} sessions right now. Book a new session to start learning!
            </p>
            <Link href="/tutors">
              <Button>Find a Tutor</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Session with {session.tutorName || 'Tutor'}</h3>
                      <div className="flex items-center text-muted-foreground mt-1 gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(session.startTime).toLocaleDateString()} at{' '}
                          {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-medium">
                        Status: <span className={cn(
                          session.status === 'Confirmed' ? "text-green-600" :
                          session.status === 'Pending' ? "text-amber-500" :
                          session.status === 'Cancelled' ? "text-red-500" : "text-muted-foreground"
                        )}>{session.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  {session.notes && (
                    <div className="md:w-1/3 bg-muted/30 p-3 rounded-lg text-sm flex items-start gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                      <p className="text-muted-foreground leading-relaxed">{session.notes}</p>
                    </div>
                  )}
                  
                  {activeTab === 'upcoming' && (
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                      <Button variant="outline" size="sm" className="w-full md:w-auto text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">Cancel</Button>
                      <Button size="sm" className="w-full md:w-auto">Join Call</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
