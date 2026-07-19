import axios from 'axios';
import { Tutor, Session, User } from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

export const getTutors = async () => {
  const response = await api.get('/tutors');
  const tutors = response.data.data.map((tp: any) => ({
    id: tp._id,
    userId: tp.user._id,
    name: tp.user.name,
    email: tp.user.email,
    role: 'tutor',
    avatar: tp.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(tp.user.name)}`,
    bio: tp.bio,
    subjects: tp.subjects,
    hourlyRate: tp.hourlyRate,
    rating: tp.rating,
    reviewsCount: tp.totalReviews,
    experience: tp.experienceYears,
    qualifications: tp.qualifications?.map((q: any) => q.title) || [],
  }));
  return { data: tutors };
};

export const getTutorById = async (id: string) => {
  const response = await api.get(`/tutors/${id}`);
  const tp = response.data.data;
  const tutor = {
    id: tp._id,
    userId: tp.user._id,
    name: tp.user.name,
    email: tp.user.email,
    role: 'tutor',
    avatar: tp.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(tp.user.name)}`,
    bio: tp.bio,
    subjects: tp.subjects,
    hourlyRate: tp.hourlyRate,
    rating: tp.rating,
    reviewsCount: tp.totalReviews,
    experience: tp.experienceYears,
    qualifications: tp.qualifications?.map((q: any) => q.title) || [],
  };
  return { data: tutor };
};

export const getSessions = async (role: string, userId: string) => {
  const endpoint = role === 'tutor' ? `/sessions/tutor/${userId}` : `/sessions/student/${userId}`;
  const response = await api.get(endpoint);
  
  const sessions = response.data.data.map((session: any) => ({
    id: session._id,
    tutorId: role === 'tutor' ? session.tutor : session.tutor._id,
    studentId: role === 'student' ? session.student : session.student._id,
    tutorName: role === 'tutor' ? undefined : session.tutor?.name,
    studentName: role === 'student' ? undefined : session.student?.name,
    date: new Date(session.startTime).toLocaleDateString(),
    startTime: session.startTime,
    endTime: session.endTime,
    status: session.status,
    notes: session.notes
  }));
  return { data: sessions };
};

export const getCurrentUser = async () => {
  await new Promise(resolve => setTimeout(resolve, 400));
  if (typeof window === 'undefined') {
    return { data: null };
  }
  const role = localStorage.getItem('tutorconnect_role') as Role | null;
  if (!role) {
    return { data: null };
  }
  
  return { 
    data: { 
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      avatar: user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`,
      bio: user.profile?.bio
    } 
  };
};

export const login = async (data: { email: string; password?: string }) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const register = async (data: { name: string; email: string; password?: string; role: string }) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export default api;
