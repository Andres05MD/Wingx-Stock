"use client";

import { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Shell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();

    // ✅ useRef para router para evitar que cause re-renders
    const routerRef = useRef(router);
    routerRef.current = router;

    const isPublicRoute = pathname === '/login';

    useEffect(() => {
        if (!loading && !user && !isPublicRoute) {
            routerRef.current.push('/login');
        }
    }, [user, loading, isPublicRoute]); // ✅ router excluido de dependencies

    if (isPublicRoute) {
        return <>{children}</>;
    }

    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-slate-800"></div>
                <div className="h-4 w-32 bg-slate-800 rounded"></div>
            </div>
        </div>;
    }

    if (!user) return null;

    return (
        <div className="flex min-h-screen">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                            <Menu size={24} />
                        </button>
                        <Link href="/" className="font-bold text-lg text-white tracking-tight">Wingx</Link>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
