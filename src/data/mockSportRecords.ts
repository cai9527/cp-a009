import dayjs from 'dayjs';
import { SportRecord, SportType } from '@/types';

const generatePoints = (count: number) => {
  const points = [];
  let lat = 39.9042;
  let lng = 116.4074;
  
  for (let i = 0; i < count; i++) {
    lat += (Math.random() - 0.5) * 0.001;
    lng += (Math.random() - 0.5) * 0.001;
    points.push({
      latitude: lat,
      longitude: lng,
      timestamp: Date.now() + i * 1000,
      speed: 5 + Math.random() * 5
    });
  }
  return points;
};

const generateRecord = (
  id: string,
  type: SportType,
  daysAgo: number,
  duration: number,
  distance: number,
  calories: number
): SportRecord => {
  const startTime = dayjs().subtract(daysAgo, 'day').hour(8 + Math.floor(Math.random() * 12)).toISOString();
  const endTime = dayjs(startTime).add(duration, 'second').toISOString();
  const points = generatePoints(Math.floor(duration / 10));
  
  return {
    id,
    userId: 'user_001',
    type,
    startTime,
    endTime,
    duration,
    distance,
    calories,
    avgSpeed: (distance / 1000) / (duration / 3600),
    maxSpeed: 8 + Math.random() * 6,
    avgPace: duration / (distance / 1000),
    steps: type === 'walk' ? Math.floor(distance * 1.4) : Math.floor(distance * 1.2),
    points
  };
};

export const mockSportRecords: SportRecord[] = [
  generateRecord('rec_001', 'run', 0, 1800, 4200, 380),
  generateRecord('rec_002', 'ride', 0, 2700, 8500, 450),
  generateRecord('rec_003', 'run', 1, 2100, 5100, 460),
  generateRecord('rec_004', 'walk', 1, 3600, 3200, 200),
  generateRecord('rec_005', 'ride', 2, 3200, 12000, 620),
  generateRecord('rec_006', 'run', 2, 1500, 3500, 320),
  generateRecord('rec_007', 'walk', 3, 2400, 2100, 130),
  generateRecord('rec_008', 'run', 3, 2400, 5800, 520),
  generateRecord('rec_009', 'ride', 4, 2800, 9500, 490),
  generateRecord('rec_010', 'run', 4, 1900, 4500, 410),
  generateRecord('rec_011', 'walk', 5, 3000, 2600, 160),
  generateRecord('rec_012', 'ride', 5, 3500, 11000, 570),
  generateRecord('rec_013', 'run', 6, 2200, 5300, 480),
  generateRecord('rec_014', 'walk', 6, 2700, 2300, 140),
  generateRecord('rec_015', 'ride', 7, 3000, 10500, 540),
];
