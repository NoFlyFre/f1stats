import { formatLapTime } from '../components/DriverStandingsTable';

describe('formatLapTime', () => {
  it('formats seconds greater than a minute', () => {
    expect(formatLapTime(62.345)).toBe('1:02.345');
  });

  it('formats seconds less than a minute', () => {
    expect(formatLapTime(45.678)).toBe('45.678');
  });
});

