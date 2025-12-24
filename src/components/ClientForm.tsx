"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Client, saveClient, updateClient, getClients } from "@/services/storage";
import Swal from "sweetalert2";
import { Save, ArrowLeft, X } from "lucide-react";

interface ClientFormProps {
    initialData?: Client;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ClientForm({ initialData, onClose, onSuccess }: ClientFormProps) {
    const [loading, setLoading] = useState(false);
    const [showMeasurements, setShowMeasurements] = useState(false);
    const [formData, setFormData] = useState<Partial<Client>>({
        name: "",
        phone: "",
        notes: "",
        measurements: {}
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            if (initialData.measurements && Object.keys(initialData.measurements).length > 0) {
                setShowMeasurements(true);
            }
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            measurements: {
                ...prev.measurements,
                [name]: type === 'number' ? parseFloat(value) : value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Format phone number
        let formattedPhone = formData.phone || "";
        // Remove spaces and special chars except +
        formattedPhone = formattedPhone.replace(/[^\d+]/g, '');

        // Check for Venezuela prefix (04xx, 02xx...)
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '+58' + formattedPhone.substring(1);
        }

        const dataToSave = {
            ...formData,
            phone: formattedPhone
        };

        try {
            if (initialData && initialData.id) {
                await updateClient(initialData.id, dataToSave);
                Swal.fire("Éxito", "Cliente actualizado correctamente", "success");
            } else {
                await saveClient(dataToSave as Client);
                Swal.fire("Éxito", "Cliente creado correctamente", "success");
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Ocurrió un error al guardar", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
                    <h2 className="text-xl font-bold text-slate-100">
                        {initialData ? "Editar Cliente" : "Nuevo Cliente"}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-400 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Nombre Completo *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="Ej. Ana Pérez"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Teléfono / WhatsApp</label>
                        <input
                            type="text"
                            name="phone"
                            placeholder="Ej. +58 412-1234567"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Notas Adicionales</label>
                        <textarea
                            name="notes"
                            rows={3}
                            placeholder="Preferencias, tallas habituales, etc."
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none bg-slate-950 text-white placeholder-slate-500"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => setShowMeasurements(!showMeasurements)}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                            {showMeasurements ? "− Ocultar Medidas" : "+ Agregar Medidas Corprales"}
                        </button>

                        {showMeasurements && (
                            <div className="mt-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Medidas (cm)</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {[
                                        { key: 'chest', label: 'Pecho/Busto' },
                                        { key: 'waist', label: 'Cintura' },
                                        { key: 'hip', label: 'Cadera' },
                                        { key: 'back', label: 'Espalda' },
                                        { key: 'shoulder', label: 'Hombro' },
                                        { key: 'sleeve', label: 'Largo Manga' },
                                        { key: 'length', label: 'Largo Total' },
                                        { key: 'pantsLength', label: 'Largo Pantalón' },
                                        { key: 'neck', label: 'Cuello' },
                                    ].map((field) => (
                                        <div key={field.key}>
                                            <label className="text-xs text-slate-500 block mb-1">{field.label}</label>
                                            <input
                                                type="number"
                                                name={field.key}
                                                // @ts-ignore
                                                value={formData.measurements?.[field.key] || ''}
                                                onChange={handleMeasurementChange}
                                                className="w-full px-3 py-1.5 rounded-lg border border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-900 text-white placeholder-slate-600"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">Otras Medidas / Notas</label>
                                    <textarea
                                        name="custom"
                                        rows={2}
                                        // @ts-ignore
                                        value={formData.measurements?.custom || ''}
                                        onChange={handleMeasurementChange}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-900 text-white placeholder-slate-600 resize-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
