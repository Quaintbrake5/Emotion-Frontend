// All Endpoints from the backend API should be defined here
import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

// TypeScript interfaces for API responses
export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
  is_superuser?: boolean;
}

export interface UserCreate {
  email: string;
  username: string;
  full_name?: string;
  password: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  full_name?: string;
  profile_picture_url?: string;
  is_active?: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface TokenRefreshRequest {
  refresh_token: string;
}

export interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Prediction {
  id: number;
  user_id: number;
  filename: string;
  emotion: Record<string, number>;
  confidence?: number;
  audio_duration: number;
  model_type: string;
  created_at: string;
}

export interface AudioFile {
  id: number;
  user_id: number;
  filename: string;
  file_path: string;
  file_size: number;
  audio_duration: number;
  created_at: string;
}

export interface UserStatistics {
  total_predictions: number;
  total_audio_files: number;
  emotions_detected: Record<string, number>;
  average_confidence: number;
  last_prediction_date: string;
}

export interface PredictionResponse {
  id: number;
  filename: string;
  emotion: string;
  confidence?: number;
  model_type: string;
  audio_duration?: number;
  user_id: number;
  created_at: string;
}

export interface AudioFileResponse {
  id: number;
  filename: string;
  file_path: string;
  duration?: number;
  sample_rate?: number;
  user_id: number;
  uploaded_at: string;
}

export interface UserStatisticsResponse {
  total_predictions: number;
  total_uploads: number;
  total_logins: number;
  average_confidence?: number;
  most_common_emotion?: string;
  last_activity?: string;
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface UserActivityResponse {
  id: number;
  action: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  user_id: number;
  created_at: string;
}

export interface VoiceRecordingRequest {
  duration?: number;
}

export interface VoiceRecordingResponse {
  emotion: string;
  confidence?: number;
  audio_duration: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

export interface EmailVerificationConfirm {
  token: string;
}

export interface OTPSetupRequest {
  password: string;
}

export interface OTPSetupResponse {
  secret: string;
  qr_code_url: string;
  backup_codes: string[];
}

export interface OTPVerifyRequest {
  otp_code: string;
}

export interface OTPDisableRequest {
  password: string;
}

export interface OTPBackupCodeRequest {
  backup_code: string;
}

const API_BASE_PUBLIC_URL = 'https://emotion-backend-hxur.onrender.com/'; // Adjust this to match your backend URL
const API_BASE_LOCAL_URL = 'http://localhost:8001'; // Local development URL

// Automatically switch between local and public URLs based on environment
const API_BASE_URL = import.meta.env.DEV ? API_BASE_LOCAL_URL : API_BASE_PUBLIC_URL;

// API Endpoints
export const ENDPOINTS = {
  // Basic endpoints
  HEALTH: '/health',
  ROOT: '/',

  // Authentication endpoints
  REGISTER: '/auth/register',
  LOGIN: '/auth/token',
  LOGOUT: '/auth/logout',
  USERS_ME: '/auth/users/me',
  PASSWORD_RESET_REQUEST: '/auth/password-reset/request',
  PASSWORD_RESET_CONFIRM: '/auth/password-reset/confirm',
  EMAIL_VERIFICATION_REQUEST: '/auth/email-verification/request',
  EMAIL_VERIFICATION_CONFIRM: '/auth/email-verification/confirm',
  TOKEN_REFRESH: '/auth/token/refresh',
  GET_ALL_USERS: '/auth/users',
  UPDATE_USER: '/auth/users/',
  DELETE_USER: '/auth/users/',
  OTP_SETUP: '/auth/otp/setup',
  OTP_VERIFY: '/auth/otp/verify',
  OTP_DISABLE: '/auth/otp/disable',
  OTP_VERIFY_LOGIN: '/auth/otp/verify-login',
  OTP_BACKUP_CODE: '/auth/otp/backup-code',
  DELETE_ADMIN_USER: '/admin/users/{user_id}',

  // Audio endpoints
  RECORD_VOICE: '/audio/record-voice',
  PREDICT: '/audio/predict',

  // User endpoints
  USER_PREDICTIONS: '/users/me/predictions',
  USER_AUDIO_FILES: '/users/me/audio-files',
  USER_STATISTICS: '/users/me/statistics',
  USER_ACTIVITY: '/users/me/activity',
  USER_PREDICTION_ANALYTICS: '/users/me/predictions/',

  // Analytics endpoints
  SYSTEM_STATS: '/analytics/system/stats',
  SYSTEM_METRICS: '/analytics/system/metrics',
  USER_ACTIVITY_HISTORY: '/analytics/users/',
  PREDICTION_ANALYTICS: '/analytics/predictions/analytics',
  USER_ACTIVITY_SUMMARY: '/analytics/users/activity/summary',
  CLEANUP_DATA: '/analytics/data/cleanup',
  SYSTEM_HEALTH: '/analytics/system/health',

  // Export endpoints
  EXPORT_PREDICTIONS_CSV: '/export/predictions/csv',
  EXPORT_PREDICTIONS_JSON: '/export/predictions/json',
  EXPORT_ANALYTICS_CSV: '/export/analytics/csv',
  EXPORT_USER_INSIGHTS_CSV: '/export/user/insights/csv',
  EXPORT_ADMIN_USER_INSIGHTS_CSV: '/export/admin/user/',

  // Visualization endpoints
  USER_PREDICTION_TRENDS: '/visualization/user/prediction-trends',
  USER_EMOTION_DISTRIBUTION: '/visualization/user/emotion-distribution',
  USER_ENGAGEMENT_METRICS: '/visualization/user/engagement-metrics',
  ADMIN_MODEL_PERFORMANCE: '/visualization/admin/model-performance',
  ADMIN_EMOTION_DISTRIBUTION: '/visualization/admin/emotion-distribution',
  ADMIN_DAILY_ACTIVITY_HEATMAP: '/visualization/admin/daily-activity-heatmap',
  ADMIN_SYSTEM_OVERVIEW: '/visualization/admin/system-overview',
  PUBLIC_EMOTION_DISTRIBUTION: '/visualization/public/emotion-distribution',
  USER_COMBINED_DASHBOARD: '/visualization/user/combined-dashboard',
  ADMIN_COMBINED_DASHBOARD: '/visualization/admin/combined-dashboard',

  // Admin endpoints
  ADMIN_USERS: '/admin/users',
} as const;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    // Define endpoints that don't require authentication
    const allowAnyEndpoints = [
      ENDPOINTS.HEALTH,
      ENDPOINTS.ROOT,
      ENDPOINTS.REGISTER,
      ENDPOINTS.LOGIN,
      ENDPOINTS.PASSWORD_RESET_REQUEST,
      ENDPOINTS.PASSWORD_RESET_CONFIRM,
      ENDPOINTS.EMAIL_VERIFICATION_REQUEST,
      ENDPOINTS.EMAIL_VERIFICATION_CONFIRM,
      ENDPOINTS.TOKEN_REFRESH,
      ENDPOINTS.OTP_SETUP,
      ENDPOINTS.OTP_VERIFY,
      ENDPOINTS.OTP_VERIFY_LOGIN,
      ENDPOINTS.OTP_BACKUP_CODE,
      ENDPOINTS.PUBLIC_EMOTION_DISTRIBUTION,
    ];

