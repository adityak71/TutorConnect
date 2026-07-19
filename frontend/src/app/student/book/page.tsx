"use client";

import { useQuery } from '@tanstack/react-query';
import { getTutorById, bookSession, createPayment, executePaymentWebhook } from '@/services/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, ArrowLeft, Calendar, Clock, CreditCard, CheckCircle } from 'lucide-react';
import Link from 'next/link';

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tutorId = searchParams.get('tutor');

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['tutor', tutorId],
    queryFn: () => getTutorById(tutorId as string),
    enabled: !!tutorId,
  });

  const tutor = response?.data;

  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(1); // Hours
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Multi-step booking states
  const [step, setStep] = useState(1); // 1: Schedule, 2: Payment, 3: Success
  const [bookingId, setBookingId] = useState('');
  const [transactionId, setTransactionId] = useState('');

  if (!tutorId) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">No Tutor Selected</h2>
        <p className="text-muted-foreground mb-8">Please choose a tutor first.</p>
        <Link href="/tutors">
          <Button>Browse Tutors</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-96 bg-muted rounded-xl" />
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Tutor Not Found</h2>
        <p className="text-muted-foreground mb-8">Could not fetch profile details.</p>
        <Link href="/tutors">
          <Button>Back to Tutors</Button>
        </Link>
      </div>
    );
  }

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Create date object literally in UTC to prevent timezone offset shifts
      const [year, month, day] = date.split('-').map(Number);
      const [hour, minute] = time.split(':').map(Number);
      const startDateTime = new Date(Date.UTC(year, month - 1, day, hour, minute));
      const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000);

      // 1. Submit session booking
      const bookRes = await bookSession({
        tutorId: tutor.userId || tutor.id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        notes,
      });

      if (bookRes.success && bookRes.data) {
        setBookingId(bookRes.data._id);
        setStep(2); // Proceed to payment
      } else {
        setErrorMessage(bookRes.message || 'Tutor is not available at this time.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Failed to book session. The tutor might already be booked.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const amount = tutor.hourlyRate * duration;
      
      // 1. Create a pending payment
      const paymentRes = await createPayment({
        sessionId: bookingId,
        amount,
      });

      if (paymentRes.success && paymentRes.data) {
        const txId = paymentRes.data.transactionId;
        setTransactionId(txId);

        // 2. Trigger webhook completion (simulate gateway success)
        const webhookRes = await executePaymentWebhook({
          transactionId: txId,
          status: 'Completed',
        });

        if (webhookRes.success) {
          setStep(3); // Success step
        } else {
          setErrorMessage('Payment failed. Gateway error.');
        }
      } else {
        setErrorMessage(paymentRes.message || 'Payment initiation failed.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCost = tutor.hourlyRate * duration;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-4 text-muted-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      {step === 1 && (
        <Card className="shadow-lg border-border/50">
          <CardHeader className="border-b bg-muted/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl">Schedule a Lesson</CardTitle>
                <CardDescription>Select a date and time to meet with your tutor.</CardDescription>
              </div>
              <div className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border/60">
                <img src={tutor.avatar} alt={tutor.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-sm leading-none">{tutor.name}</p>
                  <p className="text-xs text-amber-500 font-medium flex items-center gap-0.5 mt-1">
                    <Star className="h-3 w-3 fill-current" /> {tutor.rating}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {errorMessage && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6 text-center font-medium border border-destructive/20">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleBook} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="date" className="text-sm font-medium flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" /> Select Date
                  </label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="time" className="text-sm font-medium flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" /> Select Time
                  </label>
                  <Input
                    id="time"
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="duration" className="text-sm font-medium">Lesson Duration (Hours)</label>
                <div className="flex items-center gap-4">
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    max={4}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="h-11 w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    Cost: ${tutor.hourlyRate}/hr × {duration} hr(s) = <strong>${totalCost}</strong>
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">Study goals / notes for the tutor</label>
                <Textarea
                  id="notes"
                  placeholder="Tell your tutor what you would like to cover or review in this lesson..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] rounded-xl"
                />
              </div>

              <Button type="submit" className="w-full h-12 text-base mt-2" disabled={isSubmitting}>
                {isSubmitting ? 'Checking availability...' : 'Confirm Details & Proceed'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="shadow-lg border-border/50">
          <CardHeader className="text-center pb-6 border-b bg-muted/10">
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
              <CreditCard className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Confirm Payment</CardTitle>
            <CardDescription>Complete transaction to finalize your lesson.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {errorMessage && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center font-medium border border-destructive/20">
                {errorMessage}
              </div>
            )}

            <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tutor:</span>
                <span className="font-semibold">{tutor.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Schedule:</span>
                <span className="font-semibold">{date} at {time} ({duration} hr)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hourly Rate:</span>
                <span className="font-semibold">${tutor.hourlyRate}/hr</span>
              </div>
              <div className="h-px bg-border my-1" />
              <div className="flex justify-between text-base font-bold">
                <span>Total Amount:</span>
                <span className="text-primary">${totalCost}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              We mock Stripe payment flows. Proceeding simulates successfully debiting your card and issuing transaction invoices.
            </p>

            <Button onClick={handlePayment} className="w-full h-12 text-base" disabled={isSubmitting}>
              {isSubmitting ? 'Authorizing Mock Card...' : `Pay $${totalCost} & Confirm Book`}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="shadow-lg border-primary/20 bg-card text-center p-8">
          <CardContent className="space-y-6 pt-6">
            <div className="mx-auto bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-full w-fit">
              <CheckCircle className="h-12 w-12" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Session Confirmed!</h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Your payment of ${totalCost} was processed successfully. The tutor has been notified and your schedule has been updated.
              </p>
            </div>

            <div className="bg-muted/40 p-4 rounded-xl border max-w-sm mx-auto text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receipt Invoice ID:</span>
                <span className="font-mono text-xs">{transactionId.substring(0, 15)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tutor Name:</span>
                <span>{tutor.name}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/student">
                <Button variant="outline" className="w-full sm:w-auto h-11">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/tutors">
                <Button className="w-full sm:w-auto h-11">
                  Book Another Tutor
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function BookTutorPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 max-w-2xl animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-96 bg-muted rounded-xl" />
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
