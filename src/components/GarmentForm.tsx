"use client";

import { useState, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { Garment, GarmentMaterial, saveGarment, updateGarment, getGarmentById } from "@/services/storage";
import Swal from "sweetalert2";
import { Plus, Trash, ArrowLeft, Save, Sparkles, DollarSign, Package, Scissors, Truck, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useExchangeRate } from "@/context/ExchangeRateContext";
import BsBadge from "./BsBadge";

interface GarmentFormProps {
    id?: string;
}

const GarmentForm = memo(function GarmentForm({ id }: GarmentFormProps) {
    const router = useRouter();
    const { formatBs } = useExchangeRate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Garment>>({
        name: "",
        price: 0,
        laborCost: 0,
        transportCost: 0,
        materials: []
    });

    const [newMaterial, setNewMaterial] = useState<GarmentMaterial>({
        name: "",
        quantity: "",
        cost: 0
    });

    useEffect(() => {
        if (id) {
            loadGarment();
        }
    }, [id]);

    const loadGarment = async () => {
        setLoading(true);
        try {
            const garment = await getGarmentById(id!);
            if (garment) {
                setFormData(garment);
            }
        } catch (error) {
            console.error("Error loading garment:", error);
            Swal.fire("Error", "No se pudo cargar la prenda", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "name" ? value : (value === '' ? 0 : parseFloat(value) || 0)
        }));
    };

    const addMaterial = () => {
        if (!newMaterial.name.trim()) {
            Swal.fire("Atención", "El nombre del material es requerido", "warning");
            return;
        }

        setFormData(prev => ({
            ...prev,
            materials: [...(prev.materials || []), { ...newMaterial }]
        }));

        setNewMaterial({ name: "", quantity: "", cost: 0 });
    };

    const removeMaterial = (index: number) => {
        setFormData(prev => ({
            ...prev,
            materials: prev.materials?.filter((_, i) => i !== index) || []
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name?.trim()) {
            Swal.fire("Error", "El nombre de la prenda es requerido", "error");
            return;
        }

        setLoading(true);
        try {
            if (id) {
                await updateGarment(id, formData as Garment);
                Swal.fire("¡Éxito!", "Prenda actualizada correctamente", "success");
            } else {
                await saveGarment(formData as Omit<Garment, "id">);
                Swal.fire("¡Éxito!", "Prenda creada correctamente", "success");
            }
            router.push("/prendas");
        } catch (error) {
            console.error("Error saving garment:", error);
            Swal.fire("Error", "No se pudo guardar la prenda", "error");
        } finally {
            setLoading(false);
        }
    };

    const totalMaterialsCost = formData.materials?.reduce((sum, m) => sum + (m.cost || 0), 0) || 0;
    const totalCost = totalMaterialsCost + (formData.laborCost || 0) + (formData.transportCost || 0);
    const estimatedProfit = (formData.price || 0) - totalCost;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/prendas"
                            className="group flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-white flex items-center gap-3">
                                <Sparkles className="w-8 h-8 text-purple-400" />
                                {id ? "Editar Prenda" : "Nueva Prenda"}
                            </h1>
                            <p className="text-slate-400 mt-1">Define los detalles y costos de la prenda</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Info Card */}
                    <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/20">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Información Básica</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Garment Name */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                    Nombre de la Prenda
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ej. Vestido de Fiesta, Camisa Casual..."
                                    className="w-full px-4 py-4 rounded-xl bg-black/30 border border-white/10 focus:border-purple-500/50 focus:bg-black/40 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-white placeholder-slate-500 text-lg font-medium"
                                />
                            </div>

                            {/* Sale Price */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                    <DollarSign className="w-4 h-4 text-emerald-400" />
                                    Precio de Venta
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">$</span>
                                    <input
                                        type="number"
                                        name="price"
                                        step="0.01"
                                        required
                                        value={formData.price === 0 ? '' : formData.price}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-28 py-4 rounded-xl bg-black/30 border border-white/10 focus:border-emerald-500/50 focus:bg-black/40 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-white font-mono text-lg"
                                    />
                                    {(formData.price ?? 0) > 0 && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <BsBadge amount={Number(formData.price)} className="text-xs" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Labor Cost */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                    <Scissors className="w-4 h-4 text-amber-400" />
                                    Mano de Obra
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">$</span>
                                    <input
                                        type="number"
                                        name="laborCost"
                                        step="0.01"
                                        value={formData.laborCost === 0 ? '' : formData.laborCost}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-28 py-4 rounded-xl bg-black/30 border border-white/10 focus:border-amber-500/50 focus:bg-black/40 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-white font-mono text-lg"
                                    />
                                    {(formData.laborCost ?? 0) > 0 && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <BsBadge amount={Number(formData.laborCost)} className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Transport Cost */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                    <Truck className="w-4 h-4 text-blue-400" />
                                    Transporte
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">$</span>
                                    <input
                                        type="number"
                                        name="transportCost"
                                        step="0.01"
                                        value={formData.transportCost === 0 ? '' : formData.transportCost}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-28 py-4 rounded-xl bg-black/30 border border-white/10 focus:border-blue-500/50 focus:bg-black/40 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-white font-mono text-lg"
                                    />
                                    {(formData.transportCost ?? 0) > 0 && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <BsBadge amount={Number(formData.transportCost)} className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Materials Card */}
                    <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/20">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-white">Materiales Requeridos</h2>
                                <p className="text-sm text-slate-400 mt-0.5">Agrega los materiales necesarios para esta prenda</p>
                            </div>
                            {formData.materials && formData.materials.length > 0 && (
                                <div className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                    <p className="text-sm font-mono font-bold text-cyan-400">
                                        Total: ${totalMaterialsCost.toFixed(2)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Add Material Form */}
                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-2xl p-6 border border-white/10 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                {/* Material Name */}
                                <div className="md:col-span-5 space-y-2">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Material
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Tela, Botones, Hilo..."
                                        value={newMaterial.name}
                                        onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-cyan-500/50 focus:bg-black/40 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all text-white placeholder-slate-500 font-medium"
                                    />
                                </div>

                                {/* Quantity */}
                                <div className="md:col-span-3 space-y-2">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Cantidad
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="2m, 10 unid..."
                                        value={newMaterial.quantity}
                                        onChange={(e) => setNewMaterial(prev => ({ ...prev, quantity: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-blue-500/50 focus:bg-black/40 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-white placeholder-slate-500"
                                    />
                                </div>

                                {/* Cost */}
                                <div className="md:col-span-3 space-y-2">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Costo ($)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={newMaterial.cost === 0 ? '' : newMaterial.cost}
                                            onChange={(e) => setNewMaterial(prev => ({ ...prev, cost: e.target.value === '' ? 0 : parseFloat(e.target.value) }))}
                                            className="w-full pl-7 pr-24 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-emerald-500/50 focus:bg-black/40 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-white placeholder-slate-500 font-mono"
                                        />
                                        {newMaterial.cost > 0 && (
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                <BsBadge amount={Number(newMaterial.cost)} className="text-[10px]" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Add Button */}
                                <div className="md:col-span-1 flex items-end">
                                    <button
                                        type="button"
                                        onClick={addMaterial}
                                        className="w-full h-[44px] flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Materials List */}
                        {formData.materials && formData.materials.length > 0 ? (
                            <div className="space-y-3">
                                {formData.materials.map((material, index) => (
                                    <div
                                        key={index}
                                        className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/5 hover:border-cyan-500/30 hover:bg-white/10 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"></div>
                                            <div>
                                                <p className="font-semibold text-white">{material.name}</p>
                                                {material.quantity && (
                                                    <p className="text-sm text-slate-400">{material.quantity}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-mono font-bold text-cyan-400">${material.cost.toFixed(2)}</p>
                                                {material.cost > 0 && (
                                                    <BsBadge amount={material.cost} className="text-[9px] mt-1" />
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeMaterial(index)}
                                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Package className="w-16 h-16 mx-auto text-slate-700 mb-4" />
                                <p className="text-slate-500 font-medium">No hay materiales agregados</p>
                                <p className="text-slate-600 text-sm mt-1">Usa el formulario arriba para agregar materiales</p>
                            </div>
                        )}
                    </div>

                    {/* Cost Summary Card */}
                    <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/20">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-white">Resumen de Costos</h2>
                                <p className="text-sm text-slate-400 mt-0.5">Desglose completo y ganancia estimada</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-2xl border border-white/10 p-6 space-y-4">
                            {/* Precio de Venta */}
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <span className="text-slate-400 font-medium">Precio de Venta</span>
                                <span className="text-white font-mono font-bold text-lg">${(formData.price || 0).toFixed(2)}</span>
                            </div>

                            {/* Costos */}
                            <div className="space-y-2">
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Costos:</p>

                                {/* Materiales */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">• Materiales ({formData.materials?.length || 0})</span>
                                    <span className="text-cyan-400 font-mono">-${totalMaterialsCost.toFixed(2)}</span>
                                </div>

                                {/* Mano de Obra */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">• Mano de Obra</span>
                                    <span className="text-amber-400 font-mono">-${(formData.laborCost || 0).toFixed(2)}</span>
                                </div>

                                {/* Transporte */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">• Transporte</span>
                                    <span className="text-blue-400 font-mono">-${(formData.transportCost || 0).toFixed(2)}</span>
                                </div>

                                {/* Total Costos */}
                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <span className="text-slate-300 font-semibold">Total Costos</span>
                                    <span className="text-red-400 font-mono font-bold">-${totalCost.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Ganancia Final */}
                            <div className={`flex items-center justify-between p-4 rounded-xl border-2 mt-4 ${estimatedProfit > 0
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : 'bg-red-500/10 border-red-500/30'
                                }`}>
                                <span className="text-white font-bold text-lg">Ganancia Estimada</span>
                                <div className="text-right">
                                    <p className={`text-2xl font-bold font-mono ${estimatedProfit > 0 ? 'text-emerald-400' : 'text-red-400'
                                        }`}>
                                        ${estimatedProfit.toFixed(2)}
                                    </p>
                                    {estimatedProfit > 0 && (
                                        <BsBadge amount={estimatedProfit} className="text-xs mt-1" />
                                    )}
                                </div>
                            </div>

                            {/* Margen de Ganancia */}
                            {(formData.price || 0) > 0 && (
                                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                    <span className="text-slate-400 text-sm">Margen de Ganancia</span>
                                    <span className={`font-mono font-bold ${estimatedProfit > 0 ? 'text-emerald-400' : 'text-red-400'
                                        }`}>
                                        {((estimatedProfit / (formData.price || 1)) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-4 pt-4">
                        <Link
                            href="/prendas"
                            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-semibold transition-all duration-300"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:shadow-none flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? "Guardando..." : id ? "Actualizar Prenda" : "Crear Prenda"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

GarmentForm.displayName = 'GarmentForm';

export default GarmentForm;
