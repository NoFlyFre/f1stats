// components/DriverStandingsTable.tsx

"use client";

import { useEffect, useState, useContext } from "react";
import {
  getDrivers,
  getDriverPositions,
  getLastLapTimes,
  getBestLapTimes,
} from "@/lib/f1api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SessionContext, IsLiveContext } from "@/components/DashBoardLayout";

interface Driver {
  driver_number: number;
  full_name: string;
  team_name: string;
}

interface PositionData {
  date: string;
  driver_number: number;
  position: number;
}

interface LapTime {
  driver_number: number;
  lap_number: number;
  lap_duration: number;
}

export function DriverStandingsTable() {
  const sessionKey = useContext(SessionContext);
  const isLive = useContext(IsLiveContext);
  const [positions, setPositions] = useState<PositionData[]>([]);
  const [previousPositions, setPreviousPositions] = useState<
    Map<number, number>
  >(new Map());
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [lapTimes, setLapTimes] = useState<Map<number, LapTime>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  if (!sessionKey) {
    return <div>Sessione non disponibile</div>;
  }

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [positionsData, driversData, lapTimesData] = await Promise.all([
          getDriverPositions(sessionKey),
          getDrivers(sessionKey),
          isLive ? getLastLapTimes(sessionKey) : getBestLapTimes(sessionKey),
        ]);

        if (isMounted) {
          // Mappa per le posizioni attuali
          const latestPositionsMap = new Map<number, PositionData>();

          positionsData.forEach((position) => {
            const existing = latestPositionsMap.get(position.driver_number);
            if (
              !existing ||
              new Date(position.date).getTime() >
                new Date(existing.date).getTime()
            ) {
              latestPositionsMap.set(position.driver_number, position);
            }
          });

          // Confronta le posizioni attuali con quelle precedenti
          const newPositions = Array.from(latestPositionsMap.values()).sort(
            (a, b) => a.position - b.position
          );

          const newPreviousPositions = new Map<number, number>();
          newPositions.forEach((position) => {
            const prevPosition = positions.find(
              (p) => p.driver_number === position.driver_number
            )?.position;
            newPreviousPositions.set(
              position.driver_number,
              prevPosition || position.position
            );
          });

          // Mappa per i tempi sul giro
          const lapTimesMap = new Map<number, LapTime>();
          lapTimesData.forEach((lap) => {
            lapTimesMap.set(lap.driver_number, lap);
          });

          setDrivers(driversData);
          setLapTimes(lapTimesMap);
          setPreviousPositions(newPreviousPositions);
          setPositions(newPositions);
        }
      } catch (error) {
        console.error("Errore durante il fetching dei dati:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    let intervalId: NodeJS.Timeout;
    if (isLive) {
      intervalId = setInterval(fetchData, 5000); // Aggiorna ogni 5 secondi solo se live
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [sessionKey, isLive]);

  if (isLoading) {
    return <div>Caricamento classifica...</div>;
  }

  if (!positions.length) {
    return <div>Nessuna classifica disponibile.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Posizione</TableHead>
          <TableHead>Pilota</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>{isLive ? "Ultimo Giro" : "Miglior Giro"}</TableHead>
          {isLive && <TableHead>Variazione</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((position) => {
          const driver = drivers.find(
            (d) => d.driver_number === position.driver_number
          );
          const lapTime = lapTimes.get(position.driver_number);

          // Calcola la variazione di posizione
          let positionChange: number | null = null;
          if (isLive) {
            const prevPosition = previousPositions.get(position.driver_number);
            if (prevPosition !== undefined) {
              positionChange = prevPosition - position.position;
            }
          }

          // Formatta il tempo del giro
          const formattedLapTime = lapTime
            ? formatLapTime(lapTime.lap_duration)
            : "N/A";

          return (
            <TableRow key={position.driver_number}>
              <TableCell>{position.position}</TableCell>
              <TableCell>{driver ? driver.full_name : "N/A"}</TableCell>
              <TableCell>{driver ? driver.team_name : "N/A"}</TableCell>
              <TableCell>{formattedLapTime}</TableCell>
              {isLive && (
                <TableCell>
                  {positionChange !== null && positionChange !== 0 ? (
                    <span
                      style={{
                        color: positionChange > 0 ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {positionChange > 0 ? "▲" : "▼"}{" "}
                      {Math.abs(positionChange)}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// Funzione per formattare il tempo sul giro come in Formula 1
function formatLapTime(duration: number): string {
  const totalMilliseconds = duration;
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = totalMilliseconds % 1000;

  // Se il tempo è inferiore a un minuto, non mostrare i minuti
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds
      .toString()
      .padStart(3, "0")}`;
  } else {
    return `${seconds}.${milliseconds.toString().padStart(3, "0")}`;
  }
}