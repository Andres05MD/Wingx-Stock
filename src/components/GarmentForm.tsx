"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Garment, GarmentMaterial, saveGarment, updateGarment, getGarmentById } from "@/services/storage";
import Swal from "sweetalert2";
import { Plus, Trash, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface GarmentFormProps {
    id?: string;
}

export default function GarmentForm({ id }: GarmentFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Garment>>({
        name: "",
        size: "M",
        price: 0,
        laborCost: 0,
        transportCost: 0,
        materials: []
    });

    const [newMaterial, setNewMaterial] = useState<GarmentMaterial>({ name: "", cost: 0, quantity: "" });

    useEffect(() => {
        if (id) {
            loadGarment(id);
        }
    }, [id]);

    async function loadGarment(garmentId: string) {
        setLoading(true);
        const garment = await getGarmentById(garmentId);
        if (garment) {
            setFormData(garment);
        } else {
            Swal.fire("Error", "No se encontró la prenda", "error");
            router.push("/prendas");
        }
        setLoading(false);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? parseFloat(value) : value
        }));
    };

    const addMaterial = () => {
        if (!newMaterial.name || newMaterial.cost <= 0 || !newMaterial.quantity) {
            Swal.fire("Atención", "Ingresa nombre, cantidad y costo válido", "warning");
            return;
        }

        setFormData(prev => ({
            ...prev,
            materials: [...(prev.materials || []), newMaterial]
        }));
        setNewMaterial({ name: "", cost: 0, quantity: "" });
    };

    const removeMaterial = (index: number) => {
        setFormData(prev => ({
            ...prev,
            materials: prev.materials?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (id) {
                await updateGarment(id, formData);
                Swal.fire("Éxito", "Prenda actualizada correctamente", "success");
            } else {
                await saveGarment(formData as Garment);
                Swal.fire("Éxito", "Prenda creada correctamente", "success");
            }
            router.push("/prendas");
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Ocurrió un error al guardar", "error");
        } finally {
            setLoading(false);
        }
    };

    if (loading && id) return <div className="p-8 text-center text-slate-500">Cargando datos...</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">
                        {id ? "Editar Prenda" : "Nueva Prenda"}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {id ? "Modifica los detalles de la prenda" : "Agrega una nueva prenda al catálogo"}
                    </p>
                </div>
                <Link href="/prendas" className="flex items-center text-slate-500 hover:text-slate-100 transition-colors">
                    <ArrowLeft size={20} className="mr-1" /> Volver
                </Link>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-none space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Nombre de la Prenda</label>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="Ej. Camisa de Lino"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Talla</label>
                        <select
                            name="size"
                            value={formData.size}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-500"
                        >
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Costs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Precio Venta ($)</label>
                        <input
                            type="number"
                            name="price"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Mano de Obra ($)</label>
                        <input
                            type="number"
                            name="laborCost"
                            step="0.01"
                            value={formData.laborCost}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Pasaje/Transporte ($)</label>
                        <input
                            type="number"
                            name="transportCost"
                            step="0.01"
                            value={formData.transportCost}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-500"
                        />
                    </div>
                </div>

                {/* Materials Section */}
                <div className="pt-6 border-t border-slate-800">
                    <label className="text-sm font-semibold text-slate-300 mb-4 block">Materiales Requeridos</label>

                    {/* Add Material Row */}
                    {/* Add Material Row */}
                    <div className="grid grid-cols-1 md:flex md:items-end gap-2 mb-4">
                        <div className="w-full md:flex-1 space-y-1">
                            <label className="text-xs text-slate-400">Nombre Material</label>
                            <input
                                type="text"
                                placeholder="Ej. Tela, Botones"
                                value={newMaterial.name}
                                onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                            />
                        </div>
                        <div className="w-full md:w-24 space-y-1">
                            <label className="text-xs text-slate-400">Cant.</label>
                            <input
                                type="text"
                                placeholder="Ej. 1m"
                                value={newMaterial.quantity}
                                onChange={(e) => setNewMaterial(prev => ({ ...prev, quantity: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                            />
                        </div>
                        <div className="w-full md:w-32 space-y-1">
                            <label className="text-xs text-slate-400">Costo ($)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={newMaterial.cost || ''}
                                onChange={(e) => setNewMaterial(prev => ({ ...prev, cost: parseFloat(e.target.value) }))}
                                className="w-full px-3 py-2 rounded-lg border border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={addMaterial}
                            className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-slate-400 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 h-[38px] mt-2 md:mt-0"
                        >
                            <Plus size={18} /> Agregar
                        </button>
                    </div>

                    {/* Materials List */}
                    {formData.materials && formData.materials.length > 0 ? (
                        <div className="bg-slate-950 rounded-xl p-4 space-y-2">
                            {formData.materials.map((material, index) => (
                                <div key={index} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800 shadow-none">
                                    <span className="font-medium text-slate-300 capitalize">
                                        {material.name} {material.quantity && <span className="text-slate-500 text-sm ml-2">({material.quantity})</span>}
                                    </span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-slate-400 font-mono">${material.cost.toFixed(2)}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeMaterial(index)}
                                            className="text-red-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic text-center py-2">No hay materiales agregados</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={20} />
                    {loading ? "Guardando..." : "Guardar Prenda"}
                </button>
            </div>
        </form>
    );
}
