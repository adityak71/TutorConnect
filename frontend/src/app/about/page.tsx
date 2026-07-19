"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  GraduationCap, 
  Search, 
  Calendar, 
  TrendingUp, 
  CreditCard, 
  UserCheck, 
  ShieldCheck, 
  Eye, 
  Check 
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const offers = [
    { icon: Search, text: "Find expert tutors by subject and expertise" },
    { icon: Calendar, text: "Easy session booking and scheduling" },
    { icon: TrendingUp, text: "Track learning progress and achievements" },
    { icon: CreditCard, text: "Secure payment management" },
    { icon: UserCheck, text: "Professional tutor profiles" },
    { icon: GraduationCap, text: "Personalized learning experience" },
    { icon: ShieldCheck, text: "Secure authentication and privacy" },
  ];

  const benefits = [
    "Verified and experienced tutors",
    "Simple and user-friendly interface",
    "Flexible scheduling",
    "Progress tracking dashboard",
    "Secure and reliable platform",
    "Responsive across desktop and mobile devices",
  ];

  const steps = [
    { num: "1", title: "Create Account", desc: "Sign up as a student or tutor." },
    { num: "2", title: "Search Tutors", desc: "Filter by subject or rates." },
    { num: "3", title: "Check Availability", desc: "View tutor calendars." },
    { num: "4", title: "Book a Lesson", desc: "Schedule a convenient slot." },
    { num: "5", title: "Learn & Track", desc: "Connect in virtual sessions." },
    { num: "6", title: "Leave a Review", desc: "Share feedback after lessons." },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-muted/30 py-20 border-b">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="container mx-auto px-4 text-center max-w-3xl space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-linear-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
            About TutorConnect
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
            Empowering students to achieve their learning goals by connecting them with qualified tutors through a simple, secure, and interactive online platform.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl space-y-24">
        {/* 2. Who We Are & 3. Our Mission */}
        <section className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Who We Are</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-sm md:text-base">
              <p>
                TutorConnect is an online tutoring platform designed to make quality education accessible to everyone. Our platform connects students with experienced tutors across various subjects, enabling personalized learning through scheduled one-on-one sessions.
              </p>
              <p>
                We aim to simplify the learning process by providing an intuitive platform where students can discover tutors, book sessions, track their progress, and manage payments, while tutors can efficiently organize their teaching schedules and monitor student performance.
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-primary">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              Our mission is to bridge the gap between students and skilled educators by creating a reliable, secure, and technology-driven learning environment that promotes academic growth and lifelong learning.
            </p>
          </div>
        </section>

        {/* 4. What We Offer */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">What We Offer</h2>
            <p className="text-sm text-muted-foreground mt-1.5">Core features designed for a seamless educational journey.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {offers.map((offer, idx) => {
              const Icon = offer.icon;
              return (
                <div key={idx} className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border/50 hover:bg-muted/10 transition-colors">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-lg shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium leading-snug">{offer.text}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Why Choose Us? */}
        <section className="grid md:grid-cols-2 gap-12 items-center bg-muted/20 border rounded-3xl p-8 md:p-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Why Choose Us?</h2>
            <div className="grid gap-3.5">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-1.5 rounded-full shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-background shadow-xl">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" alt="Students studying together" className="object-cover h-full w-full" />
          </div>
        </section>

        {/* 6. How It Works */}
        <section className="space-y-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">How It Works</h2>
            <p className="text-sm text-muted-foreground mt-1.5">Your step-by-step path to getting started.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, idx) => (
              <Card key={idx} className="border-none shadow-xs bg-muted/45 hover:bg-muted/60 transition-colors">
                <CardHeader className="pb-3 flex flex-row justify-between items-start">
                  <span className="text-3xl font-black text-primary/20">{step.num}</span>
                </CardHeader>
                <CardContent className="space-y-1">
                  <h3 className="font-bold text-base">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-normal">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 7. Our Vision */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="bg-primary/10 text-primary p-3 rounded-full w-fit mx-auto"><Eye className="h-6 w-6" /></div>
          <h2 className="text-2xl font-bold tracking-tight">Our Vision</h2>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            We envision a future where every student has access to high-quality education regardless of location. By leveraging technology, we strive to create a learning ecosystem that fosters collaboration, continuous improvement, and academic excellence.
          </p>
        </section>

        {/* 8. Call to Action */}
        <section className="bg-linear-to-br from-primary to-indigo-650 text-white rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
          <h2 className="text-3xl font-bold">Ready to start learning?</h2>
          <p className="max-w-md mx-auto text-sm text-white/80 leading-relaxed">
            Join TutorConnect today and connect with experienced tutors who can help you achieve your academic goals.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/tutors">
              <Button size="lg" className="bg-white text-primary hover:bg-white/95 font-semibold rounded-xl px-6 h-12 shadow-sm text-sm">
                Find a Tutor
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold rounded-xl px-6 h-12 text-sm">
                Become a Tutor
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" className="bg-white/25 text-white hover:bg-white/35 font-semibold rounded-xl px-6 h-12 text-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
