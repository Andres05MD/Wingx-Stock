"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Order, Garment, GarmentMaterial, getGarments, saveOrder, updateOrder, getOrder, saveMaterial, getMaterials, getClients, Client } from "@/services/storage"; // getOrder doesn't exist yet but I'll add it or use filtering
import Swal from "sweetalert2";
import { Plus, Trash, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale/es';

registerLocale('es', es);

// Mock getOrder since it wasn't exported in storage.ts or I missed it.
// I will implement a fetcher in useEffect for editing.

interface OrderFormProps {
    id?: string;
}

export default function OrderForm({ id }: OrderFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [garments, setGarments] = useState<Garment[]>([]);
    const [clients, setClients] = useState<Client[]>([]);

    // Form State
    const [clientName, setClientName] = useState("");
    const [isNewClient, setIsNewClient] = useState(false); // Toggle between select and input
    const [garmentId, setGarmentId] = useState("");
    const [isNewGarment, setIsNewGarment] = useState(false);
    const [garmentName, setGarmentName] = useState("");
    const [size, setSize] = useState("M");
    const [price, setPrice] = useState<number | string>(0);
    const [paidAmount, setPaidAmount] = useState<number | string>(0);
    const [status, setStatus] = useState("Sin Comenzar");

    // Materials logic
    const [selectedGarmentMaterials, setSelectedGarmentMaterials] = useState<GarmentMaterial[]>([]);
    const [customMaterials, setCustomMaterials] = useState<GarmentMaterial[]>([]);
    const [newMatName, setNewMatName] = useState("");
    const [newMatQtty, setNewMatQtty] = useState("");
    const [newMatCost, setNewMatCost] = useState<number | string>("");

    // Date State
    const [appointmentDate, setAppointmentDate] = useState<Date | null>(null);
    const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);

    useEffect(() => {
        loadCatalog();
        if (id) {
            loadOrder(id);
        }
    }, [id]);

    async function loadCatalog() {
        const [garmentsData, clientsData] = await Promise.all([getGarments(), getClients()]);
        setGarments(garmentsData);
        setClients(clientsData);
    }

    async function loadOrder(orderId: string) {
        setLoading(true);
        const order = await getOrder(orderId);
        if (order) {
            setClientName(order.clientName);
            setGarmentId(order.garmentId || "");
            setGarmentName(order.garmentName);
            setSize(order.size);
            setPrice(order.price);
            setPaidAmount(order.paidAmount);
            setStatus(order.status);

            // Helper to parse YYYY-MM-DD
            const parseDate = (dateStr?: string) => {
                if (!dateStr) return null;
                const [y, m, d] = dateStr.split('T')[0].split('-');
                if (!y || !m || !d) return null;
                return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
            };

            setAppointmentDate(parseDate(order.appointmentDate));
            setDeliveryDate(parseDate(order.deliveryDate));
        } else {
            Swal.fire("Error", "No se encontró el pedido", "error");
            router.push("/pedidos");
        }
        setLoading(false);
    }

    const handleGarmentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const gId = e.target.value;
        setGarmentId(gId);

        if (gId) {
            const garment = garments.find(g => g.id === gId);
            if (garment) {
                setGarmentName(garment.name);
                setPrice(garment.price);
                if (garment.materials) {
                    setSelectedGarmentMaterials(garment.materials);
                } else {
                    setSelectedGarmentMaterials([]);
                }
            }
        } else {
            setGarmentName("");
            setPrice(0);
            setSelectedGarmentMaterials([]);
        }
    };

    const addCustomMaterial = () => {
        if (!newMatName || !newMatQtty) {
            Swal.fire("Atención", "Nombre y Cantidad requeridos", "warning");
            return;
        }
        const cost = typeof newMatCost === 'number' ? newMatCost : parseFloat(newMatCost) || 0;
        setCustomMaterials([...customMaterials, { name: newMatName, quantity: newMatQtty, cost }]);
        setNewMatName("");
        setNewMatQtty("");
        setNewMatCost("");
    };

    const removeCustomMaterial = (index: number) => {
        const newMats = [...customMaterials];
        newMats.splice(index, 1);
        setCustomMaterials(newMats);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formatDate = (date: Date | null) => {
            if (!date) return undefined;
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        };

        // Filter out undefined values to avoid Firebase errors
        const orderData: any = {
            clientName,
            garmentName,
            size,
            price: Number(price),
            paidAmount: Number(paidAmount),
            status,
            createdAt: new Date().toISOString(),
            appointmentDate: formatDate(appointmentDate),
            deliveryDate: formatDate(deliveryDate)
        };

        if (garmentId) {
            orderData.garmentId = garmentId;
        }

        try {
            if (id) {
                await updateOrder(id, orderData);
                Swal.fire("Éxito", "Pedido actualizado", "success");
            } else {
                await saveOrder(orderData);

                // Add materials to shopping list
                const materialsToSave = garmentId ? selectedGarmentMaterials : customMaterials;
                if (materialsToSave.length > 0) {
                    await addMaterialsToShoppingList(materialsToSave, `${garmentName} - ${clientName}`);
                }

                Swal.fire("Éxito", "Pedido creado", "success");
            }
            router.push("/pedidos");
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudo guardar", "error");
        } finally {
            setLoading(false);
        }
    };

    async function addMaterialsToShoppingList(materials: GarmentMaterial[], sourceName: string) {
        try {
            const existingMaterials = await getMaterials();
            for (const mat of materials) {
                const exists = existingMaterials.some(
                    m => m.name.toLowerCase() === mat.name.toLowerCase() && !m.purchased
                );
                if (!exists) {
                    await saveMaterial({
                        name: mat.name,
                        quantity: mat.quantity || 1,
                        price: mat.cost,
                        source: sourceName,
                    });
                }
            }
        } catch (e) {
            console.error("Error saving materials", e);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">
                        {id ? "Editar Pedido" : "Nuevo Pedido"}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {id ? "Modifica los detalles del pedido" : "Registra un nuevo encargo"}
                    </p>
                </div>
                <Link href="/pedidos" className="flex items-center text-slate-500 hover:text-slate-100 transition-colors">
                    <ArrowLeft size={20} className="mr-1" /> Volver
                </Link>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-none space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Nombre del Cliente</label>
                        {isNewClient ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    required
                                    placeholder="Nombre del nuevo cliente"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => { setIsNewClient(false); setClientName(""); }}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl transition-colors text-sm whitespace-nowrap"
                                >
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <select
                                    value={clientName}
                                    onChange={(e) => {
                                        if (e.target.value === 'new_client_trigger') {
                                            setIsNewClient(true);
                                            setClientName("");
                                        } else {
                                            setClientName(e.target.value);
                                        }
                                    }}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                                >
                                    <option value="">-- Seleccionar Cliente --</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                    <option value="new_client_trigger" className="font-bold text-blue-400">+ Agregar Nuevo Cliente</option>
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Talla</label>
                        <select
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                        >
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'A Medida'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Prenda</label>
                    {isNewGarment ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                required
                                placeholder="Nombre de la nueva prenda"
                                value={garmentName}
                                onChange={(e) => setGarmentName(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setIsNewGarment(false);
                                    setGarmentName("");
                                    setGarmentId("");
                                    setPrice(0);
                                    setSelectedGarmentMaterials([]);
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl transition-colors text-sm whitespace-nowrap"
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <select
                                value={garmentId}
                                onChange={(e) => {
                                    if (e.target.value === 'new_garment_trigger') {
                                        setIsNewGarment(true);
                                        setGarmentId("");
                                        setGarmentName("");
                                        setPrice(0);
                                        setSelectedGarmentMaterials([]);
                                    } else {
                                        handleGarmentSelect(e);
                                    }
                                }}
                                className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                            >
                                <option value="">-- Seleccionar del Catálogo --</option>
                                {garments.map(g => (
                                    <option key={g.id} value={g.id}>{g.name} (${g.price})</option>
                                ))}
                                <option value="new_garment_trigger" className="font-bold text-blue-400">+ Otra / Nueva Prenda</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                    <div className="space-y-2 flex flex-col">
                        <label className="text-sm font-semibold text-slate-300">Fecha de Agendado (Cita)</label>
                        <DatePicker
                            selected={appointmentDate}
                            onChange={(date: Date | null) => setAppointmentDate(date)}
                            dateFormat="dd/MM/yyyy"
                            locale="es"
                            placeholderText="dd/mm/aaaa"
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                            wrapperClassName="w-full"
                        />
                    </div>
                    <div className="space-y-2 flex flex-col">
                        <label className="text-sm font-semibold text-slate-300">Fecha de Entrega</label>
                        <DatePicker
                            selected={deliveryDate}
                            onChange={(date: Date | null) => setDeliveryDate(date)}
                            dateFormat="dd/MM/yyyy"
                            locale="es"
                            placeholderText="dd/mm/aaaa"
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                            wrapperClassName="w-full"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Precio Total ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Monto Abonado ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Estado</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                        >
                            <option value="Sin Comenzar">Sin Comenzar</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Finalizado">Finalizado</option>
                        </select>
                    </div>
                </div>

                {/* Materials Info */}
                {!id && (
                    <div className="pt-6 border-t border-slate-800">
                        <label className="text-sm font-semibold text-slate-300 mb-2 block">
                            Materiales Requeridos <span className="font-normal text-slate-400 text-xs">(Se agregarán a lista de compras)</span>
                        </label>

                        {garmentId ? (
                            <div className="bg-slate-950 p-4 rounded-xl text-sm text-slate-400">
                                {selectedGarmentMaterials.length > 0 ? (
                                    <p>Incluye: {selectedGarmentMaterials.map(m => `${m.name}`).join(', ')}</p>
                                ) : (
                                    <p className="italic text-slate-400">Esta prenda no tiene materiales registrados.</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:flex md:items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Material"
                                        value={newMatName}
                                        onChange={(e) => setNewMatName(e.target.value)}
                                        className="w-full md:flex-1 px-3 py-2 rounded-lg border border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Cant."
                                        value={newMatQtty}
                                        onChange={(e) => setNewMatQtty(e.target.value)}
                                        className="w-full md:w-20 px-3 py-2 rounded-lg border border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Costo ($)"
                                        value={newMatCost}
                                        onChange={(e) => setNewMatCost(e.target.value)}
                                        className="w-full md:w-24 px-3 py-2 rounded-lg border border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-950 text-white placeholder-slate-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={addCustomMaterial}
                                        className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors text-slate-300 flex items-center justify-center"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {customMaterials.map((m, i) => (
                                        <div key={i} className="bg-slate-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                            <span>{m.name} ({m.quantity}) - ${m.cost}</span>
                                            <button type="button" onClick={() => removeCustomMaterial(i)} className="text-slate-400 hover:text-slate-400">×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={20} />
                    {loading ? "Guardando..." : "Guardar Pedido"}
                </button>
            </div>
        </form>
    );
}

