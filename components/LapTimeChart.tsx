"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Space } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

interface LapTime {
  lap_number: number;
  duration_sector_1: number;
  duration_sector_2: number;
  duration_sector_3: number;
}

interface LapTimeChartProps {
  sessionKey: number;
  driverNumber: number;
}

export function LapTimeChart({ sessionKey, driverNumber }: LapTimeChartProps) {
  const [lapTimes, setLapTimes] = useState<LapTime[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLapTimes = async () => {
      try {
        const res = await fetch(
          `https://api.openf1.org/v1/laps?session_key=${sessionKey}&driver_number=${driverNumber}`
        );
        const data = await res.json();

        if (isMounted) {
          const formattedLapTimes = data
            .filter(
              (lap: any) =>
                lap.duration_sector_1 != null &&
                lap.duration_sector_2 != null &&
                lap.duration_sector_3 != null
            )
            .map((lap: any) => ({
              lap_number: lap.lap_number,
              duration_sector_1: Number(lap.duration_sector_1),
              duration_sector_2: Number(lap.duration_sector_2),
              duration_sector_3: Number(lap.duration_sector_3),
            }));

          setLapTimes(formattedLapTimes);
        }
      } catch (error) {
        console.error("Error fetching lap times:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLapTimes();

    const intervalId = setInterval(fetchLapTimes, 5000); // Aggiorna ogni 5 secondi

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [sessionKey, driverNumber]);

  const chartConfig = {
    duration_sector_1: {
      label: "Settore 1",
      color: "var(--sector-1-color)",
    },
    duration_sector_2: {
      label: "Settore 2",
      color: "var(--sector-2-color)",
    },
    duration_sector_3: {
      label: "Settore 3",
      color: "var(--sector-3-color)",
    },
  } as const;

  if (isLoading) {
    return (
      <Card className="w-full h-[400px]">
        <CardHeader>
          <CardTitle><Skeleton></Skeleton></CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <Skeleton></Skeleton>
        </CardContent>
      </Card>
    );
  }

  if (!lapTimes.length) {
    return (
      <Card className="w-full h-[400px]">
        <CardHeader>
          <CardTitle>Tempi per Settore</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div>Nessun dato disponibile</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Tempi per Settore</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <LineChart data={lapTimes}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="lap_number"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              label={{
                value: "Giro",
                position: "insideBottom",
                offset: -5,
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toFixed(2)}s`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="duration_sector_1"
              stroke="var(--sector-1-color)"
              name="Settore 1"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="duration_sector_2"
              stroke="var(--sector-2-color)"
              name="Settore 2"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="duration_sector_3"
              stroke="var(--sector-3-color)"
              name="Settore 3"
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}