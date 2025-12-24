"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash, ClipboardList, Filter } from 'lucide-react';
import { getOrders, deleteOrder, Order, updateOrder } from '@/services/storage';
import Swal from 'sweetalert2';

export default function PedidosPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        setLoading(true);
        const data = await getOrders();
        // Sort by date desc
        data.sort((a, b) => (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime()));
        setOrders(data);
        setLoading(false);
    }

    async function handleDelete(id: string) {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await deleteOrder(id);
                const newOrders = orders.filter(o => o.id !== id);
                setOrders(newOrders);
                Swal.fire('Eliminado!', 'El pedido ha sido eliminado.', 'success');
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar.', 'error');
            }
        }
    }

    async function handleStatusChange(id: string, newStatus: string) {
        try {
            await updateOrder(id, { status: newStatus });
            const updatedOrders = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
            setOrders(updatedOrders);
            const toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            toast.fire({
                icon: 'success',
                title: 'Estado actualizado'
            });
        } catch (e) {
            console.error(e);
        }
    }

    async function handlePayRemaining(order: Order) {
        if (!order.id) return;
        const balance = order.price - order.paidAmount;

        const result = await Swal.fire({
            title: 'Registrar Pago',
            text: `Saldo pendiente: $${balance.toFixed(2)}`,
            input: 'number',
            inputLabel: 'Monto a pagar',
            inputValue: balance,
            inputAttributes: {
                min: '0.01',
                max: balance.toString(),
                step: '0.01'
            },
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Registrar',
            cancelButtonText: 'Cancelar',
            preConfirm: (value) => {
                const amount = parseFloat(value);
                if (amount <= 0) {
                    Swal.showValidationMessage('El monto debe ser mayor a 0');
                    return false;
                }
                if (amount > balance) {
                    Swal.showValidationMessage(`El monto no puede exceder el saldo ($${balance.toFixed(2)})`);
                    return false;
                }
                return amount;
            }
        });

        if (result.isConfirmed && result.value) {
            const paymentAmount = parseFloat(result.value);
            const newPaidAmount = (order.paidAmount || 0) + paymentAmount;

            try {
                await updateOrder(order.id, { paidAmount: newPaidAmount });
                const updatedOrders = orders.map(o => o.id === order.id ? { ...o, paidAmount: newPaidAmount } : o);
                setOrders(updatedOrders);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Pago de $${paymentAmount.toFixed(2)} registrado`,
                    showConfirmButton: false,
                    timer: 2000
                });
            } catch (e) {
                Swal.fire('Error', 'No se pudo actualizar el pago', 'error');
            }
        }
    }

    const filteredOrders = orders.filter(o => {
        const matchSearch = o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.garmentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter = filterStatus === 'All' || o.status === filterStatus;
        return matchSearch && matchFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Sin Comenzar': return 'bg-slate-900 border-l-4 border-slate-600';
            case 'Pendiente': return 'bg-yellow-950/30 border-l-4 border-yellow-600/50';
            case 'En Proceso': return 'bg-emerald-950/30 border-l-4 border-emerald-600/50'; // User said green for process
            case 'Entregado': return 'bg-red-950/30 border-l-4 border-red-600/50'; // User said red for delivered
            case 'Finalizado': return 'bg-blue-950/30 border-l-4 border-blue-600/50'; // Backup
            default: return 'bg-slate-900 border-l-4 border-slate-700';
        }
    };

    const getBadgeColor = (status: string) => {
        switch (status) {
            case 'Sin Comenzar': return 'bg-slate-800 text-slate-300 border border-slate-700';
            case 'Pendiente': return 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/50';
            case 'En Proceso': return 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50';
            case 'Entregado': return 'bg-red-900/40 text-red-300 border border-red-700/50';
            case 'Finalizado': return 'bg-blue-900/40 text-blue-300 border border-blue-700/50';
            default: return 'bg-slate-800 text-slate-400 border border-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <ClipboardList className="text-blue-600" /> Gestión de Pedidos
                    </h1>
                    <p className="text-slate-500 text-sm">Controla el flujo de trabajo</p>
                </div>
                <Link
                    href="/pedidos/nuevo"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                >
                    <Plus size={20} /> Nuevo Pedido
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o prenda..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-none bg-slate-950 text-white placeholder-slate-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative w-full md:w-48">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-none bg-slate-950 appearance-none cursor-pointer text-white placeholder-slate-500"
                    >
                        <option value="All">Todos</option>
                        <option value="Sin Comenzar">Sin Comenzar</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Finalizado">Finalizado</option>
                    </select>
                </div>
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full p-8 text-center text-slate-400">Cargando pedidos...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-slate-400">
                        {searchTerm || filterStatus !== 'All' ? 'No se encontraron resultados.' : 'No hay pedidos activos.'}
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const balance = (order.price || 0) - (order.paidAmount || 0);

                        return (
                            <div key={order.id} className={`bg-slate-900 p-5 rounded-xl shadow-none hover:shadow-none transition-all ${getStatusColor(order.status)}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-slate-100 text-lg">{order.clientName}</h3>
                                    <div className="flex gap-1">
                                        <Link href={`/pedidos/${order.id}/editar`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-900/50 rounded transition-colors">
                                            <Edit size={16} />
                                        </Link>
                                        <button
                                            onClick={() => order.id && handleDelete(order.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-900/50 rounded transition-colors"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-300">{order.garmentName}</p>
                                        <p className="text-xs text-slate-500">Talla: {order.size}</p>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="text-sm">
                                            <p className="text-slate-500">Total: <span className="font-semibold text-slate-300">${order.price.toFixed(2)}</span></p>
                                            <p className="text-slate-500">Abonado: <span className="font-semibold text-slate-300">${order.paidAmount.toFixed(2)}</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs uppercase font-bold text-slate-400 mb-1">Saldo</p>
                                            <div className="flex flex-col items-end gap-1">
                                                <p className={`font-bold ${balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {balance > 0 ? `$${balance.toFixed(2)}` : 'Pagado'}
                                                </p>
                                                {balance > 0 && (
                                                    <button
                                                        onClick={() => order.id && handlePayRemaining(order)}
                                                        className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded transition-colors"
                                                    >
                                                        Registrar Pago
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-800/50">
                                    <select
                                        value={order.status}
                                        onChange={(e) => order.id && handleStatusChange(order.id, e.target.value)}
                                        className={`w-full py-1.5 px-3 rounded-lg text-sm font-medium outline-none cursor-pointer transition-colors ${getBadgeColor(order.status)}`}
                                    >
                                        <option value="Sin Comenzar">Sin Comenzar</option>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="En Proceso">En Proceso</option>
                                        <option value="Entregado">Entregado</option>
                                        <option value="Finalizado">Finalizado</option>
                                    </select>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