    // Only add auth header if token exists and endpoint requires authentication
    const requiresAuth = !allowAnyEndpoints.some(endpoint => {
      const fullUrl = config.url || '';
      return fullUrl === endpoint || fullUrl.endsWith(endpoint);
    });

    console.log('API Request:', {
      url: config.url,
      method: config.method,
      requiresAuth,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 50)}...` : 'no token'
    });

    if (token && requiresAuth) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added Authorization header:', `Bearer ${token.substring(0, 50)}...`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Separate axios instance for token refresh to avoid interceptor loops
const refreshApi = axios.create({
  baseURL: API_BASE_PUBLIC_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !((originalRequest as { _retry?: boolean })._retry)) {
      // Define endpoints that don't require authentication
      const allowAnyEndpoints = [
        ENDPOINTS.HEALTH,
        ENDPOINTS.ROOT,
        ENDPOINTS.REGISTER,
        ENDPOINTS.LOGIN,
        ENDPOINTS.PASSWORD_RESET_REQUEST,
        ENDPOINTS.PASSWORD_RESET_CONFIRM,
        ENDPOINTS.EMAIL_VERIFICATION_REQUEST,
        ENDPOINTS.EMAIL_VERIFICATION_CONFIRM,
        ENDPOINTS.TOKEN_REFRESH,
        ENDPOINTS.OTP_SETUP,
        ENDPOINTS.OTP_VERIFY,
        ENDPOINTS.OTP_VERIFY_LOGIN,
        ENDPOINTS.OTP_BACKUP_CODE,
        ENDPOINTS.PUBLIC_EMOTION_DISTRIBUTION,
      ];

      // Don't retry token refresh for AllowAny endpoints
      const isAllowAnyEndpoint = allowAnyEndpoints.some(endpoint => {
        const fullUrl = originalRequest.url || '';
        return fullUrl.startsWith(endpoint) || fullUrl.includes(endpoint);
      });

      if (isAllowAnyEndpoint) {
        // For AllowAny endpoints, just reject the error without retrying
        throw(error);
      }

      ((originalRequest as { _retry?: boolean })._retry = true);

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // No refresh token, redirect to login
          globalThis.location.href = '/login';
          throw(error);
        }

        const response = await refreshApi.post(ENDPOINTS.TOKEN_REFRESH, {
          refresh_token: refreshToken,
        });

        const newAccessToken = response.data.access_token;
        localStorage.setItem('access_token', newAccessToken);

        // Retry the original request with new token
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        globalThis.location.href = '/login';
        throw(refreshError);
      }
    }

    throw(error);
  }
);

// Authentication API functions
export const authAPI = {
  register: (userData: UserCreate) => api.post(ENDPOINTS.REGISTER, userData),
  login: (username: string, password: string) =>
    api.post(ENDPOINTS.LOGIN, new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
  logout: () => api.post(ENDPOINTS.LOGOUT),
  getCurrentUser: () => api.get(ENDPOINTS.USERS_ME),
  updateCurrentUser: (userData: UserUpdate) => api.put(ENDPOINTS.USERS_ME, userData),
  deleteCurrentUser: () => api.delete(ENDPOINTS.USERS_ME),
  requestPasswordReset: (email: string) => api.post(ENDPOINTS.PASSWORD_RESET_REQUEST, { email }),
  confirmPasswordReset: (token: string, newPassword: string) =>
    api.post(ENDPOINTS.PASSWORD_RESET_CONFIRM, { token, new_password: newPassword }),
  requestEmailVerification: () => api.post(ENDPOINTS.EMAIL_VERIFICATION_REQUEST),
  confirmEmailVerification: (token: string) => api.post(ENDPOINTS.EMAIL_VERIFICATION_CONFIRM, { token }),
  refreshToken: (refreshToken: string) => api.post(ENDPOINTS.TOKEN_REFRESH, { refresh_token: refreshToken }),
  getAllUsers: (skip = 0, limit = 100) => api.get(`${ENDPOINTS.GET_ALL_USERS}?skip=${skip}&limit=${limit}`),
  updateUser: (userId: number, userData: UserUpdate) => api.put(`${ENDPOINTS.UPDATE_USER}${userId}`, userData),
  deleteUser: (userId: number) => api.delete(`${ENDPOINTS.DELETE_USER}${userId}`),
  setupOTP: (password: string) => api.post(ENDPOINTS.OTP_SETUP, { password }),
  verifyOTP: (otpCode: string) => api.post(ENDPOINTS.OTP_VERIFY, { otp_code: otpCode }),
  disableOTP: (password: string) => api.post(ENDPOINTS.OTP_DISABLE, { password }),
  verifyOTPLogin: (otpCode: string) => api.post(ENDPOINTS.OTP_VERIFY_LOGIN, { otp_code: otpCode }),
  verifyBackupCode: (backupCode: string) => api.post(ENDPOINTS.OTP_BACKUP_CODE, { backup_code: backupCode }),
};

// Audio API functions
export const audioAPI = {
  recordAndPredict: (data: VoiceRecordingRequest) => api.post(ENDPOINTS.RECORD_VOICE, data),
  predictEmotion: (audioFile: File) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    return api.post(ENDPOINTS.PREDICT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// User API functions
export const userAPI = {
  getPredictions: (skip = 0, limit = 50) =>
    api.get(`${ENDPOINTS.USER_PREDICTIONS}?skip=${skip}&limit=${limit}`),
  getAudioFiles: (skip = 0, limit = 50) =>
    api.get(`${ENDPOINTS.USER_AUDIO_FILES}?skip=${skip}&limit=${limit}`),
  getStatistics: () => api.get(ENDPOINTS.USER_STATISTICS),
  getActivity: (skip = 0, limit = 50) =>
    api.get(`${ENDPOINTS.USER_ACTIVITY}?skip=${skip}&limit=${limit}`),
  getPredictionAnalytics: (predictionId: number) =>
    api.get(`${ENDPOINTS.USER_PREDICTION_ANALYTICS}${predictionId}/analytics`),
};

// Analytics API functions
export const analyticsAPI = {
  getSystemStats: () => api.get(ENDPOINTS.SYSTEM_STATS),
  getSystemMetrics: () => api.get(ENDPOINTS.SYSTEM_METRICS),
  getUserActivityHistory: (userId: number, skip = 0, limit = 50) =>
    api.get(`${ENDPOINTS.USER_ACTIVITY_HISTORY}${userId}/activity?skip=${skip}&limit=${limit}`),
  getPredictionAnalytics: () => api.get(ENDPOINTS.PREDICTION_ANALYTICS),
  getUserActivitySummary: () => api.get(ENDPOINTS.USER_ACTIVITY_SUMMARY),
  cleanupOldData: (daysOld = 90) => api.delete(`${ENDPOINTS.CLEANUP_DATA}?days_old=${daysOld}`),
  getSystemHealth: () => api.get(ENDPOINTS.SYSTEM_HEALTH),
};

// Export API functions
export const exportAPI = {
  exportPredictionsCSV: (params?: { emotion?: string; days?: number; include_features?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.emotion) queryParams.append('emotion', params.emotion);
    if (params?.days) queryParams.append('days', params.days.toString());
    if (params?.include_features !== undefined) queryParams.append('include_features', params.include_features.toString());
    return api.get(`${ENDPOINTS.EXPORT_PREDICTIONS_CSV}?${queryParams.toString()}`);
  },
  exportPredictionsJSON: (params?: { emotion?: string; days?: number; include_features?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.emotion) queryParams.append('emotion', params.emotion);
    if (params?.days) queryParams.append('days', params.days.toString());
    if (params?.include_features !== undefined) queryParams.append('include_features', params.include_features.toString());
    return api.get(`${ENDPOINTS.EXPORT_PREDICTIONS_JSON}?${queryParams.toString()}`);
  },
  exportAnalyticsCSV: (days = 30) => api.get(`${ENDPOINTS.EXPORT_ANALYTICS_CSV}?days=${days}`),
  exportUserInsightsCSV: () => api.get(ENDPOINTS.EXPORT_USER_INSIGHTS_CSV),
  exportAdminUserInsightsCSV: (userId: number) => api.get(`${ENDPOINTS.EXPORT_ADMIN_USER_INSIGHTS_CSV}${userId}/insights/csv`),
};

// Visualization API functions
export const visualizationAPI = {
  getUserPredictionTrends: (days = 30) => api.get(`${ENDPOINTS.USER_PREDICTION_TRENDS}?days=${days}`),
  getUserEmotionDistribution: (days = 30) => api.get(`${ENDPOINTS.USER_EMOTION_DISTRIBUTION}?days=${days}`),
  getUserEngagementMetrics: () => api.get(ENDPOINTS.USER_ENGAGEMENT_METRICS),
  getAdminModelPerformance: (days = 30) => api.get(`${ENDPOINTS.ADMIN_MODEL_PERFORMANCE}?days=${days}`),
  getAdminEmotionDistribution: (days = 30) => api.get(`${ENDPOINTS.ADMIN_EMOTION_DISTRIBUTION}?days=${days}`),
  getAdminDailyActivityHeatmap: (days = 30) => api.get(`${ENDPOINTS.ADMIN_DAILY_ACTIVITY_HEATMAP}?days=${days}`),
  getAdminSystemOverview: (days = 7) => api.get(`${ENDPOINTS.ADMIN_SYSTEM_OVERVIEW}?days=${days}`),
  getPublicEmotionDistribution: (days = 7) => api.get(`${ENDPOINTS.PUBLIC_EMOTION_DISTRIBUTION}?days=${days}`),
  getUserCombinedDashboard: (days = 30) => api.get(`${ENDPOINTS.USER_COMBINED_DASHBOARD}?days=${days}`),
  getAdminCombinedDashboard: (days = 30) => api.get(`${ENDPOINTS.ADMIN_COMBINED_DASHBOARD}?days=${days}`),
};

// Admin API functions
export const adminAPI = {
  getAllUsers: (skip = 0, limit = 100) => api.get(`${ENDPOINTS.ADMIN_USERS}?skip=${skip}&limit=${limit}`),
};

// Basic API functions
export const basicAPI = {
  healthCheck: () => api.get(ENDPOINTS.HEALTH),
  root: () => api.get(ENDPOINTS.ROOT),
};

export default api;

