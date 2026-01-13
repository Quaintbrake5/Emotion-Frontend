import type { User, UserCreate } from '../api/api';

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

export interface UserActivity {
  id: number;
  user_id: number;
  action: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface PredictionAnalytics {
  prediction_id: number;
  emotion: string;
  confidence: number;
  features: Record<string, unknown>;
  model_metrics: Record<string, unknown>;
  processing_time: number;
}

export interface VoiceRecordingRequest {
  duration?: number;
}

export interface VoiceRecordingResponse {
  emotion: string;
  audio_duration: number;
}

export interface Token {
  access_token: string;
  token_type: string;
}



export interface UserUpdate {
  username?: string;
  email?: string;
  full_name?: string;
  is_active?: boolean;
}


export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: UserCreate) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

import type { ReactNode } from 'react';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface ApiError {
  detail: string;
}

export type { ReactNode };
