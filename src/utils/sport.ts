import dayjs from 'dayjs';
import { LocationPoint, SportRecord, SportType } from '@/types';

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${meters.toFixed(0)} m`;
};

export const formatPace = (pace: number): string => {
  if (pace === Infinity || pace === 0) return '--:--';
  const minutes = Math.floor(pace / 60);
  const seconds = Math.floor(pace % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}/km`;
};

export const formatSpeed = (speed: number): string => {
  return `${speed.toFixed(1)} km/h`;
};

export const formatCalories = (calories: number): string => {
  return `${calories.toFixed(0)} kcal`;
};

export const calculateDistance = (points: LocationPoint[]): number => {
  if (points.length < 2) return 0;
  
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += getDistance(points[i - 1], points[i]);
  }
  return total;
};

export const getDistance = (p1: LocationPoint, p2: LocationPoint): number => {
  const R = 6371000;
  const dLat = (p2.latitude - p1.latitude) * Math.PI / 180;
  const dLon = (p2.longitude - p1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.latitude * Math.PI / 180) * Math.cos(p2.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateCalories = (
  type: SportType,
  duration: number,
  weight: number = 70
): number => {
  const MET: Record<SportType, number> = {
    run: 9.8,
    ride: 7.5,
    walk: 4.3
  };
  
  const hours = duration / 3600;
  return MET[type] * weight * hours;
};

export const calculateAvgPace = (distance: number, duration: number): number => {
  if (distance === 0) return 0;
  const km = distance / 1000;
  return duration / km;
};

export const calculateAvgSpeed = (distance: number, duration: number): number => {
  if (duration === 0) return 0;
  const km = distance / 1000;
  const hours = duration / 3600;
  return km / hours;
};

export const getTodayRecords = (records: SportRecord[]): SportRecord[] => {
  const today = dayjs().format('YYYY-MM-DD');
  return records.filter(r => dayjs(r.startTime).format('YYYY-MM-DD') === today);
};

export const getWeekRecords = (records: SportRecord[]): SportRecord[] => {
  const weekStart = dayjs().startOf('week');
  return records.filter(r => dayjs(r.startTime).isAfter(weekStart));
};

export const getMonthRecords = (records: SportRecord[]): SportRecord[] => {
  const monthStart = dayjs().startOf('month');
  return records.filter(r => dayjs(r.startTime).isAfter(monthStart));
};

export const getRecordsByType = (records: SportRecord[], type: SportType): SportRecord[] => {
  return records.filter(r => r.type === type);
};

export const getDailyStats = (records: SportRecord[], days: number = 7) => {
  const stats = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
    const dayRecords = records.filter(r => 
      dayjs(r.startTime).format('YYYY-MM-DD') === date
    );
    
    stats.push({
      date,
      distance: dayRecords.reduce((sum, r) => sum + r.distance, 0),
      duration: dayRecords.reduce((sum, r) => sum + r.duration, 0),
      calories: dayRecords.reduce((sum, r) => sum + r.calories, 0),
      count: dayRecords.length
    });
  }
  return stats;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
