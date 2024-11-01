"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface TyreStint {
  compound: string;
  lap_start: number;
  lap_end: number;
}

interface TyrePieChartProps {
  sessionKey: number;
  driverNumber: number;
}

export function TyrePieChart({ sessionKey, driverNumber }: TyrePieChartProps) {
  const [stints, setStints] = useState<TyreStint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStints = async () => {
      try {
        const res = await fetch(
          `https://api.openf1.org/v1/stints?session_key=${sessionKey}&driver_number=${driverNumber}`
        );
        const data = await res.json();

        setStints(data);
      } catch (error) {
        console.error("Error fetching stints:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStints();

    const intervalId = setInterval(fetchStints, 5000); // Aggiorna ogni 5 secondi

    return () => clearInterval(intervalId);
  }, [sessionKey, driverNumber]);

  // Definisci il chartConfig
  const chartConfig = {
    SOFT: {
      label: "Soft",
      color: "var(--tyre-soft-color)",
    },
    MEDIUM: {
      label: "Medium",
      color: "var(--tyre-medium-color)",
    },
    HARD: {
      label: "Hard",
      color: "var(--tyre-hard-color)",
    },
    INTERMEDIATE: {
      label: "Intermediate",
      color: "var(--tyre-intermediate-color)",
    },
    WET: {
      label: "Wet",
      color: "var(--tyre-wet-color)",
    },
  } as const;

  if (isLoading) {
    return (
      <Card className="w-full h-[400px]">
        <CardHeader>
          <CardTitle>Utilizzo Gomme</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div>Caricamento...</div>
        </CardContent>
      </Card>
    );
  }

  if (!stints.length) {
    return (
      <Card className="w-full h-[400px]">
        <CardHeader>
          <CardTitle>Utilizzo Gomme</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div>Nessun dato disponibile</div>
        </CardContent>
      </Card>
    );
  }

  // Calcola i dati per il grafico
  const totalLaps = stints.reduce(
    (acc, stint) => acc + (stint.lap_end - stint.lap_start + 1),
    0
  );

  const data = stints.reduce((acc, stint) => {
    const laps = stint.lap_end - stint.lap_start + 1;
    const compound = stint.compound;
    acc[compound] = (acc[compound] || 0) + laps;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / totalLaps) * 100).toFixed(1),
  }));

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Utilizzo Gomme</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percentage }) => `${name} (${percentage}%)`}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`var(--tyre-${entry.name.toLowerCase()}-color)`}
                />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}