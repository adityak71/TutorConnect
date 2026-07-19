"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getTutors, bookSession } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarClock, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTutorId = searchParams.get('tutor');
  const { user } = useAuth();
  
  const [tutorId, setTutorId] = useState(preselectedTutorId || '');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: tutorsResponse, isLoading: isLoadingTutors } = useQuery({
    queryKey: ['tutors'],
    queryFn: getTutors,
  });

  const tutors = tutorsResponse?.data || [];

  const bookMutation = useMutation({
    mutationFn: bookSession,
    onSuccess: () => {
      router.push('/student/sessions');
    },
    onError: (error: any) => {
      setErrorMsg(error.response?.data?.message || 'Failed to book session. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!tutorId || !date || !startTime || !endTime) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    // Combine date and time strings into valid ISO Date strings
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    bookMutation.mutate({
      tutorId,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-0 shadow-lg shadow-black/5 dark:shadow-white/5 ring-1 ring-border">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-2xl flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-primary" />
            Book a New Session
          </CardTitle>
          <CardDescription>
            Select a tutor and a time that works for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {errorMsg && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold">Select Tutor <span className="text-destructive">*</span></label>
            {isLoadingTutors ? (
              <div className="h-10 flex items-center text-muted-foreground text-sm">Loading tutors...</div>
            ) : (
              <select 
                value={tutorId} 
                onChange={(e) => setTutorId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
              >
                <option value="" disabled>Choose a tutor</option>
                {tutors.map((tutor: any) => (
                  <option key={tutor.id} value={tutor.userId}>
                    {tutor.name} - {tutor.subjects.join(', ')} (${tutor.hourlyRate}/hr)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Date <span className="text-destructive">*</span></label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Start Time <span className="text-destructive">*</span></label>
              <input 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">End Time <span className="text-destructive">*</span></label>
              <input 
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">What would you like to learn? (Optional)</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., I need help with Algebra 2 homework..."
              className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background resize-y"
            />
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t px-6 py-4">
          <Button 
            type="submit" 
            className="w-full md:w-auto ml-auto"
            disabled={bookMutation.isPending || isLoadingTutors}
          >
            {bookMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export default function BookSessionPage() {
  return (
    <div className="max-w-2xl mx-auto py-4">
      <Suspense fallback={<div className="p-12 text-center animate-pulse">Loading booking form...</div>}>
        <BookingForm />
      </Suspense>
    </div>
  );
}
