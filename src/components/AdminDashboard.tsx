"use client";

import { useEffect, useState } from 'react';
import { getAllUsers, getOrders, UserProfile, Order } from '@/services/storage';
import { Users, ClipboardList, DollarSign, TrendingUp, Search, Lock, Shirt } from 'lucide-react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Swal from 'sweetalert2';
import { useExchangeRate } from "@/context/ExchangeRateContext";

export default function AdminDashboard() {
    const { formatBs } = useExchangeRate();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [usersData, ordersData] = await Promise.all([getAllUsers(), getOrders()]);
                setUsers(usersData);
                setOrders(ordersData);
            } catch (error) {
                console.error("Error loading admin data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Password Reset Handler
    const handleResetPassword = async (email: string) => {
        const result = await Swal.fire({
            title: '¿Resetear Contraseña?',
            text: `Se enviará un correo a ${email} para restablecer su contraseña.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Sí, enviar correo',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await sendPasswordResetEmail(auth, email);
                Swal.fire('Enviado', 'El correo de restablecimiento ha sido enviado.', 'success');
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo enviar el correo.', 'error');
            }
        }
    };

    // Calculate metrics per user
    const userMetrics = users.map(user => {
        const userOrders = orders.filter(o => o.ownerId === user.uid);
        const totalOrders = userOrders.length;
        const pendingOrders = userOrders.filter(o => o.status !== 'Entregado').length;
        const totalRevenue = userOrders.reduce((sum, o) => sum + (o.price || 0), 0);

        return {
            ...user,
            totalOrders,
            pendingOrders,
            totalRevenue
        };
    });

    const filteredUsers = userMetrics.filter(user =>
        (user.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalSystemOrders = orders.length;
    const totalSystemRevenue = orders.reduce((sum, o) => sum + (o.price || 0), 0);
    const averageRevenuePerUser = users.length > 0 ? totalSystemRevenue / users.length : 0;

    // Top Products
    const productStats = orders.reduce((acc, order) => {
        const name = order.garmentName || 'Desconocido';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topProducts = Object.entries(productStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    if (loading) {
        return <div className="p-8 text-slate-400">Cargando panel de administración...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
                    <ShieldCheckIcon className="text-emerald-500" /> Panel de Administrador
                </h1>
                <p className="text-slate-500">Visión global del sistema y gestión de usuarios.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Usuarios Totales" value={users.length} color="blue" />
                <StatCard icon={ClipboardList} label="Pedidos Totales" value={totalSystemOrders} color="indigo" />
                <StatCard
                    icon={DollarSign}
                    label="Ingresos Totales"
                    value={
                        <div className="flex flex-col">
                            <span>${totalSystemRevenue.toFixed(2)}</span>
                            <span className="text-xs opacity-70 font-mono font-normal">{formatBs(totalSystemRevenue)}</span>
                        </div>
                    }
                    color="emerald"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Promedio por Usuario"
                    value={
                        <div className="flex flex-col">
                            <span>${averageRevenuePerUser.toFixed(2)}</span>
                            <span className="text-xs opacity-70 font-mono font-normal">{formatBs(averageRevenuePerUser)}</span>
                        </div>
                    }
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Products */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                    <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                        <Shirt className="text-purple-500" size={20} /> Prendas Más Vendidas
                    </h2>
                    <div className="space-y-4">
                        {topProducts.map(([name, count], index) => (
                            <div key={name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-700">
                                        {index + 1}
                                    </span>
                                    <span className="text-slate-300 font-medium">{name}</span>
                                </div>
                                <span className="text-slate-400 text-sm font-semibold">{count} pedidos</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Users Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-100">Gestión de Usuarios</h2>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar usuario..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-400">
                                <thead className="bg-slate-950 text-slate-300 uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Usuario</th>
                                        <th className="px-6 py-4 text-center">Rol</th>
                                        <th className="px-6 py-4 text-center">Stats</th>
                                        <th className="px-6 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.uid} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 font-bold border border-slate-700">
                                                        {(user.displayName || user.email)[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-200">{user.displayName || 'Sin Nombre'}</div>
                                                        <div className="text-xs text-slate-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${user.role === 'admin'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    }`}>
                                                    {user.role === 'admin' ? 'ADMIN' : 'USUARIO'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-slate-300"><b>{user.totalOrders}</b> Pedidos</span>
                                                    <span className="text-xs text-emerald-400 flex flex-col items-end">
                                                        <span><b>${user.totalRevenue.toFixed(0)}</b> Gen.</span>
                                                        <span className="text-[10px] opacity-70 font-mono text-emerald-500/70">{formatBs(user.totalRevenue)}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleResetPassword(user.email)}
                                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700"
                                                    title="Resetear Contraseña"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Lock size={14} />
                                                        <span className="text-xs">Reset Pass</span>
                                                    </div>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                                No se encontraron resultados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number | React.ReactNode, color: string }) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-500/10 text-blue-500',
        indigo: 'bg-indigo-500/10 text-indigo-500',
        emerald: 'bg-emerald-500/10 text-emerald-500',
        amber: 'bg-amber-500/10 text-amber-500'
    };

    return (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
                <div className="text-2xl font-bold text-slate-100">{value}</div>
            </div>
        </div>
    );
}

function ShieldCheckIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-8 h-8 ${className}`}
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
