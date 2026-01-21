import axios from 'axios';
import type { Prediction, AudioFile, UserStatistics, UserActivity, PredictionAnalytics, AdminUser } from '../types';
import type { PredictionTrends, EmotionDistribution, EngagementMetrics } from '../types/visualization';

const API_BASE_URL = 'https://emotion-backend-hxur.onrender.com/'; // Adjust this to match your backend URL, 
// previously localhost:8001

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userService = {
  async getUserPredictions(skip = 0, limit = 50): Promise<Prediction[]> {
    const response = await api.get<Prediction[]>(`/users/me/predictions?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async getUserAudioFiles(skip = 0, limit = 50): Promise<AudioFile[]> {
    const response = await api.get<AudioFile[]>(`/users/me/audio-files?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async getUserStatistics(): Promise<UserStatistics> {
    const response = await api.get<UserStatistics>('/users/me/statistics');
    return response.data;
  },

  async getUserActivityHistory(skip = 0, limit = 50): Promise<UserActivity[]> {
    const response = await api.get<UserActivity[]>(`/users/me/activity?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async getPredictionAnalytics(predictionId: number): Promise<PredictionAnalytics> {
    const response = await api.get<PredictionAnalytics>(`/users/me/predictions/${predictionId}/analytics`);
    return response.data;
  },

  async getAllUsers(skip = 0, limit = 100): Promise<AdminUser[]> {
    const response = await api.get<AdminUser[]>(`/admin/users?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async getUserPredictionTrends(days = 30): Promise<PredictionTrends> {
    const response = await api.get<PredictionTrends>(`/visualization/user/prediction-trends?days=${days}`);
    return response.data;
  },

  async getUserEmotionDistribution(days = 30): Promise<EmotionDistribution> {
    const response = await api.get<EmotionDistribution>(`/visualization/user/emotion-distribution?days=${days}`);
    return response.data;
  },

  async getUserEngagementMetrics(): Promise<EngagementMetrics> {
    const response = await api.get<EngagementMetrics>('/visualization/user/engagement-metrics');
    return response.data;
  },
};
