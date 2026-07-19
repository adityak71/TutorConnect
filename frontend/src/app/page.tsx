"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Search, Star, Video, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { dummyTutors } from '@/utils/dummyData';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-900/20 blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-400/20 dark:bg-purple-900/20 blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
        </div>

        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-4xl mx-auto">
            <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 text-sm font-medium">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              Join 10,000+ students learning today
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-extrabold tracking-tight text-foreground mb-8 leading-[1.1]">
              Master Any Subject with <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Expert Tutors</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect with top-rated educators globally. Book 1-on-1 personalized learning sessions and achieve your academic goals faster.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/tutors">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:-translate-y-1">
                  Find a Tutor <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-sm border-2 hover:bg-white dark:hover:bg-black transition-all hover:-translate-y-1">
                  Become a Tutor
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y bg-white/40 dark:bg-black/20 backdrop-blur-md relative z-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Students", value: "10k+" },
              { label: "Expert Tutors", value: "500+" },
              { label: "Subjects", value: "50+" },
              { label: "Average Rating", value: "4.9/5" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <p className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-b from-foreground to-foreground/60 mb-2">{stat.value}</p>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tutors */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-50/50 dark:via-blue-950/20 to-transparent -z-10" />
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="flex flex-col md:flex-row justify-between items-end mb-16"
          >
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold tracking-tight mb-4">Learn from the Best</h2>
              <p className="text-muted-foreground text-xl">
                Our platform features highly qualified tutors with proven track records of student success.
              </p>
            </div>
            <Link href="/tutors" className="mt-6 md:mt-0">
              <Button variant="ghost" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full group">
                View All Tutors <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {dummyTutors.slice(0, 3).map((tutor) => (
              <motion.div key={tutor.id} variants={fadeUp}>
                <Card className="overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border-border/40 hover:border-blue-200 dark:hover:border-blue-800 bg-white/70 dark:bg-black/40 backdrop-blur-sm group cursor-pointer h-full flex flex-col rounded-3xl">
                  <CardHeader className="p-0 relative">
                    <div className="h-32 bg-linear-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 dark:bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>
                    <img 
                      src={tutor.avatar} 
                      alt={tutor.name} 
                      className="w-24 h-24 rounded-full border-4 border-background absolute top-20 left-6 object-cover bg-white shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div className="pt-16 pb-4 px-6 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl mb-1">{tutor.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 text-sm font-medium text-amber-500">
                            <Star className="h-4 w-4 fill-current" />
                            {tutor.rating} ({tutor.reviewsCount} reviews)
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold">${tutor.hourlyRate}</span>
                          <span className="text-muted-foreground text-sm">/hr</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 flex-1 flex flex-col justify-between">
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-6 leading-relaxed">{tutor.bio}</p>
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects.slice(0, 3).map(subject => (
                        <span key={subject} className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-4xl font-bold tracking-tight mb-4">How TutorConnect Works</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-20">
              Get started in minutes and begin your learning journey with our intuitive platform.
            </p>
          </motion.div>
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"
          >
            {/* Connection Line */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-linear-to-r from-transparent via-border to-transparent -z-10" />

            {[
              { icon: Search, title: "Find a Tutor", desc: "Search by subject, price, and availability to find your perfect match." },
              { icon: Calendar, title: "Book a Session", desc: "Choose a time that works for you and securely book your lesson." },
              { icon: Video, title: "Start Learning", desc: "Connect via our integrated classroom and achieve your academic goals." }
            ].map((step, i) => (
              <motion.div key={i} variants={fadeUp} className="flex flex-col items-center group">
                <div className="h-24 w-24 rounded-3xl bg-white dark:bg-black border shadow-xl shadow-black/5 dark:shadow-white/5 flex items-center justify-center mb-8 text-blue-600 dark:text-blue-400 group-hover:-translate-y-2 transition-transform duration-300">
                  <step.icon className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{i+1}. {step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 dark:bg-blue-900 -z-20" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay -z-10" />
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="bg-white/10 dark:bg-black/20 backdrop-blur-lg border border-white/20 rounded-[3rem] p-8 md:p-20 text-center text-white shadow-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Ready to accelerate your learning?</h2>
            <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of students who have already improved their grades and mastered new skills with TutorConnect.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-white text-blue-600 hover:bg-white/90 hover:scale-105 transition-all w-full sm:w-auto shadow-xl">
                  Get Started for Free
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm font-medium text-white/70">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> No credit card required</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Cancel anytime</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Verified tutors</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
