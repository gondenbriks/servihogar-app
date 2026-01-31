'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import {
    ChevronLeft,
    UserPlus,
    Edit3,
    Trash2,
    X,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Employee {
    id: string;
    name: string;
    role: string;
    initials: string;
    color: string;
}

const UsersScreen: React.FC = () => {
    const router = useRouter();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState('Técnico');

    // Initial Mock Data
    const [employees, setEmployees] = useState<Employee[]>([
        { id: '1', name: 'Carlos Rodriguez', role: 'Técnico Senior', initials: 'CR', color: 'bg-[#135bec]' },
        { id: '2', name: 'Ana García', role: 'Administradora', initials: 'AG', color: 'bg-purple-600' },
        { id: '3', name: 'Pedro Martinez', role: 'Técnico Junior', initials: 'PM', color: 'bg-emerald-500' },
    ]);

    const handleAddEmployee = () => {
        if (!newName.trim()) return;

        const initials = newName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

        const colors = ['bg-[#135bec]', 'bg-purple-600', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500', 'bg-teal-500'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newEmployee: Employee = {
            id: Date.now().toString(),
            name: newName,
            role: newRole,
            initials,
            color: randomColor
        };

        setEmployees([...employees, newEmployee]);
        setNewName('');
        setNewRole('Técnico');
        setShowAddModal(false);
    };

    const handleDeleteEmployee = (id: string) => {
        if (confirm('¿Estás seguro de eliminar a este empleado?')) {
            setEmployees(employees.filter(emp => emp.id !== id));
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-[#0a0c10] pb-24 font-sans text-white">
            <header className="sticky top-0 z-30 flex items-center bg-[#0a0c10]/80 backdrop-blur-xl p-4 justify-between border-b border-white/5">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                    Equipo Técnico
                </h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="size-10 rounded-2xl bg-[#135bec]/10 text-[#135bec] flex items-center justify-center border border-[#135bec]/20 active:scale-95 transition-all hover:bg-[#135bec] hover:text-white"
                >
                    <UserPlus size={20} />
                </button>
            </header>

            <main className="flex-1 p-6 space-y-4">
                {employees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                        <UserPlus size={48} className="mb-4" />
                        <p className="font-black uppercase tracking-widest text-xs">Sin registros</p>
                    </div>
                ) : (
                    employees.map((emp, idx) => (
                        <motion.div
                            key={emp.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-gray-900/40 rounded-3xl border border-white/5 p-4 flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`size-14 rounded-2xl ${emp.color} flex items-center justify-center font-black text-lg text-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform`}>
                                    {emp.initials}
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-white tracking-tight">
                                        {emp.name}
                                    </h3>
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-0.5">
                                        {emp.role}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="size-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteEmployee(emp.id)}
                                    className="size-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-colors border border-rose-500/10"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </main>

            {/* Add Employee Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0a0c10] w-full max-w-sm rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                                <h3 className="font-black text-white uppercase tracking-widest text-xs">Añadir Staff</h3>
                                <button onClick={() => setShowAddModal(false)} className="size-8 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full bg-gray-950 border border-white/10 rounded-2xl p-4 text-white focus:border-[#135bec] outline-none transition-all placeholder:text-gray-700 text-sm font-medium"
                                        placeholder="Ej: Juan Pérez"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cargo / Puesto</label>
                                    <select
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                        className="w-full bg-gray-950 border border-white/10 rounded-2xl p-4 text-white focus:border-[#135bec] outline-none appearance-none text-sm font-medium"
                                    >
                                        <option value="Técnico">Técnico</option>
                                        <option value="Técnico Senior">Técnico Senior</option>
                                        <option value="Administrador">Administrador</option>
                                        <option value="Ayudante">Ayudante</option>
                                    </select>
                                </div>

                                <button
                                    onClick={handleAddEmployee}
                                    disabled={!newName.trim()}
                                    className="w-full bg-[#135bec] text-white font-black py-4 rounded-2xl shadow-xl shadow-[#135bec]/20 transition-all active:scale-[0.98] mt-2 disabled:opacity-50 uppercase tracking-widest text-xs"
                                >
                                    Guardar Perfil
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <BottomNav />
        </div>
    );
};

export default UsersScreen;
