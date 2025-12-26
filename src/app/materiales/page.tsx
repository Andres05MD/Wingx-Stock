"use client";

import { useEffect, useState } from 'react';
import { Plus, Search, Trash, ShoppingCart, Check, X, DollarSign, Clock, Save } from 'lucide-react';
import { getMaterials, saveMaterial, updateMaterial, deleteMaterial, Material } from '@/services/storage';
import Swal from 'sweetalert2';
import { useExchangeRate } from "@/context/ExchangeRateContext";
import { useAuth } from "@/context/AuthContext";
import BsBadge from "@/components/BsBadge";

export default function MaterialesPage() {
    const { formatBs } = useExchangeRate();
    const { role, user, loading: authLoading } = useAuth();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);

    // New Material Form State
    const [formData, setFormData] = useState<Partial<Material>>({
        name: '',
        quantity: '',
        price: 0,
        notes: '',
        purchased: false,
        source: 'Compras Extras'
    });

    useEffect(() => {
        if (!authLoading && user) {
            loadMaterials();
        }
    }, [authLoading, user]);

    async function loadMaterials() {
        if (!user?.uid) return;
        setLoading(true);
        const data = await getMaterials(role || undefined, user.uid);
        // Sort: Pending first, then by date desc
        data.sort((a, b) => {
            if (a.purchased === b.purchased) {
                return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime());
            }
            return a.purchased ? 1 : -1;
        });
        setMaterials(data);
        setLoading(false);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? (value === '' ? 0 : parseFloat(value)) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await saveMaterial(formData as Material);
            setFormData({ name: '', quantity: '', price: 0, notes: '', purchased: false });
            setShowForm(false);
            loadMaterials();
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Material agregado',
                showConfirmButton: false,
                timer: 1500,
                toast: true
            });
        } catch (error) {
            Swal.fire('Error', 'No se pudo guardar', 'error');
        }
    };

    async function handleDelete(id: string) {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminará de la lista",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await deleteMaterial(id);
                setMaterials(materials.filter(m => m.id !== id));
                Swal.fire('Eliminado!', 'El material ha sido eliminado.', 'success');
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar.', 'error');
            }
        }
    }

    async function handleDeletePurchased() {
        const result = await Swal.fire({
            title: '¿Eliminar todos los comprados?',
            text: `Se eliminarán ${purchasedCount} materiales de la lista.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar todos'
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const toDelete = materials.filter(m => m.purchased);
                await Promise.all(toDelete.map(m => m.id ? deleteMaterial(m.id) : Promise.resolve()));

                // Refresh list locally
                setMaterials(materials.filter(m => !m.purchased));

                Swal.fire('Eliminados!', 'La lista se ha limpiado.', 'success');
            } catch (error) {
                Swal.fire('Error', 'No se pudieron eliminar algunos elementos.', 'error');
            } finally {
                setLoading(false);
            }
        }
    }

    async function togglePurchased(material: Material) {
        if (!material.id) return;
        try {
            const newStatus = !material.purchased;
            await updateMaterial(material.id, { purchased: newStatus });
            const updatedMaterials = materials.map(m => m.id === material.id ? { ...m, purchased: newStatus } : m);
            // Re-sort
            updatedMaterials.sort((a, b) => {
                if (a.purchased === b.purchased) {
                    return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime());
                }
                return a.purchased ? 1 : -1;
            });
            setMaterials(updatedMaterials);
        } catch (e) {
            console.error(e);
        }
    }

    const filteredMaterials = materials.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalCost = materials.filter(m => !m.purchased).reduce((sum, m) => sum + (m.price || 0), 0);
    const pendingCount = materials.filter(m => !m.purchased).length;
    const purchasedCount = materials.filter(m => m.purchased).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <ShoppingCart className="text-blue-600" /> Lista de Materiales
                    </h1>
                    <p className="text-slate-500 text-sm">Gestiona tus compras y suministros</p>
                </div>
                <div className="flex gap-2">
                    {purchasedCount > 0 && (
                        <button
                            onClick={handleDeletePurchased}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
                        >
                            <Trash size={20} />
                            Eliminar Listos
                        </button>
                    )}
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                    >
                        {showForm ? <X size={20} /> : <Plus size={20} />}
                        {showForm ? 'Cancelar' : 'Agregar Material'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-none flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Costo Estimado</p>
                        <p className="text-xl font-bold text-slate-100">${totalCost.toFixed(2)}</p>
                        <BsBadge amount={totalCost} className="mt-1 w-fit border-blue-500/20 bg-blue-500/10 text-blue-400" prefix="En Bs:" />
                    </div>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-none flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Pendientes</p>
                        <p className="text-xl font-bold text-slate-100">{pendingCount}</p>
                    </div>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-none flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Check size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Comprados</p>
                        <p className="text-xl font-bold text-slate-100">{purchasedCount}</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/20 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-white">Nuevo Material</h2>
                            <p className="text-sm text-slate-400 mt-0.5">Agrega un material a tu lista de compras</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                    Nombre del Material
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="Ej. Tela de Seda, Botones, Cierre..."
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-4 rounded-xl bg-black/30 border border-white/10 focus:border-blue-500/50 focus:bg-black/40 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-white placeholder-slate-500 text-lg font-medium"
                                />
                            </div>

                            {/* Quantity */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                    Cantidad
                                </label>
                                <input
                                    type="text"
                                    name="quantity"
                                    placeholder="Ej. 2 metros, 10 unidades..."
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-4 rounded-xl bg-black/30 border border-white/10 focus:border-cyan-500/50 focus:bg-black/40 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all text-white placeholder-slate-500 text-lg"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Price */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                    <DollarSign className="w-4 h-4 text-emerald-400" />
                                    Precio Estimado
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">$</span>
                                    <input
                                        type="number"
                                        name="price"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.price === 0 ? '' : formData.price}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-28 py-4 rounded-xl bg-black/30 border border-white/10 focus:border-emerald-500/50 focus:bg-black/40 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-white font-mono text-lg"
                                    />
                                    {(formData.price ?? 0) > 0 && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <BsBadge amount={Number(formData.price)} className="text-xs" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                    Notas / Tienda
                                </label>
                                <input
                                    type="text"
                                    name="notes"
                                    placeholder="Ej. Comprar en Parisina, Color azul..."
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-4 rounded-xl bg-black/30 border border-white/10 focus:border-purple-500/50 focus:bg-black/40 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-white placeholder-slate-500 text-lg"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-semibold transition-all text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="group px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center gap-2 text-sm"
                            >
                                <Save className="w-4 h-4" />
                                Guardar Material
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar material..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-none bg-slate-950 text-white placeholder-slate-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Cargando materiales...</div>
                ) : filteredMaterials.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        {searchTerm ? 'No se encontraron resultados.' : 'No hay materiales en la lista.'}
                    </div>
                ) : (
                    // Grouping Logic
                    Object.entries(
                        filteredMaterials.reduce((groups, material) => {
                            const source = material.source || 'Sin Especificar';
                            if (!groups[source]) {
                                groups[source] = [];
                            }
                            groups[source].push(material);
                            return groups;
                        }, {} as Record<string, Material[]>)
                    ).map(([source, groupMaterials]) => (
                        <div key={source} className="space-y-3">
                            <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wider pl-1 border-l-4 border-blue-600">
                                {source}
                            </h3>
                            <div className="space-y-3">
                                {groupMaterials.map((material) => (
                                    <div key={material.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${material.purchased ? 'bg-slate-950 border-slate-800 opacity-60' : 'bg-slate-900 border-slate-800 shadow-none hover:shadow-none'}`}>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => togglePurchased(material)}
                                                className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${material.purchased ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600 hover:border-emerald-500'}`}
                                            >
                                                {material.purchased && <Check size={14} />}
                                            </button>
                                            <div>
                                                <h3 className={`font-bold text-slate-100 ${material.purchased ? 'line-through text-slate-500' : ''}`}>{material.name}</h3>
                                                <p className="text-sm text-slate-500">
                                                    {material.quantity && <span className="mr-2 border-r border-slate-600 pr-2">{material.quantity}</span>}
                                                    {(material.price ?? 0) > 0 && (
                                                        <span className="flex items-center gap-2">
                                                            ${material.price!.toFixed(2)}
                                                            <BsBadge amount={material.price!} />
                                                        </span>
                                                    )}
                                                </p>
                                                {material.notes && <p className="text-xs text-slate-400 mt-1 italic">{material.notes}</p>}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => material.id && handleDelete(material.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                                        >
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
