import React from 'react';
import { Smile, Frown, Meh, Angry, Heart, Zap } from 'lucide-react';
import type { Prediction } from '../types';

interface PredictionDisplayProps {
  prediction: Prediction;
}

const PredictionDisplay: React.FC<PredictionDisplayProps> = ({ prediction }) => {
  const getPrimaryEmotion = () => {
    const emotions = Object.entries(prediction.emotion);
    return emotions.reduce((max, [emotion, confidence]) =>
      confidence > max.confidence ? { emotion, confidence } : max,
      { emotion: emotions[0][0], confidence: emotions[0][1] }
    );
  };

  const primaryEmotion = getPrimaryEmotion();

  const getEmotionIcon = (emotion: string) => {
    const emotionLower = emotion.toLowerCase();
    if (emotionLower.includes('happy') || emotionLower.includes('joy')) {
      return <Smile className="emotion-icon happy" />;
    } else if (emotionLower.includes('sad') || emotionLower.includes('disgust')) {
      return <Frown className="emotion-icon sad" />;
    } else if (emotionLower.includes('angry') || emotionLower.includes('fear')) {
      return <Angry className="emotion-icon angry" />;
    } else if (emotionLower.includes('surprise')) {
      return <Zap className="emotion-icon surprise" />;
    } else if (emotionLower.includes('love') || emotionLower.includes('calm')) {
      return <Heart className="emotion-icon calm" />;
    } else {
      return <Meh className="emotion-icon neutral" />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    const emotionLower = emotion.toLowerCase();
    if (emotionLower.includes('happy') || emotionLower.includes('joy')) {
      return 'happy';
    } else if (emotionLower.includes('sad') || emotionLower.includes('disgust')) {
      return 'sad';
    } else if (emotionLower.includes('angry') || emotionLower.includes('fear')) {
      return 'angry';
    } else if (emotionLower.includes('surprise')) {
      return 'surprise';
    } else if (emotionLower.includes('love') || emotionLower.includes('calm')) {
      return 'calm';
    } else {
      return 'neutral';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`prediction-card ${getEmotionColor(primaryEmotion.emotion)}`}>
      <div className="prediction-header">
        {getEmotionIcon(primaryEmotion.emotion)}
        <div className="prediction-info">
          <h3 className="emotion-name">{primaryEmotion.emotion}</h3>
          <p className="model-info">Analyzed with {prediction.model_type} model</p>
        </div>
      </div>

      <div className="prediction-details">
        <div className="detail-row">
          <span className="label">File:</span>
          <span className="value">{prediction.filename}</span>
        </div>

        <div className="detail-row">
          <span className="label">Duration:</span>
          <span className="value">{formatDuration(prediction.audio_duration)}</span>
        </div>

        {prediction.confidence && (
          <div className="detail-row">
            <span className="label">Confidence:</span>
            <span className="value">{Math.round(prediction.confidence * 100)}%</span>
          </div>
        )}

        <div className="detail-row">
          <span className="label">Analyzed:</span>
          <span className="value">{formatDate(prediction.created_at)}</span>
        </div>
      </div>

      {prediction.confidence && (
        <div className="confidence-bar">
          <div
            className="confidence-fill"
            style={{ width: `${prediction.confidence * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default PredictionDisplay;
