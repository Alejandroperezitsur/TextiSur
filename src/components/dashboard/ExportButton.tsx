"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
    data: any[];
    filename?: string;
}

export function ExportButton({ data, filename = "data.csv" }: ExportButtonProps) {
    const handleExport = () => {
        if (!data || data.length === 0) return;

        // Convert JSON to CSV
        const headers = Object.keys(data[0]);
        const csvContent =
            "data:text/csv;charset=utf-8," +
            [
                headers.join(","),
                ...data.map((row) =>
                    headers.map((header) => `"${row[header] || ""}"`).join(",")
                ),
            ].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
        </Button>
    );
}
