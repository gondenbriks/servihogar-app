'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO,
    isToday
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Plus,
    RefreshCcw,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProHeader from '../../components/ProHeader';

export default function CalendarPage() {
    const router = useRouter();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<Date>(new Date());

    useEffect(() => {
        fetchCalendarEvents();
    }, [currentMonth]);

    const fetchCalendarEvents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const timeMin = startOfMonth(currentMonth).toISOString();
            const timeMax = endOfMonth(currentMonth).toISOString();

            const response = await fetch('/api/google-service', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'list_calendar_events',
                    timeMin,
                    timeMax
                })
            });

            const data = await response.json();
            if (data.success) {
                setEvents(data.events || []);
            } else {
                throw new Error(data.details || "No se pudieron cargar los eventos");
            }
        } catch (err: any) {
            console.error("Error fetching events:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between px-2 mb-8">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-black text-white capitalize">
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#135bec]">Vista Mensual Pro</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="size-10 rounded-xl bg-gray-900 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-4 h-10 rounded-xl bg-gray-900 border border-white/5 text-[10px] font-black uppercase tracking-widest text-[#135bec] hover:bg-[#135bec]/10 transition-all active:scale-95"
                    >
                        Hoy
                    </button>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="size-10 rounded-xl bg-gray-900 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return (
            <div className="grid grid-cols-7 mb-4">
                {days.map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const calendarDays = eachDayOfInterval({
            start: startDate,
            end: endDate,
        });

        return (
            <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                {calendarDays.map((day, i) => {
                    const isSelected = isSameDay(day, selectedDay);
                    const isMonthDay = isSameMonth(day, monthStart);
                    const dayEvents = events.filter(event => {
                        const eventDate = event.start.dateTime || event.start.date;
                        return isSameDay(parseISO(eventDate), day);
                    });

                    return (
                        <div
                            key={i}
                            onClick={() => setSelectedDay(day)}
                            className={`min-h-[110px] p-3 bg-[#0a0c10] transition-all cursor-pointer relative group ${!isMonthDay ? 'opacity-30' : 'opacity-100'
                                } ${isSelected ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-sm font-black italic tabular-nums ${isToday(day) ? 'text-[#135bec] scale-110' : 'text-gray-500'
                                    }`}>
                                    {format(day, 'd')}
                                </span>
                                {isToday(day) && (
                                    <div className="size-1.5 rounded-full bg-[#135bec] shadow-[0_0_10px_#135bec]" />
                                )}
                            </div>

                            <div className="space-y-1">
                                {dayEvents.slice(0, 3).map((event, idx) => (
                                    <div
                                        key={idx}
                                        className="text-[8px] font-black uppercase tracking-tighter p-1.5 rounded-md bg-[#135bec]/10 border border-[#135bec]/20 text-[#135bec] truncate"
                                        title={event.summary}
                                    >
                                        {event.summary}
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                    <div className="text-[7px] font-black text-gray-600 text-center uppercase tracking-widest mt-1">
                                        + {dayEvents.length - 3} más
                                    </div>
                                )}
                            </div>

                            {isSelected && (
                                <motion.div
                                    layoutId="cell-highlight"
                                    className="absolute inset-x-1 bottom-1 h-0.5 bg-[#135bec] rounded-full"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderSelectedDayEvents = () => {
        const dayEvents = events.filter(event => {
            const eventDate = event.start.dateTime || event.start.date;
            return isSameDay(parseISO(eventDate), selectedDay);
        });

        return (
            <div className="mt-10 space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                        <CalendarIcon size={20} className="text-[#135bec]" />
                        Eventos del {format(selectedDay, "d 'de' MMMM", { locale: es })}
                    </h3>
                    <span className="text-[10px] font-black text-gray-500 bg-gray-900 border border-white/5 px-4 py-1.5 rounded-full">
                        {dayEvents.length} Programados
                    </span>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCcw size={24} className="text-[#135bec] animate-spin" />
                    </div>
                ) : dayEvents.length === 0 ? (
                    <div className="p-12 rounded-[2.5rem] border-2 border-dashed border-white/5 bg-gray-900/10 flex flex-col items-center justify-center text-center opacity-40">
                        <Clock size={40} className="text-gray-600 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Sin compromisos para este día</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dayEvents.map((event) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={event.id}
                                className="bg-gray-900/40 border border-white/5 p-6 rounded-[2.5rem] group hover:border-[#135bec]/30 transition-all relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-100 transition-opacity">
                                    <a href={event.htmlLink} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink size={16} className="text-gray-400 hover:text-[#135bec]" />
                                    </a>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div>
                                        <h4 className="text-base font-black text-white italic tracking-tight">{event.summary || '(Sin título)'}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="px-2 py-0.5 rounded-lg bg-[#135bec]/10 border border-[#135bec]/20 text-[8px] font-black text-[#135bec] uppercase tracking-widest">
                                                Cita Confirmada
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-gray-400">
                                            <div className="size-8 rounded-xl bg-gray-950 flex items-center justify-center text-[#135bec]">
                                                <Clock size={14} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                {event.start.dateTime ? format(parseISO(event.start.dateTime), 'HH:mm') : 'Todo el día'}
                                                {event.end?.dateTime && ` - ${format(parseISO(event.end.dateTime), 'HH:mm')}`}
                                            </span>
                                        </div>

                                        {event.location && (
                                            <div className="flex items-center gap-3 text-gray-400">
                                                <div className="size-8 rounded-xl bg-gray-950 flex items-center justify-center text-rose-500">
                                                    <MapPin size={14} />
                                                </div>
                                                <span className="text-[10px] font-bold truncate flex-1 uppercase tracking-tight">{event.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {event.description && (
                                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                            <p className="text-[10px] text-gray-500 font-medium whitespace-pre-line line-clamp-3 leading-relaxed">
                                                {event.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] text-white font-sans pb-24">
            <ProHeader
                title="Calendario"
                showBack
                rightElement={
                    <button
                        onClick={fetchCalendarEvents}
                        disabled={isLoading}
                        className="size-11 rounded-2xl bg-gray-900 border border-white/5 flex items-center justify-center text-gray-400 hover:text-[#135bec] transition-all active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCcw size={20} className={isLoading ? "animate-spin" : ""} />
                    </button>
                }
            />

            <main className="max-w-6xl mx-auto px-6 pt-10">
                {error && (
                    <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 text-xs font-bold animate-shake">
                        <AlertCircle size={18} />
                        {error}
                        <button onClick={fetchCalendarEvents} className="ml-auto underline">Reintentar</button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-10">
                    {/* Calendar View */}
                    <section className="animate-fade-in">
                        {renderHeader()}
                        {renderDays()}
                        {renderCells()}
                    </section>

                    {/* Day Details */}
                    <section className="animate-slide-up">
                        {renderSelectedDayEvents()}
                    </section>
                </div>
            </main>

            {/* FAB for new event (Redirect to New Service) */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push('/new-service')}
                className="fixed bottom-8 right-8 size-16 rounded-full bg-[#135bec] text-white shadow-[0_20px_40px_rgba(19,91,236,0.4)] flex items-center justify-center z-[100] border-2 border-white/10"
            >
                <Plus size={32} />
            </motion.button>
        </div>
    );
}
