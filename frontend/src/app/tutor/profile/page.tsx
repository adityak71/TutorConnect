"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, updateUserProfile, getTutorAvailability, addTutorAvailability, uploadProfilePicture } from '@/services/api';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User, BookOpen, Clock, Calendar, Check, AlertCircle, CalendarClock, Camera, Loader2 } from 'lucide-react';

export default function TutorProfilePage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch current logged-in user profile details
  const { data: userResponse, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const user = userResponse?.data;

  // 2. Fetch tutor's availability slots
  const { data: availabilityResponse, isLoading: isAvailabilityLoading } = useQuery({
    queryKey: ['availability', user?.id],
    queryFn: () => getTutorAvailability(user?.id as string),
    enabled: !!user?.id,
  });

  const availabilitySlots = availabilityResponse?.data || [];

  // Form states for profile
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [subjects, setSubjects] = useState('');
  const [rate, setRate] = useState(30);
  const [experience, setExperience] = useState(1);
  const [avatar, setAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states for availability
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [slotError, setSlotError] = useState('');
  const [slotSuccess, setSlotSuccess] = useState('');

  // Hydrate state once user data is loaded
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || user.profile?.bio || '');
      setSubjects(user.profile?.subjects?.join(', ') || '');
      setRate(user.profile?.hourlyRate || 30);
      setExperience(user.profile?.experienceYears || 1);
      
      // Handle backend relative upload paths
      let avatarUrl = user.avatar || '';
      if (avatarUrl && avatarUrl.startsWith('/uploads')) {
        avatarUrl = `http://localhost:5000${avatarUrl}`;
      }
      setAvatar(avatarUrl);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await updateUserProfile({
        name,
        bio,
        subjects: subjects.split(',').map(s => s.trim()).filter(Boolean),
        hourlyRate: rate,
        experienceYears: experience,
      });

      if (res.success) {
        setSuccessMessage('Profile saved successfully!');
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      } else {
        setErrorMessage(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('picture', file);

    try {
      const res = await uploadProfilePicture(formData);
      if (res.success) {
        let newAvatar = res.profilePicture;
        if (newAvatar && newAvatar.startsWith('/uploads')) {
          newAvatar = `http://localhost:5000${newAvatar}`;
        }
        setAvatar(newAvatar);
        setSuccessMessage('Profile picture updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      } else {
        setErrorMessage(res.message || 'Failed to upload image.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Upload failed. File type might be unsupported.');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingSlot(true);
    setSlotError('');
    setSlotSuccess('');

    try {
      const res = await addTutorAvailability({ dayOfWeek, startTime, endTime });
      if (res.success) {
        setSlotSuccess('Availability slot added successfully!');
        queryClient.invalidateQueries({ queryKey: ['availability', user?.id] });
      } else {
        setSlotError(res.message || 'Failed to add availability.');
      }
    } catch (err: any) {
      console.error(err);
      setSlotError(err.response?.data?.message || 'This availability slot already exists.');
    } finally {
      setIsAddingSlot(false);
    }
  };

  const handleQuickSeed = async () => {
    setIsAddingSlot(true);
    setSlotError('');
    setSlotSuccess('');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (const day of days) {
      try {
        await addTutorAvailability({
          dayOfWeek: day,
          startTime: '08:00',
          endTime: '22:00',
        });
      } catch (err) {
        console.warn(`Day ${day} already has availability or failed:`, err);
      }
    }

    setIsAddingSlot(false);
    setSlotSuccess(`Configured 8:00 AM - 10:00 PM availability for all teaching days!`);
    queryClient.invalidateQueries({ queryKey: ['availability', user?.id] });
  };

  const isLoading = isUserLoading || isAvailabilityLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-96 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile & Availability</h1>
        <p className="text-muted-foreground">Customize your tutor avatar, bio, hourly fee, and manage scheduling hours.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Profile Settings (Col 3) */}
        <div className="md:col-span-3 space-y-6">
          <Card className="shadow-lg border-border/50">
            <CardHeader className="bg-muted/10 border-b">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Profile Settings
              </CardTitle>
              <CardDescription>Update your public tutor details and photo.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 mb-6 border-b pb-6">
                <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-lg bg-muted flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button variant="outline" size="sm" onClick={triggerFileInput} disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Change Profile Photo'}
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {successMessage && (
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg border border-green-200 text-center font-medium">
                    {successMessage}
                  </div>
                )}
                {errorMessage && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20 text-center font-medium">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Public Full Name</label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="rate" className="text-sm font-medium flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-muted-foreground" /> Hourly Rate ($)
                    </label>
                    <Input
                      id="rate"
                      type="number"
                      min={1}
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="experience" className="text-sm font-medium">Years of Experience</label>
                    <Input
                      id="experience"
                      type="number"
                      min={0}
                      value={experience}
                      onChange={(e) => setExperience(Number(e.target.value))}
                      required
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subjects" className="text-sm font-medium flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-muted-foreground" /> Subjects Taught (comma-separated)
                  </label>
                  <Input
                    id="subjects"
                    placeholder="e.g. Mathematics, Calculus, Algebra"
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">Public Bio / Introduction</label>
                  <Textarea
                    id="bio"
                    placeholder="Tell students about your qualifications, teaching methodology, and personality..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                    className="min-h-[120px] rounded-xl"
                  />
                </div>

                <Button type="submit" className="w-full h-12 text-base mt-2" disabled={isSaving}>
                  {isSaving ? 'Saving Changes...' : 'Save Public Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Availability Settings (Col 2) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-lg border-border/50">
            <CardHeader className="bg-muted/10 border-b">
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary" /> Working Hours
              </CardTitle>
              <CardDescription>Configure when you are available for student bookings.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {slotSuccess && (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2.5 rounded-lg text-xs border border-green-200 text-center font-medium">
                  {slotSuccess}
                </div>
              )}
              {slotError && (
                <div className="bg-destructive/10 text-destructive text-xs p-2.5 rounded-lg border border-destructive/20 text-center font-medium">
                  {slotError}
                </div>
              )}

              {/* Seed Button */}
              {availabilitySlots.length === 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl space-y-3">
                  <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed font-medium flex gap-1.5 items-start">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    You haven&apos;t set any working hours yet. Students cannot book lessons with you until you add availability.
                  </p>
                  <Button onClick={handleQuickSeed} className="w-full text-xs h-9 bg-amber-500 hover:bg-amber-600 text-white" disabled={isAddingSlot}>
                    Quick Seed: Mon-Sun (8 AM - 10 PM)
                  </Button>
                </div>
              )}

              {/* Add slot form */}
              <form onSubmit={handleAddSlot} className="space-y-3.5 border-b pb-6">
                <h3 className="font-semibold text-sm">Add Availability Slot</h3>
                <div className="space-y-2">
                  <label htmlFor="dayOfWeek" className="text-xs font-semibold text-muted-foreground">Select Day</label>
                  <select
                    id="dayOfWeek"
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full h-10 px-3 border rounded-lg bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="startTime" className="text-xs font-semibold text-muted-foreground">From</label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="endTime" className="text-xs font-semibold text-muted-foreground">To</label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full text-xs h-10 mt-2" disabled={isAddingSlot}>
                  {isAddingSlot ? 'Adding...' : 'Add Availability'}
                </Button>
              </form>

              {/* Current Slots List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Active Schedule</h3>
                {availabilitySlots.length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {availabilitySlots.map((slot: any) => (
                      <div key={slot._id} className="flex justify-between items-center text-xs bg-muted/40 p-2.5 rounded-lg border border-border/30">
                        <span className="font-semibold text-foreground">{slot.dayOfWeek}</span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-600" /> {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No availability slots set.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
