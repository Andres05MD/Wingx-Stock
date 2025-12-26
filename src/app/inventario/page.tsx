"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash, Package, Shirt } from 'lucide-react';
import { getStockItems, deleteStockItem, StockItem, updateStockItem } from '@/services/storage';
import Swal from 'sweetalert2';
import { useAuth } from "@/context/AuthContext";

export default function InventarioPage() {
    const { role, user, loading: authLoading } = useAuth();
    const [items, setItems] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!authLoading && user) {
            loadStock();
        }
    }, [authLoading, user]);

    async function loadStock() {
        if (!user?.uid) return;
        setLoading(true);
        const data = await getStockItems(role || undefined, user.uid);
        setItems(data);
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
                await deleteStockItem(id);
                setItems(items.filter(i => i.id !== id));
                Swal.fire('Eliminado!', 'Item eliminado del inventario.', 'success');
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar.', 'error');
            }
        }
    }

    async function handleQuantityUpdate(id: string, currentQty: number, change: number) {
        const newQty = currentQty + change;
        if (newQty < 0) return;

        try {
            await updateStockItem(id, { quantity: newQty });
            setItems(items.map(i => i.id === id ? { ...i, quantity: newQty } : i));
        } catch (e) {
            console.error(e);
        }
    }

    const filteredItems = items.filter(i =>
        (i.garmentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.color || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <Package className="text-blue-600" /> Control de Inventario
                    </h1>
                    <p className="text-slate-500 text-sm">Prendas listas para entrega inmediata</p>
                </div>
                <Link
                    href="/inventario/nuevo"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                >
                    <Plus size={20} /> Agregar Stock
                </Link>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre o color..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-none bg-slate-950 text-white placeholder-slate-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full p-8 text-center text-slate-400">Cargando inventario...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-slate-400">
                        {searchTerm ? 'No se encontraron resultados.' : 'No hay items en stock.'}
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <div key={item.id} className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-none hover:shadow-none transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Shirt size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-100">{item.garmentName || 'Prenda sin nombre'}</h3>
                                        <p className="text-xs text-slate-500">Talla: <span className="font-semibold text-slate-300">{item.size}</span></p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => item.id && handleDelete(item.id)}
                                    className="p-1.5 text-slate-300 hover:text-red-500 rounded transition-colors"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {item.color && (
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <span className="w-3 h-3 rounded-full bg-slate-700 border border-slate-600" style={{ backgroundColor: item.color.toLowerCase() }}></span>
                                        <span>Color: {item.color}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                                    <span className="text-sm font-medium text-slate-500">Cantidad</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => item.id && handleQuantityUpdate(item.id, item.quantity, -1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                                        >
                                            -
                                        </button>
                                        <span className="font-bold text-lg w-6 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => item.id && handleQuantityUpdate(item.id, item.quantity, 1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
