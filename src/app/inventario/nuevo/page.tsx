"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveStockItem, StockItem, Garment, getGarments } from "@/services/storage";
import Swal from "sweetalert2";
import { ArrowLeft, Save, Shirt, Package, Palette } from "lucide-react";
import Link from "next/link";

export default function NewStockPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [garments, setGarments] = useState<Garment[]>([]);

    // Form state
    const [garmentId, setGarmentId] = useState("");
    const [size, setSize] = useState("M");
    const [quantity, setQuantity] = useState(1);
    const [color, setColor] = useState("");

    useEffect(() => {
        loadGarmentsCatalog();
    }, []);

    async function loadGarmentsCatalog() {
        const data = await getGarments();
        setGarments(data);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const selectedGarment = garments.find(g => g.id === garmentId);

        const itemData: StockItem = {
            garmentId,
            garmentName: selectedGarment ? selectedGarment.name : "Desconocida",
            size,
            quantity: Number(quantity),
            color
        };

        try {
            await saveStockItem(itemData);
            Swal.fire("Éxito", "Item agregado al inventario", "success");
            router.push("/inventario");
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudo guardar", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Agregar al Stock</h1>
                    <p className="text-slate-400 text-sm mt-1">Registrar nuevas prendas disponibles para venta inmediata</p>
                </div>
                <Link href="/inventario" className="flex items-center px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm font-medium">
                    <ArrowLeft size={18} className="mr-2" /> Volver
                </Link>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 lg:p-8 space-y-8 shadow-2xl shadow-black/20">
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider">
                        <Shirt size={16} className="text-blue-500" /> Seleccionar Prenda
                    </label>
                    <div className="relative">
                        <select
                            required
                            value={garmentId}
                            onChange={(e) => setGarmentId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-blue-500/50 focus:bg-black/40 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-white appearance-none cursor-pointer"
                        >
                            <option value="">-- Seleccionar --</option>
                            {garments.map(g => (
                                <option key={g.id} value={g.id} className="text-slate-900">{g.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider">
                            Talla
                        </label>
                        <div className="relative">
                            <select
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-blue-500/50 focus:bg-black/40 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-white appearance-none cursor-pointer"
                            >
                                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
                                    <option key={s} value={s} className="text-slate-900">{s}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider">
                            <Package size={16} className="text-emerald-500" /> Cantidad
                        </label>
                        <input
                            type="number"
                            min="1"
                            required
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-emerald-500/50 focus:bg-black/40 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-white placeholder-slate-500"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider">
                        <Palette size={16} className="text-purple-500" /> Color / Variante (Opcional)
                    </label>
                    <input
                        type="text"
                        placeholder="Ej. Rojo, Estampado floral"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500/50 focus:bg-black/40 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-white placeholder-slate-500"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={22} />
                    {loading ? "Guardando..." : "Agregar al Stock"}
                </button>
            </div>
        </form>
    );
}
