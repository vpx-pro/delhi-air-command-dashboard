'use client';

export type AqiCategory =
  | 'Good (0–50)'
  | 'Satisfactory (51–100)'
  | 'Moderate (101–200)'
  | 'Poor (201–300)'
  | 'Very Poor (301–400)'
  | 'Severe (401–500)';

export function getAqiCategory(aqi: number | null | undefined): AqiCategory {
  // NAQI bands as per India CPCB guidelines.
  if (aqi == null) return 'Moderate (101–200)';
  if (aqi <= 50) return 'Good (0–50)';
  if (aqi <= 100) return 'Satisfactory (51–100)';
  if (aqi <= 200) return 'Moderate (101–200)';
  if (aqi <= 300) return 'Poor (201–300)';
  if (aqi <= 400) return 'Very Poor (301–400)';
  return 'Severe (401–500)';
}

export function getAqiBadgeClass(aqi: number | null | undefined): string {
  const category = getAqiCategory(aqi);
  switch (category) {
    case 'Good (0–50)':
      return 'badge-aqi-good';
    case 'Satisfactory (51–100)':
    case 'Moderate (101–200)':
      return 'badge-aqi-moderate';
    case 'Poor (201–300)':
      return 'badge-aqi-poor';
    case 'Very Poor (301–400)':
      return 'badge-aqi-very-poor';
    case 'Severe (401–500)':
    default:
      return 'badge-aqi-hazardous';
  }
}


