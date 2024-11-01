// components/DashboardLayout.tsx

"use client";

import React, { useEffect, useState, createContext } from "react";
import { Badge } from "@/components/ui/badge";
import { RaceSelector } from "@/components/RaceSelector";
import { getAvailableRaces, Session } from "@/lib/f1api";

export const SessionContext = createContext<number | null>(null);
export const IsLiveContext = createContext<boolean>(false);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionKey, setSelectedSessionKey] = useState<number | null>(
    null
  );
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getAvailableRaces();
        data.sort(
          (a, b) => new Date(b.date_end).getTime() - new Date(a.date_end).getTime()
        );
        setSessions(data);

        if (data.length > 0) {
          setSelectedSessionKey(data[0].session_key);

          // Controlla se la gara è live
          const now = new Date();
          const dateStart = new Date(data[0].date_start);
          const dateEnd = new Date(data[0].date_end);
          setIsLive(now >= dateStart && now <= dateEnd);
        }
      } catch (error) {
        console.error("Errore durante il fetching delle sessioni:", error);
      }
    };

    fetchSessions();
  }, []);

  const handleSelectSession = (sessionKey: number) => {
    setSelectedSessionKey(sessionKey);

    const selectedSession = sessions.find((s) => s.session_key === sessionKey);
    if (selectedSession) {
      const now = new Date();
      const dateStart = new Date(selectedSession.date_start);
      const dateEnd = new Date(selectedSession.date_end);
      setIsLive(now >= dateStart && now <= dateEnd);
    } else {
      setIsLive(false);
    }
  };

  if (!selectedSessionKey) {
    return <div>Caricamento...</div>;
  }

  return (
    <SessionContext.Provider value={selectedSessionKey}>
      <IsLiveContext.Provider value={isLive}>
        <div className="min-h-screen p-8">
          <div className="flex items-center space-x-4 mb-5">
            <Badge
              className="text-lg"
              variant={isLive ? "destructive" : "secondary"}
            >
              {isLive ? "Live" : "Offline"}
            </Badge>
            <RaceSelector
              sessions={sessions}
              selectedSessionKey={selectedSessionKey}
              onSelectSession={handleSelectSession}
            />
          </div>
          {children}
        </div>
      </IsLiveContext.Provider>
    </SessionContext.Provider>
  );
}