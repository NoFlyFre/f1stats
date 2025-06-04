// components/DriverStandingsTable.tsx

"use client";

import React, { useEffect, useState, useContext } from "react";
import {
    getDrivers,
    getDriverPositions,
    getLastLapTimes,
    getBestLapTimes,
    Driver,
    PositionData,
    LapTime,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation'; // Import corretto

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
    const router = useRouter(); // Utilizza useRouter da 'next/navigation'

    if (!sessionKey) {
        return <div>Sessione non disponibile</div>;
    }

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [positionsData, driversData, lapTimesData] = await Promise.all([
                    getDriverPositions(sessionKey),
                    getDrivers(sessionKey),
                    isLive ? getLastLapTimes(sessionKey) : getBestLapTimes(sessionKey),
                ]);

                if (isMounted) {
                    // Mappa per le posizioni attuali
                    const latestPositionsMap = new Map<number, PositionData>();

                    positionsData.forEach((position: PositionData) => {
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
                    newPositions.forEach((position: PositionData) => {
                        const prevPosition = positions.find(
                            (p) => p.driver_number === position.driver_number
                        )?.position;
                        newPreviousPositions.set(
                            position.driver_number,
                            prevPosition !== undefined ? prevPosition : position.position
                        );
                    });

                    // Mappa per i tempi sul giro
                    const lapTimesMap = new Map<number, LapTime>();
                    lapTimesData.forEach((lap: LapTime) => {
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
                    {[...Array(20)].map((_, index) => (
                        <TableRow key={index}>
                            <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            {isLive && (
                                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
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
                    <TableHead></TableHead> {/* Colonna per l'icona */}
                </TableRow>
            </TableHeader>
            <TableBody>
                {positions.map((position: PositionData) => {
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
                        <TableRow
                            key={position.driver_number}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => {
                                router.push(`/pilot/${position.driver_number}`);
                            }}
                            onKeyPress={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    router.push(`/pilot/${position.driver_number}`);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={`Vai alla dashboard di ${driver?.full_name || "N/A"}`}
                        >
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
                            {/* Aggiungi un'icona a destra per indicare la navigabilità */}
                            <TableCell className="flex justify-end">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 1.414L10.414 10l3.293 3.293a1 1 0 01-1.414 1.414L8.586 10.707a1 1 0 010-1.414L12.293 5.293z" clipRule="evenodd" />
                                </svg>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

// Funzione per formattare il tempo sul giro come in Formula 1
export function formatLapTime(duration: number): string {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    // Formatta i secondi con due cifre prima del punto decimale e tre cifre decimali
    const secondsStr = seconds.toFixed(3).padStart(6, '0');

    if (minutes > 0) {
        return `${minutes}:${secondsStr}`;
    } else {
        return `${secondsStr}`;
    }
}
