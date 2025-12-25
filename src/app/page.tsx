"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClipboardPlus,
  ShoppingCart,
  Shirt,
  Package,
  DollarSign,
  AlertCircle,
  Activity,
  Layers,
  ArrowRight,
  Send,
  Users,
  Calendar
} from 'lucide-react';
import { getGarments, getOrders, getMaterials, Order, Garment, Material } from '@/services/storage';
import { useAuth } from '@/context/AuthContext';
import AdminDashboard from '@/components/AdminDashboard';
import { useExchangeRate } from "@/context/ExchangeRateContext";

export default function Dashboard() {
  const { role } = useAuth();
  const { formatBs } = useExchangeRate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [garments, setGarments] = useState<Garment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersData, garmentsData, materialsData] = await Promise.all([getOrders(), getGarments(), getMaterials()]);
        setOrders(ordersData);
        setGarments(garmentsData);
        setMaterials(materialsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  const sendDailySummary = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const deliveriesToday = orders.filter(o => o.deliveryDate === todayStr);
    const appointmentsToday = orders.filter(o => o.appointmentDate === todayStr);

    const deliveriesTomorrow = orders.filter(o => o.deliveryDate === tomorrowStr);

    const pendingMaterials = materials.filter(m => !m.purchased);

    let message = `*RESUMEN DIARIO WINGX (${today.toLocaleDateString()})*\n\n`;

    // Entregas Hoy
    if (deliveriesToday.length > 0) {
      message += `*>>> HOY (Entregas):*\n`;
      deliveriesToday.forEach(o => message += `- ${o.clientName} (${o.garmentName})\n`);
    } else {
      message += `[OK] Sin entregas hoy.\n`;
    }

    // Citas Hoy
    if (appointmentsToday.length > 0) {
      message += `\n*@ HOY (Citas):*\n`;
      appointmentsToday.forEach(o => message += `- ${o.clientName} - ${o.garmentName}\n`);
    }

    // Entregas Mañana
    if (deliveriesTomorrow.length > 0) {
      message += `\n*!!! MAÑANA (Entregas):*\n`;
      deliveriesTomorrow.forEach(o => message += `- ${o.clientName} (${o.garmentName})\n`);
    }

    // Compras Pendientes
    if (pendingMaterials.length > 0) {
      message += `\n*($) COMPRAS PENDIENTES:*\n`;
      pendingMaterials.forEach(m => message += `- ${m.name}${m.quantity ? ` (${m.quantity})` : ''}\n`);
    } else {
      message += `\n[OK] Compras al día.\n`;
    }

    const pendingCount = orders.filter(o => o.status !== 'Finalizado' && o.status !== 'Entregado').length;
    message += `\n# PEDIDOS ACTIVOS: ${pendingCount}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Calculations
  const realIncome = orders.reduce((sum, o) => sum + (Number(o.paidAmount) || 0), 0);

  const pendingPayments = orders.reduce((sum, o) => {
    const balance = (Number(o.price) || 0) - (Number(o.paidAmount) || 0);
    return sum + (balance > 0 ? balance : 0);
  }, 0);

  const activeOrders = orders.filter(o => o.status !== 'Finalizado' && o.status !== 'Entregado').length;

  // Calculate Profit
  const estimatedProfit = orders.reduce((sum, order) => {
    const revenue = Number(order.price) || 0;
    let cost = 0;
    if (order.garmentId) {
      const garment = garments.find(g => g.id === order.garmentId);
      if (garment) {
        const labor = Number(garment.laborCost) || 0;
        const transport = Number(garment.transportCost) || 0;
        const materials = garment.materials?.reduce((mSum, m) => mSum + (Number(m.cost) || 0), 0) || 0;
        cost = labor + transport + materials;
      }
    }
    return sum + (revenue - cost);
  }, 0);

  // Recent Orders logic
  const recentOrders = [...orders]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 10);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Finalizado': return 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50';
      case 'En Proceso': return 'bg-blue-900/40 text-blue-300 border border-blue-700/50';
      case 'Pendiente': return 'bg-amber-900/40 text-amber-300 border border-amber-700/50';
      default: return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header code ... */}

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link href="/pedidos" className="group p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-none hover:shadow-none hover:border-blue-100 transition-all flex flex-col items-center justify-center gap-3 text-center">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <ClipboardPlus size={24} />
            </div>
            <span className="font-semibold text-slate-300 text-sm">Nuevo Pedido</span>
          </Link>
          <Link href="/materiales" className="group p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-none hover:shadow-none hover:border-emerald-100 transition-all flex flex-col items-center justify-center gap-3 text-center">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <ShoppingCart size={24} />
            </div>
            <span className="font-semibold text-slate-300 text-sm">Agregar Material</span>
          </Link>
          <Link href="/prendas" className="group p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-none hover:shadow-none hover:border-purple-100 transition-all flex flex-col items-center justify-center gap-3 text-center">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
              <Shirt size={24} />
            </div>
            <span className="font-semibold text-slate-300 text-sm">Nueva Prenda</span>
          </Link>
          <Link href="/agenda" className="group p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-none hover:shadow-none hover:border-pink-100 transition-all flex flex-col items-center justify-center gap-3 text-center">
            <div className="p-3 bg-pink-50 text-pink-600 rounded-xl group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
            <span className="font-semibold text-slate-300 text-sm">Ver Agenda</span>
          </Link>
          <Link href="/clientes" className="group p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-none hover:shadow-none hover:border-cyan-100 transition-all flex flex-col items-center justify-center gap-3 text-center">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <span className="font-semibold text-slate-300 text-sm">Ver Clientes</span>
          </Link>
          <Link href="/inventario" className="group p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-none hover:shadow-none hover:border-orange-100 transition-all flex flex-col items-center justify-center gap-3 text-center">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
              <Package size={24} />
            </div>
            <span className="font-semibold text-slate-300 text-sm">Ver Stock</span>
          </Link>
        </div>
      </section>

      {/* Stats Grid */}
      <section>
        <h2 className="text-lg font-bold text-slate-100 mb-4">Resumen Financiero</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Income */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-none flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingresos Reales</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">
                ${loading ? '...' : realIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-emerald-500 font-mono opacity-80">
                {formatBs(realIncome)}
              </p>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-none flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg shadow-red-500/20">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Por Cobrar</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">
                ${loading ? '...' : pendingPayments.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-red-500 font-mono opacity-80">
                {formatBs(pendingPayments)}
              </p>
            </div>
          </div>

          {/* Active Orders */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-none flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/20">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pedidos Activos</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">
                {loading ? '...' : activeOrders}
              </p>
            </div>
          </div>

          {/* Estimated Profit */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-none flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ganancia (Est.)</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">
                ${loading ? '...' : estimatedProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-indigo-500 font-mono opacity-80">
                {formatBs(estimatedProfit)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Orders List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100">Pedidos Recientes</h2>
          <Link href="/pedidos" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-none overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Cargando pedidos...</div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No hay pedidos registrados aún.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {recentOrders.map((order) => {
                const balance = (order.price || 0) - (order.paidAmount || 0);
                return (
                  <div key={order.id} className="p-4 hover:bg-slate-950 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between md:justify-start gap-2 mb-1">
                        <h3 className="font-bold text-slate-100">{order.clientName}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {order.garmentName} <span className="text-slate-300 mx-1">|</span> Talla: {order.size}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <p className="text-slate-400 text-xs uppercase font-bold">Total</p>
                        <p className="font-semibold text-slate-300">${(order.price || 0).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-xs uppercase font-bold">Saldo</p>
                        <p className={`font-bold ${balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          ${balance > 0 ? balance.toFixed(2) : '0.00'}
                        </p>
                        {balance > 0 && <p className="text-[10px] text-red-400 font-mono">{formatBs(balance)}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 pb-4 text-center text-slate-400 text-sm">
        <p>CEO: Valeria Petaccia</p>
      </footer>
    </div>
  );
}
