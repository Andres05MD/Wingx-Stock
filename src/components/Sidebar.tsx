"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Shirt, Package, ClipboardList, Users, ShoppingCart, X, Calendar, DollarSign } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    const links = [
        { name: 'Prendas', href: '/prendas', icon: Shirt },
        { name: 'En Stock', href: '/inventario', icon: Package },
        { name: 'Pedidos', href: '/pedidos', icon: ClipboardList },
        { name: 'Agenda', href: '/agenda', icon: Calendar },
        { name: 'Clientes', href: '/clientes', icon: Users },
        { name: 'Materiales', href: '/materiales', icon: ShoppingCart },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <aside
            className={`fixed top-0 left-0 z-50 h-[100dvh] w-[280px] bg-slate-900 border-r border-slate-800 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6">
                    <Link href="/" className="flex items-center gap-3 decoration-none" onClick={onClose}>
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/20 text-white font-bold text-xl">
                            W
                        </div>
                        <span className="text-xl font-extrabold text-white tracking-tight">Wingx</span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-8 overflow-y-auto py-4">
                    <div>
                        <div className="px-4 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Menú
                        </div>
                        <div className="space-y-1">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => window.innerWidth < 1024 && onClose()}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive(link.href)
                                        ? 'bg-blue-500/10 text-blue-400 shadow-none border border-blue-500/20'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                        }`}
                                >
                                    <link.icon
                                        size={20}
                                        className={`transition-colors duration-200 ${isActive(link.href) ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'
                                            }`}
                                    />
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800">
                    <div className="text-xs text-slate-400 text-center">
                        &copy; 2025 Wingx App
                    </div>
                </div>
            </div>
        </aside>
    );
}
