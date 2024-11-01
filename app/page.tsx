// app/page.tsx

import DashboardLayout from "@/components/DashBoardLayout";
import { DriverStandingsTable } from "@/components/DriverStandingsTable";

export default function Home() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Classifica Piloti</h1>
      <DriverStandingsTable />
    </DashboardLayout>
  );
}