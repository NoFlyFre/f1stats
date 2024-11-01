// page.tsx

"use client";

import { useEffect, useState } from "react";
import { LapTimeChart } from "@/components/LapTimeChart";
import { TyrePieChart } from "@/components/TyrePieChart";
import { Badge } from "@/components/ui/badge"


export default function PilotDashboard() {
  const [sessionKey, setSessionKey] = useState<number | null>(null);
  const [driverNumber, setDriverNumber] = useState<number>(1); // Puoi impostare il driver che preferisci
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSessionKey = async () => {
      try {
        const res = await fetch(
          `https://api.openf1.org/v1/sessions?session_name=Race&date_end<=${new Date()
            .toISOString()
            .split("T")[0]}`
        );
        const data = await res.json();

        if (data && data.length > 0) {
          data.sort(
            (a: any, b: any) =>
              new Date(b.date_end).getTime() - new Date(a.date_end).getTime()
          );
          setSessionKey(data[0].session_key);
        }
      } catch (error) {
        console.error("Error fetching session key:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionKey();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">Caricamento...</h1>
      </div>
    );
  }

  if (!sessionKey) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">Nessuna sessione disponibile</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LapTimeChart sessionKey={sessionKey} driverNumber={driverNumber}  />
        <TyrePieChart sessionKey={sessionKey} driverNumber={driverNumber} />
      </div>
    </div>
  );
}