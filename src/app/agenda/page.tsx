"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, X, Trash } from 'lucide-react';
import { getEvents, saveEvent, deleteEvent, CalendarEvent, getOrders, Order } from '@/services/storage';
import Swal from 'sweetalert2';

// Helper to get days in month
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DAYS_OF_WEEK = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function AgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    // Form
    const [newEventTitle, setNewEventTitle] = useState("");
    const [newEventType, setNewEventType] = useState<'delivery' | 'meeting' | 'other'>('delivery');

    useEffect(() => {
        loadEvents();
    }, []);

    async function loadEvents() {
        const [storedEvents, orders] = await Promise.all([getEvents(), getOrders()]);

        const orderEvents: CalendarEvent[] = [];
        orders.forEach(order => {
            if (order.appointmentDate) {
                // Extract YYYY-MM-DD
                const date = order.appointmentDate.split('T')[0];
                orderEvents.push({
                    id: `apt-${order.id}`,
                    title: `Cita: ${order.clientName} - ${order.garmentName}`,
                    date: date,
                    type: 'meeting'
                });
            }
            if (order.deliveryDate) {
                const date = order.deliveryDate.split('T')[0];
                orderEvents.push({
                    id: `del-${order.id}`,
                    title: `Entrega: ${order.clientName} - ${order.garmentName}`,
                    date: date,
                    type: 'delivery'
                });
            }
        });

        setEvents([...storedEvents, ...orderEvents]);
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedEvent(event);
    };

    const handleDayClick = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
        setShowModal(true);
    };

    const handleSaveEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !newEventTitle) return;

        try {
            await saveEvent({
                title: newEventTitle,
                date: selectedDate,
                type: newEventType
            });
            setNewEventTitle("");
            setShowModal(false);
            loadEvents();
            Swal.fire({ title: 'Evento guardado', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
        } catch (error) {
            console.error(error);
        }
    };

    async function handleDeleteEvent(id: string) {
        try {
            await deleteEvent(id);
            setEvents(events.filter(e => e.id !== id));
        } catch (e) { console.error(e); }
    }

    // Render Calendar
    const calendarDays = [];
    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="h-24 md:h-32 bg-slate-950/50 border border-slate-800"></div>);
    }
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

        calendarDays.push(
            <div
                key={day}
                onClick={() => handleDayClick(day)}
                className={`h-24 md:h-32 border border-slate-800 p-2 relative group hover:bg-slate-950 transition-colors cursor-pointer ${isToday ? 'bg-blue-50/30' : 'bg-slate-900'}`}
            >
                <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-300'}`}>
                    {day}
                </span>

                <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-2rem)]">
                    {dayEvents.map(event => (
                        <div
                            key={event.id}
                            onClick={(e) => handleEventClick(event, e)}
                            className={`text-xs p-1 rounded border truncate flex justify-between items-center group/event
                                ${event.type === 'delivery' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                    event.type === 'meeting' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-slate-800 border-slate-700 text-slate-400'}
                            `}
                        >
                            <span>{event.title}</span>
                            <button onClick={() => event.id && handleDeleteEvent(event.id)} className="opacity-0 group-hover/event:opacity-100 hover:text-red-600">
                                <Trash size={10} />
                            </button>
                        </div>
                    ))}
                </div>

                <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity">
                    <Plus size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <CalendarIcon className="text-blue-600" /> Agenda
                    </h1>
                    <p className="text-slate-500 text-sm">Organiza entregas y eventos</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-none">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-950 rounded-lg text-slate-400"><ChevronLeft size={20} /></button>
                    <span className="font-semibold text-slate-100 w-32 text-center select-none">{MONTH_NAMES[month]} {year}</span>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-slate-950 rounded-lg text-slate-400"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-none overflow-hidden flex flex-col">
                <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950">
                    {DAYS_OF_WEEK.map(day => (
                        <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto">
                    {calendarDays}
                </div>
            </div>

            {/* Event Details Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 p-6 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-slate-100">{selectedEvent.title}</h3>
                                <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium mt-2
                                    ${selectedEvent.type === 'delivery' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        selectedEvent.type === 'meeting' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            'bg-slate-700 text-slate-300'}`}>
                                    {selectedEvent.type === 'delivery' ? 'Entrega' : selectedEvent.type === 'meeting' ? 'Cita' : 'Evento'}
                                </div>
                            </div>
                            <button onClick={() => setSelectedEvent(null)}><X className="text-slate-400 hover:text-slate-400" /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</label>
                                <p className="text-slate-300 font-medium">{selectedEvent.date}</p>
                            </div>

                            {selectedEvent.id?.startsWith('apt-') || selectedEvent.id?.startsWith('del-') ? (
                                <div className="pt-2">
                                    <a
                                        href={`/pedidos?id=${selectedEvent.id.substring(4)}`}
                                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-bold transition-colors"
                                    >
                                        Ver Pedido
                                    </a>
                                    <p className="text-xs text-center text-slate-500 mt-2">
                                        Este evento está vinculado a un pedido
                                    </p>
                                </div>
                            ) : (
                                <div className="pt-2">
                                    <button
                                        onClick={() => {
                                            if (selectedEvent.id) handleDeleteEvent(selectedEvent.id);
                                            setSelectedEvent(null);
                                        }}
                                        className="block w-full text-center bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-2 rounded-xl font-bold transition-colors"
                                    >
                                        Eliminar Evento
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Event Modal */}
            {showModal && !selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-100">Nuevo Evento</h3>
                            <button onClick={() => setShowModal(false)}><X className="text-slate-400 hover:text-slate-400" /></button>
                        </div>
                        <p className="text-sm text-slate-500">Fecha: {selectedDate}</p>

                        <form onSubmit={handleSaveEvent} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Título</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-950 text-white placeholder-slate-500"
                                    placeholder="Ej. Entrega Pedido #123"
                                    value={newEventTitle}
                                    onChange={e => setNewEventTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Tipo</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setNewEventType('delivery')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium border ${newEventType === 'delivery' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-700 text-slate-400'}`}
                                    >
                                        Entrega
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewEventType('meeting')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium border ${newEventType === 'meeting' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-700 text-slate-400'}`}
                                    >
                                        Cita
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-bold">Guardar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
