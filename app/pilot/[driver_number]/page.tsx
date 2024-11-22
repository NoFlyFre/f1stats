// page.tsx

"use client";

import { use, useEffect, useState } from "react";
import { LapTimeChart } from "@/components/LapTimeChart";
import { TyrePieChart } from "@/components/TyrePieChart";
import { TotalTimeChart } from "@/components/TotalTimeChart";
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/DashBoardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PilotDashboardProps {
  params: Promise<{
    driver_number: string;
  }>;
}

export default function PilotDashboard({
  params,
}: PilotDashboardProps) {
  const [sessionKey, setSessionKey] = useState<number | null>(null);
  const [driverNumber, setDriverNumber] = useState<number>(parseInt(use(params).driver_number)); // Puoi impostare il driver che preferisci
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
        <DashboardLayout>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Card className="w-full h-[400px]">
              <CardHeader>
                <CardTitle><Skeleton></Skeleton></CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-full">
                <Skeleton></Skeleton>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
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
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TotalTimeChart></TotalTimeChart>
        <LapTimeChart sessionKey={sessionKey} driverNumber={driverNumber} />
        <TyrePieChart sessionKey={sessionKey} driverNumber={driverNumber} />
      </div>
    </DashboardLayout>
  );
}