import axios from 'axios';
import type { Prediction, VoiceRecordingRequest, VoiceRecordingResponse } from '../types';

const API_BASE_URL = 'http://localhost:8001'; // Adjust this to match your backend URL

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

export const audioService = {
  async predictEmotion(file: File): Promise<Prediction> {
    const formData = new FormData();
    formData.append('audio', file);

    const response = await api.post<Prediction>('/audio/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async predictRecordedAudio(audioBlob: Blob, duration?: number): Promise<Prediction> {
    // Create a file with the correct extension based on the blob type
    let filename = 'recorded_audio.wav';
    let mimeType = 'audio/wav';

    if (audioBlob.type.includes('webm')) {
      filename = 'recorded_audio.webm';
      mimeType = 'audio/webm';
    } else if (audioBlob.type.includes('mp4') || audioBlob.type.includes('m4a')) {
      filename = 'recorded_audio.m4a';
      mimeType = 'audio/m4a';
    }

    // Ensure the blob has content
    if (audioBlob.size === 0) {
      throw new Error('Audio recording is empty');
    }

    const file = new File([audioBlob], filename, { type: mimeType });

    // Verify the file was created properly
    if (file.size === 0) {
      throw new Error('Failed to create audio file from recording');
    }

    const formData = new FormData();
    formData.append('audio', file);

    console.log('Sending recorded audio for analysis:', {
      filename,
      mimeType,
      blobSize: audioBlob.size,
      fileSize: file.size,
      duration,
      blobType: audioBlob.type
    });

    try {
      const response = await api.post<Prediction>('/audio/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Audio prediction failed:', error.response?.data || error.message);
      throw error;
    }
  },

  async recordVoice(request: VoiceRecordingRequest): Promise<VoiceRecordingResponse> {
    const response = await api.post<VoiceRecordingResponse>('/audio/record-voice', request);
    return response.data;
  },
};
