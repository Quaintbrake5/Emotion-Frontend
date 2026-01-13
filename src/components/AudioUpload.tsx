import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Mic, Upload, Play, Square, Loader, BarChart3, Download } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import 'audio-recorder-polyfill';
import { audioService } from '../services/audioService';
import type { Prediction } from '../types';

interface AudioUploadProps {
  onPredictionComplete: (prediction: Prediction) => void;
}

const AudioUpload: React.FC<AudioUploadProps> = ({ onPredictionComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [waveSurfer, setWaveSurfer] = useState<WaveSurfer | null>(null);
  const [currentPrediction, setCurrentPrediction] = useState<Prediction | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'audio/*': ['.wav', '.mp3', '.m4a', '.flac']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        handleFileUpload(file);
      }
    }
  });

  useEffect(() => {
    if (audioUrl && waveformRef.current && !waveSurfer) {
      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#667eea',
        progressColor: '#764ba2',
        height: 80,
        normalize: true,
        backend: 'WebAudio'
      });

      ws.load(audioUrl);
      setWaveSurfer(ws);

      return () => {
        ws.destroy();
      };
    }
  }, [audioUrl, waveSurfer]);

  const handleFileUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setAudioBlob(new Blob([file], { type: file.type }));
    setCurrentPrediction(null);
    setShowResults(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Try to use WAV format if supported, otherwise use default
      const options = MediaRecorder.isTypeSupported('audio/wav')
        ? { mimeType: 'audio/wav' }
        : MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : {};

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(chunks, { type: options.mimeType || 'audio/webm' });
        setAudioBlob(recordedBlob);
        const url = URL.createObjectURL(recordedBlob);
        setAudioUrl(url);
        setCurrentPrediction(null);
        setShowResults(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Set up Web Audio API for real-time visualization
      const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported');
      }
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Start drawing the waveform
      drawWaveform();

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Stop the animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Close the audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
  };

  const playRecording = () => {
    if (waveSurfer) {
      waveSurfer.playPause();
    } else if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const analyzeAudio = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    setError(null);
    try {
      // Use different service method based on whether it's recorded or uploaded
      const prediction = await audioService.predictRecordedAudio(audioBlob, recordingDuration);
      setCurrentPrediction(prediction);
      setShowResults(true);
      onPredictionComplete(prediction);
    } catch (error: unknown) {
      console.error('Prediction failed:', error);
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        setError('You must be logged in to analyze audio. Please log in and try again.');
      } else if (axiosError.response?.status === 403) {
        setError('You do not have permission to analyze audio. Please contact support.');
      } else {
        setError('Failed to analyze audio. Please try again or contact support.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const exportResults = () => {
    if (!currentPrediction) return;

    const csvContent = [
      ['Emotion', 'Confidence'],
      ...Object.entries(currentPrediction.emotion).map(([emotion, confidence]) => [
        emotion,
        `${(confidence * 100).toFixed(2)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emotion_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteTimeDomainData(dataArray);

      canvasContext.fillStyle = '#f8f9fa';
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);

      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = '#667eea';
      canvasContext.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          canvasContext.moveTo(x, y);
        } else {
          canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasContext.stroke();

      if (isRecording) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-upload">
      <div className="upload-section">
        <div className="recording-controls">
          <h3>Record Voice</h3>
          <div className="recording-buttons">
            {!isRecording ? (
              <button
                className="btn btn-primary record-btn"
                onClick={startRecording}
                disabled={isProcessing}
              >
                <Mic size={20} />
                Start Recording
              </button>
            ) : (
              <div className="recording-active">
                <div className="recording-indicator">
                  <div className="pulse"></div>
                  <span>Recording... {formatDuration(recordingDuration)}</span>
                </div>
                <button
                  className="btn btn-danger stop-btn"
                  onClick={stopRecording}
                >
                  <Square size={20} />
                  Stop
                </button>
              </div>
            )}
          </div>

          {audioBlob && !isRecording && (
            <div className="recording-preview">
              <button
                className="btn btn-secondary play-btn"
                onClick={playRecording}
              >
                <Play size={16} />
                Play Recording
              </button>
            </div>
          )}
        </div>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="file-upload">
          <h3>Upload Audio File</h3>
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${isProcessing ? 'disabled' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="dropzone-content">
              {isProcessing ? (
                <>
                  <Loader className="loading-icon" />
                  <p>Analyzing audio...</p>
                </>
              ) : (
                <>
                  <Upload size={48} />
                  <p>
                    {isDragActive
                      ? 'Drop the audio file here'
                      : 'Drag & drop an audio file here, or click to select'
                    }
                  </p>
                  <p className="file-types">Supported: WAV, MP3, M4A, FLAC</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Waveform Visualization */}
      {(audioUrl || isRecording) && (
        <div className="waveform-section">
          <h3>{isRecording ? 'Live Audio Waveform' : 'Audio Waveform'}</h3>
          <div className="waveform-container">
            {isRecording ? (
              <canvas
                ref={canvasRef}
                width={800}
                height={80}
                style={{ width: '100%', height: '80px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}
              />
            ) : (
              <div ref={waveformRef} className="waveform"></div>
            )}
          </div>
          {!isRecording && (
            <div className="waveform-controls">
              <button
                className="btn btn-primary analyze-btn"
                onClick={analyzeAudio}
                disabled={isProcessing || !audioBlob}
              >
                {isProcessing ? (
                  <>
                    <Loader size={16} className="loading-icon" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 size={16} />
                    Analyze
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-section">
          <div className="error-message">
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Results Display */}
      {showResults && currentPrediction && (
        <div className="results-section">
          <div className="results-header">
            <h3>Analysis Results</h3>
            <button
              className="btn btn-secondary export-btn"
              onClick={exportResults}
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>

          <div className="emotion-results">
            {Object.entries(currentPrediction.emotion).map(([emotion, confidence]) => (
              <div key={emotion} className="emotion-bar">
                <div className="emotion-label">
                  <span className="emotion-name">{emotion}</span>
                  <span className="emotion-percentage">{(confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="prediction-summary">
            <div className="primary-emotion">
              <h4>Primary Emotion</h4>
              <span className="emotion-badge">
                {Object.entries(currentPrediction.emotion).reduce((max, [emotion, confidence]) =>
                  confidence > max.confidence ? { emotion, confidence } : max,
                  { emotion: '', confidence: 0 }
                ).emotion}
              </span>
            </div>
            <div className="confidence-score">
              <h4>Confidence Score</h4>
              <span className="confidence-value">
                {currentPrediction.confidence ? (currentPrediction.confidence * 100).toFixed(1) + '%' : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="upload-info">
        <div className="info-item">
          <h4>Recording Tips</h4>
          <ul>
            <li>Speak clearly and naturally</li>
            <li>Record in a quiet environment</li>
            <li>Keep recordings between 3-10 seconds</li>
            <li>Use good quality microphone if possible</li>
          </ul>
        </div>
        <div className="info-item">
          <h4>Supported Formats</h4>
          <ul>
            <li>WAV - Uncompressed audio</li>
            <li>MP3 - Compressed audio</li>
            <li>M4A - Apple audio format</li>
            <li>FLAC - Lossless compression</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AudioUpload;
