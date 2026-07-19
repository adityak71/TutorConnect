import axios from 'axios';
import { Tutor, Session, Role, User } from '../types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send cookies
});

const mapTutor = (profile: any): Tutor => {
  const user = profile.user || {};
  return {
    id: profile._id || user._id || '',
    userId: user._id || profile._id || '',
    name: user.name || 'Unknown Tutor',
    email: user.email || '',
    role: 'tutor',
    avatar: user.profilePicture || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 20) + 10}`,
    bio: profile.bio || 'No biography provided.',
    subjects: profile.subjects || [],
    hourlyRate: profile.hourlyRate || 0,
    rating: profile.rating || 0,
    reviewsCount: profile.totalReviews || 0,
    experience: profile.experienceYears || 0,
    qualifications: (profile.qualifications || []).map((q: any) =>
      typeof q === 'string' ? q : `${q.title} (${q.institution}, ${q.year})`
    ),
  };
};

// Map backend Session to frontend Session
const mapSession = (session: any): Session => {
  const tutorUser = session.tutor || {};
  const studentUser = session.student || {};

  let status: 'upcoming' | 'completed' | 'cancelled' = 'upcoming';
  if (session.status === 'Completed') {
    status = 'completed';
  } else if (session.status === 'Cancelled') {
    status = 'cancelled';
  }

  const d = new Date(session.startTime);
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${pad(d.getUTCDate())}-${pad(d.getUTCMonth() + 1)}-${d.getUTCFullYear()}`;

  return {
    id: session._id,
    tutorId: tutorUser._id || session.tutor || '',
    studentId: studentUser._id || session.student || '',
    tutorName: tutorUser.name || 'Tutor',
    studentName: studentUser.name || 'Student',
    subject: session.notes || 'Tutoring Session',
    date: dateStr,
    startTime: session.startTime,
    endTime: session.endTime,
    status,
    price: 40,
  };
};

export const getTutors = async () => {
  const response = await api.get('/tutors');
  const profiles = response.data.data || [];
  return { data: profiles.map(mapTutor) };
};

export const getTutorById = async (id: string) => {
  const response = await api.get(`/tutors/${id}`);
  return { data: mapTutor(response.data.data) };
};

export const getSessions = async () => {
  const userResponse = await api.get('/users/profile');
  if (!userResponse.data || !userResponse.data.success) {
    return { data: [] };
  }
  const user = userResponse.data.data;
  const role = user.role.toLowerCase();

  const response = await api.get(`/sessions/${role}/${user.id}`);
  const sessions = response.data.data || [];
  return { data: sessions.map(mapSession) };
};

export const getCurrentUser = async () => {
  if (typeof window === 'undefined') return { data: null };
  const role = localStorage.getItem('tutorconnect_role');
  if (!role) return { data: null };

  try {
    const response = await api.get('/users/profile');
    if (response.data && response.data.success) {
      const user = response.data.data;
      return {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase() as Role,
          avatar: user.profilePicture || 'https://i.pravatar.cc/150?img=11',
          bio: user.profile?.bio || '',
        },
      };
    }
  } catch (error) {
    localStorage.removeItem('tutorconnect_role');
  }
  return { data: null };
};

export const login = async (data: { email: string; password?: string }) => {
  const response = await api.post('/auth/login', {
    email: data.email,
    password: data.password,
  });
  if (response.data && response.data.success) {
    const user = response.data.user;
    const role = user.role.toLowerCase();
    localStorage.setItem('tutorconnect_role', role);
  }
  return response.data;
};

export const signup = async (data: {
  name: string;
  email: string;
  password?: string;
  role: string;
  hourlyRate?: number;
}) => {
  const response = await api.post('/auth/register', {
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role.charAt(0).toUpperCase() + data.role.slice(1),
    hourlyRate: data.hourlyRate || 35,
  });
  if (response.data && response.data.success) {
    const user = response.data.user;
    const role = user.role.toLowerCase();
    localStorage.setItem('tutorconnect_role', role);
  }
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  localStorage.removeItem('tutorconnect_role');
  return response.data;
};

export const bookSession = async (data: {
  tutorId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}) => {
  const response = await api.post('/sessions/book', data);
  return response.data;
};

export const cancelSession = async (id: string) => {
  const response = await api.delete(`/sessions/${id}`);
  return response.data;
};

export const createPayment = async (data: { sessionId: string; amount: number }) => {
  const response = await api.post('/payments/create', data);
  return response.data;
};

export const executePaymentWebhook = async (data: { transactionId: string; status?: string }) => {
  const response = await api.post('/payments/webhook', data);
  return response.data;
};

export const getPaymentHistory = async () => {
  const response = await api.get('/payments/history');
  return response.data;
};

export const submitReview = async (data: {
  tutorId: string;
  sessionId?: string;
  rating: number;
  comment: string;
}) => {
  const response = await api.post('/reviews', data);
  return response.data;
};

export const getTutorReviews = async (tutorId: string) => {
  const response = await api.get(`/reviews/${tutorId}`);
  return response.data;
};

export const updateProgress = async (data: {
  studentId: string;
  sessionId?: string;
  subject: string;
  topicsCovered?: string[];
  status?: string;
  completionPercentage?: number;
  notes?: string;
  feedback?: string;
}) => {
  const response = await api.post('/progress', data);
  return response.data;
};

export const getStudentProgress = async (studentId: string) => {
  const response = await api.get(`/progress/${studentId}`);
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationRead = async (id: string) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

export const updateUserProfile = async (data: any) => {
  const response = await api.put('/users/profile', data);
  return response.data;
};

export const getTutorAvailability = async (tutorId: string) => {
  const response = await api.get(`/availability/${tutorId}`);
  return response.data;
};

export const addTutorAvailability = async (data: { dayOfWeek: string; startTime: string; endTime: string }) => {
  const response = await api.post('/availability', data);
  return response.data;
};

export const uploadProfilePicture = async (formData: FormData) => {
  const response = await api.post('/users/profile/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default api;
