"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, updateUserProfile, uploadProfilePicture } from '@/services/api';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User, BookOpen, GraduationCap, Award, Camera, Loader2 } from 'lucide-react';

export default function StudentProfilePage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch current logged-in user profile details
  const { data: userResponse, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const user = userResponse?.data;

  // Form states for student profile
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('High School');
  const [subjectsOfInterest, setSubjectsOfInterest] = useState('');
  const [learningGoals, setLearningGoals] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Hydrate state once user data is loaded
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setGradeLevel(user.profile?.gradeLevel || 'High School');
      setSubjectsOfInterest(user.profile?.subjectsOfInterest?.join(', ') || '');
      setLearningGoals(user.profile?.learningGoals || '');

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
        gradeLevel,
        subjectsOfInterest: subjectsOfInterest.split(',').map(s => s.trim()).filter(Boolean),
        learningGoals,
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-96 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground">Manage your credentials, update your learning goals, and upload a profile photo.</p>
      </div>

      <Card className="shadow-lg border-border/50">
        <CardHeader className="bg-muted/10 border-b">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Profile Settings
          </CardTitle>
          <CardDescription>Customize your student profile details.</CardDescription>
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
              <label htmlFor="name" className="text-sm font-medium">Full Name</label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="gradeLevel" className="text-sm font-medium flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-muted-foreground" /> Grade Level
              </label>
              <select
                id="gradeLevel"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full h-11 px-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {['Elementary School', 'Middle School', 'High School', 'Undergraduate', 'Postgraduate', 'Adult Learner'].map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="subjects" className="text-sm font-medium flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-muted-foreground" /> Subjects of Interest (comma-separated)
              </label>
              <Input
                id="subjects"
                placeholder="e.g. Algebra, Physics, chemistry"
                value={subjectsOfInterest}
                onChange={(e) => setSubjectsOfInterest(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="learningGoals" className="text-sm font-medium flex items-center gap-1.5">
                <Award className="h-4 w-4 text-muted-foreground" /> My Learning Goals
              </label>
              <Textarea
                id="learningGoals"
                placeholder="What are your goals? e.g. Pass my chemistry finals, improve calculus equations..."
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                required
                className="min-h-[120px] rounded-xl"
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base mt-2" disabled={isSaving}>
              {isSaving ? 'Saving Changes...' : 'Save Profile Details'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
