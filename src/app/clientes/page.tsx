"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash, Users, Phone, FileText } from 'lucide-react';
import { getClients, deleteClient, Client } from '@/services/storage';
import Swal from 'sweetalert2';
import ClientForm from '@/components/ClientForm';
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useClients } from "@/context/ClientsContext";

export default function ClientesPage() {
    // ✨ Usando contexto global - sin query redundante
    const { clients, loading, refreshClients } = useClients();

    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);

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
                await deleteClient(id);
                // ✨ Refrescar desde contexto global
                await refreshClients();
                Swal.fire('Eliminado!', 'El cliente ha sido eliminado.', 'success');
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar.', 'error');
            }
        }
    }

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setIsFormOpen(true);
    };

    const handleNew = () => {
        setEditingClient(undefined);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        // ✨ Refrescar desde contexto global
        refreshClients();
    };

    // Debounce para optimizar búsqueda
    const debouncedSearch = useDebounce(searchTerm, 300);

    // useMemo para evitar recalcular filtro en cada render
    const filteredClients = useMemo(() =>
        clients.filter(c =>
            c.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            c.phone?.includes(debouncedSearch)
        ),
        [clients, debouncedSearch]
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <Users className="text-blue-600" /> Gestión de Clientes
                    </h1>
                    <p className="text-slate-500 text-sm">Administra tu base de datos de clientes</p>
                </div>
                <button
                    onClick={handleNew}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                >
                    <Plus size={20} /> Nuevo Cliente
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar cliente por nombre o teléfono..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-none bg-slate-950 text-white placeholder-slate-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full p-8 text-center text-slate-400">Cargando clientes...</div>
                ) : filteredClients.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-slate-400">
                        {searchTerm ? 'No se encontraron resultados.' : 'No hay clientes registrados.'}
                    </div>
                ) : (
                    filteredClients.map((client) => (
                        <div key={client.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-none hover:shadow-none transition-shadow group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                        {client.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-100 group-hover:text-blue-600 transition-colors">{client.name}</h3>
                                        <p className="text-xs text-slate-400">ID: {client.id?.slice(0, 6)}...</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(client)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => client.id && handleDelete(client.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {client.phone && (
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Phone size={16} className="text-slate-400" />
                                        <a
                                            href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-emerald-500 hover:underline transition-colors font-medium"
                                        >
                                            {client.phone}
                                        </a>
                                    </div>
                                )}
                                {client.notes && (
                                    <div className="flex items-start gap-2 text-sm text-slate-500 bg-slate-950 p-2 rounded-lg mt-2">
                                        <FileText size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                        <p className="line-clamp-2 text-xs">{client.notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
                                <Link href={`/clientes/${client.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                                    Ver Historial
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isFormOpen && (
                <ClientForm
                    initialData={editingClient}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
}
