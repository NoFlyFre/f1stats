// f1api.tsx

export interface Session {
  session_key: number;
  circuit_short_name: string;
  date_start: string;
  date_end: string;
  session_name: string;
}

export interface Driver {
  driver_number: number;
  full_name: string;
  team_name: string;
}

export interface TyreStint {
  compound: string;
  driver_number: number;
  lap_start: number;
  lap_end: number;
  stint_number: number;
  tyre_age_at_start: number;
}

export interface LapTime {
  driver_number: number;
  lap_number: number;
  lap_duration: number;
  duration_sector_1: number;
  duration_sector_2: number;
  duration_sector_3: number;
}

export interface PositionData {
  date: string;
  driver_number: number;
  meeting_key: number;
  position: number;
  session_key: number;
}

const BASE_URL = 'https://api.openf1.org/v1';

export async function getLatestSession() {
  const todayStr = new Date().toISOString().split('T')[0]; // Ottiene 'YYYY-MM-DD'

  // Prova a recuperare la sessione più recente utilizzando 'order_by' e 'limit'
  let res = await fetch(
    `${BASE_URL}/sessions?session_name=Race&date_end<=${todayStr}&order_by=-date_end&limit=1`
  );
  let data = await res.json();

  if (data && data.length > 0) {
    return data;
  }

  // Se 'order_by' non è supportato, recupera tutte le sessioni passate e ordina lato client
  res = await fetch(
    `${BASE_URL}/sessions?session_name=Race&date_end<=${todayStr}`
  );
  data = await res.json();

  if (!data || data.length === 0) {
    return [];
  }

  // Ordina le sessioni per 'date_end' in ordine decrescente
  data.sort((a: any, b: any) => new Date(b.date_end).getTime() - new Date(a.date_end).getTime());

  // Restituisci la sessione più recente
  return [data[0]];
}

export async function getDrivers(sessionKey: number) {
  const res = await fetch(`${BASE_URL}/drivers?session_key=${sessionKey}`);
  return res.json();
}

export async function getTyreStints(sessionKey: number) {
  const res = await fetch(`${BASE_URL}/stints?session_key=${sessionKey}&driver_number=1`);
  return res.json();
}

export async function getLapTimes(sessionKey: number) {
  const res = await fetch(`${BASE_URL}/laps?session_key=${sessionKey}&driver_number=1`);
  return res.json();
}

export async function getDriverPositions(sessionKey: number): Promise<PositionData[]> {
  const res = await fetch(`${BASE_URL}/position?session_key=${sessionKey}`);
  return res.json();
}

export async function getRaceData(sessionKey: number): Promise<PositionData[]> {
  const res = await fetch(`${BASE_URL}/position?session_key=${sessionKey}`);
  return res.json();
}

export async function getAvailableRaces(): Promise<Session[]> {
  const res = await fetch(`${BASE_URL}/sessions?session_name=Race`);
  const data = await res.json();
  return data;
}

// f1api.tsx

export async function getBestLapTimes(sessionKey: number): Promise<LapTime[]> {
  const res = await fetch(`${BASE_URL}/laps?session_key=${sessionKey}`);
  const data: LapTime[] = await res.json();

  const bestLapTimesMap = new Map<number, LapTime>();

  data.forEach((lap: LapTime) => {
    // Ignora i giri con lap_duration nullo o non definito
    if (lap.lap_duration == null) {
      return;
    }

    const existingLap = bestLapTimesMap.get(lap.driver_number);

    if (
      !existingLap ||
      existingLap.lap_duration == null ||
      lap.lap_duration < existingLap.lap_duration
    ) {
      bestLapTimesMap.set(lap.driver_number, lap);
    }
  });

  return Array.from(bestLapTimesMap.values());
}

export async function getLastLapTimes(sessionKey: number): Promise<LapTime[]> {
  const res = await fetch(`${BASE_URL}/laps?session_key=${sessionKey}`);
  const data: LapTime[] = await res.json();

  const lastLapTimesMap = new Map<number, LapTime>();

  data.forEach((lap: LapTime) => {
    const existingLap = lastLapTimesMap.get(lap.driver_number);
    if (!existingLap || lap.lap_number > existingLap.lap_number) {
      lastLapTimesMap.set(lap.driver_number, lap);
    }
  });

  return Array.from(lastLapTimesMap.values());
}

export async function fetchTotalTimeData(sessionKey: number) {
  try {
    const response = await fetch(`https://api.openf1.org/v1/laps?session_key=${sessionKey}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    // Trasforma i dati per estrarre le informazioni rilevanti per il grafico
    return data.map(item => ({
      month: new Date(item.date_start).toLocaleString('default', { month: 'long' }),
      desktop: item.lap_duration, // Puoi rinominare o aggiustare le chiavi in base ai dati ricevuti
      mobile: item.duration_sector_1 + item.duration_sector_2 + item.duration_sector_3,
    }));
  } catch (error) {
    console.error("Error fetching total time data:", error);
    return [];
  }
}
