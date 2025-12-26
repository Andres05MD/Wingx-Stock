"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash, Shirt } from 'lucide-react';
import { getGarments, deleteGarmentFromStorage, Garment } from '@/services/storage';
import Swal from 'sweetalert2';
import { useAuth } from "@/context/AuthContext";
import { useExchangeRate } from "@/context/ExchangeRateContext";
import BsBadge from "@/components/BsBadge";
import { useDebounce } from "@/hooks/useDebounce";
import { useGarments } from "@/context/GarmentsContext";

export default function PrendasPage() {
    const { formatBs } = useExchangeRate();

    // ✨ Usando contexto global - sin query redundante
    const { garments, loading, refreshGarments } = useGarments();

    const [searchTerm, setSearchTerm] = useState('');

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
                await deleteGarmentFromStorage(id);
                // ✨ Refrescar desde contexto global
                await refreshGarments();
                Swal.fire('Eliminado!', 'La prenda ha sido eliminada.', 'success');
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar.', 'error');
            }
        }
    }

    // Debounce para optimizar búsqueda
    const debouncedSearch = useDebounce(searchTerm, 300);

    // useMemo para evitar recalcular filtro en cada render
    const filteredGarments = useMemo(() =>
        garments.filter(g => g.name?.toLowerCase().includes(debouncedSearch.toLowerCase())),
        [garments, debouncedSearch]
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <Shirt className="text-blue-600" /> Gestión de Prendas
                    </h1>
                    <p className="text-slate-500 text-sm">Administra el catálogo de productos</p>
                </div>
                <Link
                    href="/prendas/nuevo"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                >
                    <Plus size={20} /> Nueva Prenda
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar prendas..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-none bg-slate-950 text-white placeholder-slate-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-none overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Cargando catálogo...</div>
                ) : filteredGarments.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        {searchTerm ? 'No se encontraron resultados.' : 'No hay prendas registradas.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-950 border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-400">Nombre</th>
                                    <th className="px-6 py-4 font-semibold text-slate-400">Precio</th>
                                    <th className="px-6 py-4 font-semibold text-slate-400 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredGarments.map((garment) => (
                                    <tr key={garment.id} className="hover:bg-slate-950 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-100">{garment.name}</td>
                                        <td className="px-6 py-4 text-slate-400">
                                            <div className="flex flex-col">
                                                <span>${garment.price}</span>
                                                <BsBadge amount={Number(garment.price)} className="w-fit mt-0.5" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            <Link href={`/prendas/${garment.id}/editar`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => garment.id && handleDelete(garment.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
