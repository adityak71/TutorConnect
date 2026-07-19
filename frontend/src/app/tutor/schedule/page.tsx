"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSessions, updateProgress } from '@/services/api';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Video, Calendar, Clock, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { Session } from '@/types';

export default function TutorSchedulePage() {
  const queryClient = useQueryClient();
  
  // 1. Fetch sessions for this tutor
  const { data: response, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: getSessions,
  });

  const sessions: Session[] = response?.data || [];

  const [loggingProgressSession, setLoggingProgressSession] = useState<Session | null>(null);
  const [subject, setSubject] = useState('');
  const [topics, setTopics] = useState('');
  const [status, setStatus] = useState<'In Progress' | 'Completed'>('In Progress');
  const [percentage, setPercentage] = useState(50);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const upcomingSessions = sessions.filter(s => s.status === 'upcoming');
  const pastSessions = sessions.filter(s => s.status === 'completed');

  const handleOpenProgress = (session: Session) => {
    setLoggingProgressSession(session);
    setSubject(session.subject || 'Math');
    setTopics('');
    setStatus('In Progress');
    setPercentage(50);
    setNotes('');
    setFeedback('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingProgressSession) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await updateProgress({
        studentId: loggingProgressSession.studentId,
        sessionId: loggingProgressSession.id,
        subject,
        topicsCovered: topics.split(',').map(t => t.trim()).filter(Boolean),
        status,
        completionPercentage: percentage,
        notes,
        feedback,
      });

      if (res.success) {
        setSuccessMessage('Progress logged and student notified successfully!');
        queryClient.invalidateQueries({ queryKey: ['sessions'] });
        setTimeout(() => {
          setLoggingProgressSession(null);
        }, 1500);
      } else {
        setErrorMessage(res.message || 'Failed to submit progress.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Failed to log progress.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teaching Schedule</h1>
        <p className="text-muted-foreground">Manage your upcoming tutoring slots, check bookings, and log student learning progress.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Upcoming Classes */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Upcoming Sessions ({upcomingSessions.length})
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <Card key={i} className="animate-pulse h-28" />)}
            </div>
          ) : upcomingSessions.length > 0 ? (
            upcomingSessions.map(session => (
              <Card key={session.id} className="overflow-hidden border-border/50 hover:bg-muted/10 transition-colors">
                <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                      <Video className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">Lesson with Student {session.studentName}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {session.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {(() => {
                          const d = new Date(session.startTime);
                          const pad = (n: number) => String(n).padStart(2, '0');
                          return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
                        })()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => handleOpenProgress(session)}>
                      Log Progress
                    </Button>
                    <Button className="flex-1 sm:flex-none">
                      Start Lesson
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-muted/10 text-muted-foreground">
              <AlertCircle className="mx-auto h-8 w-8 mb-3" />
              No classes booked for this week.
            </div>
          )}
        </div>

        {/* Conducted Classes Summary */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" /> Completed Lessons ({pastSessions.length})
          </h2>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">History log</CardTitle>
              <CardDescription>Recently concluded sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                [1, 2].map(i => <div key={i} className="h-12 bg-muted/40 rounded-xl animate-pulse" />)
              ) : pastSessions.length > 0 ? (
                pastSessions.map(session => (
                  <div key={session.id} className="flex justify-between items-center text-sm border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-foreground">{session.studentName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{session.date}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      Conducted
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No session history yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Log Progress Modal overlay */}
      {loggingProgressSession && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl border-primary/20 max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-muted/10 border-b">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Log Lesson Progress
              </CardTitle>
              <CardDescription>
                Compile learning feedback for Student <strong>{loggingProgressSession.studentName}</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {successMessage ? (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-xl text-center font-medium border border-green-200">
                  {successMessage}
                </div>
              ) : (
                <form onSubmit={handleProgressSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20 text-center font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                      <Input
                        id="subject"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="percentage" className="text-sm font-medium">Completion Percentage ({percentage}%)</label>
                      <Input
                        id="percentage"
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={percentage}
                        onChange={(e) => setPercentage(Number(e.target.value))}
                        className="h-11 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="topics" className="text-sm font-medium">Topics Covered (comma-separated)</label>
                    <Input
                      id="topics"
                      placeholder="e.g. Kinematics, Velocity equations, Free fall"
                      value={topics}
                      onChange={(e) => setTopics(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Lesson Status</label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full h-11 px-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="In Progress">In Progress (Unit ongoing)</option>
                      <option value="Completed">Completed (Finalize session)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="notes" className="text-sm font-medium">Private Lesson Notes</label>
                    <Textarea
                      id="notes"
                      placeholder="Notes for grading or record keeping..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="feedback" className="text-sm font-medium">Feedback for Student</label>
                    <Textarea
                      id="feedback"
                      placeholder="Feedback to encourage the student and highlight homework/equations..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <Button type="button" variant="ghost" onClick={() => setLoggingProgressSession(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Logging...' : 'Log Progress'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
