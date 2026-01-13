import type { ChartData, ChartOptions } from 'chart.js';

export interface PredictionTrends {
  data: ChartData<'line'>;
  options: ChartOptions<'line'>;
}

export interface EmotionDistribution {
  data: ChartData<'doughnut'>;
  options: ChartOptions<'doughnut'>;
}

export interface EngagementMetrics {
  totalSessions: number;
  averageSessionDuration: number;
  mostActiveDay: string;
  mostActiveHour: number;
}
