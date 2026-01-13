import React, { useState, useEffect, useCallback } from 'react';
import { FileAudio, TrendingUp, Calendar, Clock } from 'lucide-react';
import { userService } from '../services/userService';
import PredictionDisplay from './PredictionDisplay';
import type { Prediction, AudioFile } from '../types';

const History: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<'predictions' | 'audio'>('predictions');

  const limit = 20;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === 'predictions') {
        const newPredictions = await userService.getUserPredictions((page - 1) * limit, limit);
        if (page === 1) {
          setPredictions(newPredictions);
        } else {
          setPredictions(prev => [...prev, ...newPredictions]);
        }
        setHasMore(newPredictions.length === limit);
      } else {
        const newAudioFiles = await userService.getUserAudioFiles((page - 1) * limit, limit);
        if (page === 1) {
          setAudioFiles(newAudioFiles);
        } else {
          setAudioFiles(prev => [...prev, ...newAudioFiles]);
        }
        setHasMore(newAudioFiles.length === limit);
      }
    } catch (err) {
      setError('Failed to load history');
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, limit]);

  useEffect(() => {
    loadData();
  }, [page, activeTab, loadData]);

  const handleTabChange = (tab: 'predictions' | 'audio') => {
    setActiveTab(tab);
    setPage(1);
    setPredictions([]);
    setAudioFiles([]);
    setHasMore(true);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (error) {
    return (
      <div className="history-error">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => loadData()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="history">
      <div className="history-tabs">
        <button
          className={`history-tab ${activeTab === 'predictions' ? 'active' : ''}`}
          onClick={() => handleTabChange('predictions')}
        >
          <TrendingUp size={18} />
          Predictions ({predictions.length})
        </button>
        <button
          className={`history-tab ${activeTab === 'audio' ? 'active' : ''}`}
          onClick={() => handleTabChange('audio')}
        >
          <FileAudio size={18} />
          Audio Files ({audioFiles.length})
        </button>
      </div>

      <div className="history-content">
        {activeTab === 'predictions' ? (
          <div className="predictions-list">
            {predictions.length === 0 && !loading ? (
              <div className="empty-state">
                <TrendingUp size={48} />
                <h3>No predictions yet</h3>
                <p>Start by uploading or recording some audio to see your emotion analysis history.</p>
              </div>
            ) : (
              <>
                {predictions.map((prediction) => (
                  <PredictionDisplay key={prediction.id} prediction={prediction} />
                ))}
                {loading && (
                  <div className="loading-more">
                    <div className="loading-spinner"></div>
                    <p>Loading more predictions...</p>
                  </div>
                )}
                {hasMore && !loading && (
                  <button className="btn btn-secondary load-more-btn" onClick={loadMore}>
                    Load More Predictions
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="audio-files-list">
            {audioFiles.length === 0 && !loading ? (
              <div className="empty-state">
                <FileAudio size={48} />
                <h3>No audio files yet</h3>
                <p>Your uploaded audio files will appear here.</p>
              </div>
            ) : (
              <>
                {audioFiles.map((audioFile) => (
                  <div key={audioFile.id} className="audio-file-card">
                    <div className="audio-file-header">
                      <FileAudio className="audio-file-icon" />
                      <div className="audio-file-info">
                        <h4 className="audio-file-name">{audioFile.filename}</h4>
                        <div className="audio-file-meta">
                          <span className="meta-item">
                            <Clock size={14} />
                            {Math.round(audioFile.audio_duration)}s
                          </span>
                          <span className="meta-item">
                            {formatFileSize(audioFile.file_size)}
                          </span>
                          <span className="meta-item">
                            <Calendar size={14} />
                            {new Date(audioFile.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="loading-more">
                    <div className="loading-spinner"></div>
                    <p>Loading more audio files...</p>
                  </div>
                )}
                {hasMore && !loading && (
                  <button className="btn btn-secondary load-more-btn" onClick={loadMore}>
                    Load More Audio Files
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
