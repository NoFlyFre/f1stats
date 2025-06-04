// components/RaceSelector.tsx

"use client";

import React from "react";
import { Session } from "@/lib/f1api";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

interface RaceSelectorProps {
    sessions: Session[];
    selectedSessionKey: number | null;
    onSelectSession: (sessionKey: number) => void;
}

export function RaceSelector({
    sessions,
    selectedSessionKey,
    onSelectSession,
}: RaceSelectorProps) {
    if (!sessions.length) {
        return <div>Nessuna gara disponibile.</div>;
    }

    return (
        <Select
            onValueChange={(value) => onSelectSession(Number(value))}
            value={selectedSessionKey ? String(selectedSessionKey) : ""}
        >
            <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Seleziona una gara" />
            </SelectTrigger>
            <SelectContent>
                {sessions.map((session) => {
                    const date = new Date(session.date_start);
                    const day = date.getDate().toString().padStart(2, "0");
                    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Mesi da 0 a 11
                    const year = date.getFullYear();
                    const formattedDate = `${day}/${month}/${year}`;

                    return (
                        <SelectItem key={session.session_key} value={String(session.session_key)}>
                            {`${session.circuit_short_name} - ${formattedDate}`}
                        </SelectItem>
                    );
                })
            </SelectContent>
        </Select>
    );
}