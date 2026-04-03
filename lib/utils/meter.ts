// Month order for sorting
const MONTH_ORDER: Record<string, number> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

export interface MeterReading {
  _id: string;
  meterId: string;
  month: string;
  units: number;
  reading: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Sort readings by month (most recent first)
 */
export function sortReadingsByMonth(readings: MeterReading[]): MeterReading[] {
  return [...readings].sort((a, b) => {
    const monthA = MONTH_ORDER[a.month] || 0;
    const monthB = MONTH_ORDER[b.month] || 0;
    return monthB - monthA; // Descending order
  });
}

/**
 * Get total consumption from readings (sum of units)
 */
export function getTotalConsumption(readings: MeterReading[]): number {
  return readings.reduce((sum, r) => sum + (r.units || 0), 0);
}

/**
 * Get latest reading value
 */
export function getLatestReading(readings: MeterReading[]): number | null {
  if (readings.length === 0) return null;
  const sorted = sortReadingsByMonth(readings);
  return sorted[0]?.reading || null;
}
