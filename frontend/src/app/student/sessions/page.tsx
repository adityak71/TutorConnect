"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSessions, cancelSession, submitReview } from '@/services/api';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Video, Calendar, Clock, Star, MessageSquare, AlertCircle } from 'lucide-react';
import { Session } from '@/types';

export default function StudentSessionsPage() {
  const queryClient = useQueryClient();
  const { data: response, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: getSessions,
  });

  const sessions: Session[] = response?.data || [];

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [reviewingSession, setReviewingSession] = useState<Session | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const upcomingSessions = sessions.filter(s => s.status === 'upcoming');
  const pastSessions = sessions.filter(s => s.status === 'completed');

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this tutoring session?')) return;

    try {
      await cancelSession(id);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    } catch (err) {
      console.error('Failed to cancel session:', err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSession) return;
    
    setIsSubmittingReview(true);
    setReviewError('');
    setReviewSuccess(false);

    try {
      const res = await submitReview({
        tutorId: reviewingSession.tutorId,
        sessionId: reviewingSession.id,
        rating,
        comment,
      });

      if (res.success) {
        setReviewSuccess(true);
        setTimeout(() => {
          setReviewingSession(null);
          setComment('');
          setRating(5);
          setReviewSuccess(false);
        }, 2000);
      } else {
        setReviewError(res.message || 'Failed to submit review.');
      }
    } catch (err: any) {
      console.error(err);
      setReviewError(err.response?.data?.message || 'You have already reviewed this session.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Sessions</h1>
        <p className="text-muted-foreground">Manage your scheduled lessons and review tutor feedback.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'upcoming'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Upcoming Sessions ({upcomingSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'past'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Past Lessons ({pastSessions.length})
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Card key={i} className="animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'upcoming' && (
            <>
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map(session => (
                  <Card key={session.id} className="overflow-hidden border-border/50 bg-background/50 hover:bg-muted/10 transition-colors">
                    <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                          <Video className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">1-on-1 Lesson with {session.tutorName}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {session.date}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {(() => {
                               const d = new Date(session.startTime);
                               const pad = (n: number) => String(n).padStart(2, '0');
                               return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
                             })()}</span>
                            <span className="font-medium text-foreground">Topic: {session.subject}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" onClick={() => handleCancel(session.id)} className="flex-1 md:flex-none text-destructive hover:bg-destructive/10">
                          Cancel
                        </Button>
                        <Button className="flex-1 md:flex-none">
                          Join Classroom
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-muted/10 text-muted-foreground">
                  <AlertCircle className="mx-auto h-8 w-8 mb-3" />
                  No upcoming tutoring sessions scheduled.
                </div>
              )}
            </>
          )}

          {activeTab === 'past' && (
            <>
              {pastSessions.length > 0 ? (
                pastSessions.map(session => (
                  <Card key={session.id} className="overflow-hidden border-border/40 hover:bg-muted/5 transition-colors">
                    <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-3 rounded-2xl">
                          <CheckCircleIcon />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">1-on-1 Lesson with {session.tutorName}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                            <span>Date: {session.date}</span>
                            <span>Topic: {session.subject}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setReviewingSession(session)}>
                          <MessageSquare className="h-4 w-4" />
                          Leave Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-muted/10 text-muted-foreground">
                  No completed lessons found.
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Review Modal Form overlay */}
      {reviewingSession && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-primary/20">
            <CardHeader>
              <CardTitle>Submit Review</CardTitle>
              <CardDescription>Share your experience with tutor {reviewingSession.tutorName}.</CardDescription>
            </CardHeader>
            <CardContent>
              {reviewSuccess ? (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-xl text-center font-medium border border-green-200">
                  Review submitted successfully!
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {reviewError && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20 text-center font-medium">
                      {reviewError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rating (1 to 5 Stars)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-amber-500 hover:scale-110 transition-transform"
                        >
                          <Star className={`h-8 w-8 ${star <= rating ? 'fill-current' : 'text-muted'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="comment" className="text-sm font-medium">Write your comment</label>
                    <Textarea
                      id="comment"
                      required
                      placeholder="How did the lesson go? What was helpful?"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px] rounded-xl"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <Button type="button" variant="ghost" onClick={() => setReviewingSession(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmittingReview}>
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
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

// Small helper icon component
function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
