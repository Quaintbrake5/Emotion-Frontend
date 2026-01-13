import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Target, TrendingUp, Calendar, Clock } from 'lucide-react';
import { userService } from '../services/userService';
import type { UserStatistics, PredictionTrends, EmotionDistribution, EngagementMetrics } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Statistics: React.FC = () => {
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [predictionTrends, setPredictionTrends] = useState<PredictionTrends | null>(null);
  const [emotionDistribution, setEmotionDistribution] = useState<EmotionDistribution | null>(null);
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [statistics, trends, distribution, engagement] = await Promise.all([
        userService.getUserStatistics(),
        userService.getUserPredictionTrends(),
        userService.getUserEmotionDistribution(),
        userService.getUserEngagementMetrics()
      ]);
      setStats(statistics);
      setPredictionTrends(trends);
      setEmotionDistribution(distribution);
      setEngagementMetrics(engagement);
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="statistics-loading">
        <div className="loading-spinner"></div>
        <p>Loading your statistics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="statistics-error">
        <p>{error || 'No statistics available'}</p>
        <button className="btn btn-primary" onClick={loadAllData}>
          Try Again
        </button>
      </div>
    );
  }

  const emotionColors = {
    happy: '#10B981',
    sad: '#3B82F6',
    angry: '#EF4444',
    fear: '#F59E0B',
    surprise: '#8B5CF6',
    disgust: '#6B7280',
    neutral: '#9CA3AF',
    calm: '#06B6D4',
    joy: '#10B981',
    love: '#EC4899',
  };

  const getEmotionColor = (emotion: string) => {
    const key = emotion.toLowerCase() as keyof typeof emotionColors;
    return emotionColors[key] || '#6B7280';
  };

  const emotionData = Object.entries(stats.emotions_detected).map(([emotion, count]) => ({
    name: emotion,
    value: count,
    color: getEmotionColor(emotion),
  }));

  const chartData = {
    labels: emotionData.map(item => item.name),
    datasets: [{
      label: 'Emotion Count',
      data: emotionData.map(item => item.value),
      backgroundColor: emotionData.map(item => item.color),
      borderColor: emotionData.map(item => item.color),
      borderWidth: 1,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Emotion Distribution',
      },
    },
  };

  return (
    <div className="statistics">
      <div className="stats-overview">
        <div className="stat-card">
          <Target className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">{stats.total_predictions}</span>
            <span className="stat-label">Total Predictions</span>
          </div>
        </div>

        <div className="stat-card">
          <TrendingUp className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">{Math.round(stats.average_confidence * 100)}%</span>
            <span className="stat-label">Avg Confidence</span>
          </div>
        </div>

        <div className="stat-card">
          <Calendar className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">{stats.total_audio_files}</span>
            <span className="stat-label">Audio Files</span>
          </div>
        </div>

        <div className="stat-card">
          <Clock className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">
              {stats.last_prediction_date ? new Date(stats.last_prediction_date).toLocaleDateString() : 'Never'}
            </span>
            <span className="stat-label">Last Analysis</span>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>Emotion Distribution</h3>
          <div className="chart-wrapper">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {predictionTrends && (
          <div className="chart-container">
            <h3>Prediction Trends</h3>
            <div className="chart-wrapper">
              <Line data={predictionTrends.data} options={predictionTrends.options} />
            </div>
          </div>
        )}

        {emotionDistribution && (
          <div className="chart-container">
            <h3>Emotion Distribution (Doughnut)</h3>
            <div className="chart-wrapper">
              <Doughnut data={emotionDistribution.data} options={emotionDistribution.options} />
            </div>
          </div>
        )}

        <div className="emotion-breakdown">
          <h3>Emotion Breakdown</h3>
          <div className="emotion-list">
            {emotionData
              .sort((a, b) => b.value - a.value)
              .map((emotion) => (
                <div key={emotion.name} className="emotion-item">
                  <div className="emotion-info">
                    <div
                      className="emotion-color"
                      style={{ backgroundColor: emotion.color }}
                    ></div>
                    <span className="emotion-name">{emotion.name}</span>
                  </div>
                  <div className="emotion-stats">
                    <span className="emotion-count">{emotion.value}</span>
                    <span className="emotion-percentage">
                      ({Math.round((emotion.value / stats.total_predictions) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="insights-section">
        <h3>Insights</h3>
        <div className="insights">
          {stats.total_predictions === 0 ? (
            <p>You haven't analyzed any audio yet. Start by uploading or recording some audio!</p>
          ) : (
            <>
              <p>
                Your most common emotion is <strong>
                  {emotionData.reduce((prev, current) =>
                    (prev.value > current.value) ? prev : current
                  ).name}
                </strong> with {emotionData.reduce((prev, current) =>
                  (prev.value > current.value) ? prev : current
                ).value} detections.
              </p>
              <p>
                You've analyzed {stats.total_predictions} audio samples with an average confidence of {Math.round(stats.average_confidence * 100)}%.
              </p>
              {stats.total_audio_files > 0 && (
                <p>
                  You have {stats.total_audio_files} audio files stored in your account.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
