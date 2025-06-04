"use client";

import { useState, useEffect, useContext } from "react";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { fetchTotalTimeData } from "@/lib/f1api"; // Assicurati che il percorso sia corretto
import { SessionContext } from "@/components/DashBoardLayout";

export const description = "A line chart with a label";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
};

export function TotalTimeChart() {
  const sessionKey = useContext(SessionContext);
  const [chartData, setChartData] = useState<
    { month: string; desktop: number; mobile: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionKey) return;
    async function getData() {
      try {
        const data = await fetchTotalTimeData(sessionKey!);
        setChartData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    getData();
  }, [sessionKey]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Time Chart</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ChartContainer config={chartConfig}>
            <LineChart width={600} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <Line
                type="monotone"
                dataKey="desktop"
                stroke={chartConfig.desktop.color}
              >
                <LabelList dataKey="desktop" position="top" />
              </Line>
              <Line
                type="monotone"
                dataKey="mobile"
                stroke={chartConfig.mobile.color}
              >
                <LabelList dataKey="mobile" position="top" />
              </Line>
              <ChartTooltip content={<ChartTooltipContent />} />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <TrendingUp className="mr-2" />
        <span>Trending up by 5.2% this month</span>
        <CardDescription>Showing total visitors for the last 6 months</CardDescription>
      </CardFooter>
    </Card>
  );
}

