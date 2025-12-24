"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveStockItem, StockItem, Garment, getGarments } from "@/services/storage";
import Swal from "sweetalert2";
import { ArrowLeft, Save } from "lucide-react";
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
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Agregar al Stock</h1>
                    <p className="text-slate-500 text-sm">Registrar nuevas prendas disponibles</p>
                </div>
                <Link href="/inventario" className="flex items-center text-slate-500 hover:text-slate-100 transition-colors">
                    <ArrowLeft size={20} className="mr-1" /> Volver
                </Link>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-none space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Seleccionar Prenda</label>
                    <select
                        required
                        value={garmentId}
                        onChange={(e) => setGarmentId(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                    >
                        <option value="">-- Seleccionar --</option>
                        {garments.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Talla</label>
                        <select
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                        >
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Cantidad</label>
                        <input
                            type="number"
                            min="1"
                            required
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Color (Opcional)</label>
                    <input
                        type="text"
                        placeholder="Ej. Rojo, Estampado floral"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={20} />
                    {loading ? "Guardando..." : "Agregar al Stock"}
                </button>
            </div>
        </form>
    );
}
