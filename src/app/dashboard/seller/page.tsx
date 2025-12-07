"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function SellerDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "vendedor")) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user?.role === "vendedor") {
            fetch("/api/analytics")
                .then((res) => res.json())
                .then((data) => {
                    setStats(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="space-y-6 container mx-auto p-6">
                <Skeleton className="h-8 w-[200px]" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-[400px] rounded-xl" />
            </div>
        );
    }

    // Transform Hourly Data for Chart
    const hourlyData = stats?.salesByHour?.map((item: any) => ({
        name: `${item.hour}:00`,
        sales: item.sales
    })) || [];

    return (
        <div className="space-y-6 container mx-auto p-6 animate-fade-in pb-24 md:pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <div className="flex items-center space-x-2">
                    <ExportButton data={stats?.salesByDay || []} filename="ventas_diarias.csv" />
                    <Link href="/products/new">
                        <Button>Agregar Producto</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats?.totalRevenue?.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+20.1% del mes pasado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventas</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats?.totalSales}</div>
                        <p className="text-xs text-muted-foreground">+180.1% del mes pasado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">+2 nuevos esta semana</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+573</div>
                        <p className="text-xs text-muted-foreground">+201 desde la última hora</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <SalesChart
                        title="Resumen de Ventas"
                        description="Ventas diarias de los últimos 7 días"
                        data={stats?.salesByDay}
                    />
                </div>

                <div className="col-span-3">
                    <SalesChart
                        title="Ventas por Hora"
                        description="Distribución de ventas por hora del día"
                        data={hourlyData}
                        type="bar"
                        categoryKey="name"
                        dataKey="sales"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Productos Top</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {stats?.topProducts?.map((product: any, i: number) => (
                                <div key={i} className="flex items-center">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-4">
                                        {i + 1}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{product.name}</p>
                                        <p className="text-sm text-muted-foreground">{product.sales} ventas • {product.quantitySold} unidades</p>
                                    </div>
                                    <div className="ml-auto font-medium text-green-600 dark:text-green-400">
                                        +${parseFloat(product.revenue).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
