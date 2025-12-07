"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from "recharts";

interface SalesChartProps {
    data: any[];
    title: string;
    description?: string;
    type?: "line" | "bar";
    dataKey?: string;
    categoryKey?: string;
}

export function SalesChart({
    data,
    title,
    description,
    type = "line",
    dataKey = "revenue",
    categoryKey = "date"
}: SalesChartProps) {

    // Format dates if they look like dates
    const formattedData = data.map(item => {
        if (categoryKey === 'date' && typeof item[categoryKey] === 'string') {
            return {
                ...item,
                date: new Date(item.date).toLocaleDateString("es-ES", { month: 'short', day: 'numeric' })
            };
        }
        return item;
    });

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    {type === "line" ? (
                        <LineChart data={formattedData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey={categoryKey}
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                                itemStyle={{ color: 'hsl(var(--primary))' }}
                            />
                            <Line
                                type="monotone"
                                dataKey={dataKey}
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    ) : (
                        <BarChart data={formattedData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey={categoryKey}
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                            />
                            <Bar
                                dataKey={dataKey}
                                fill="hsl(var(--primary))"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
