import { DollarSign, AlertCircle, Activity, Layers } from 'lucide-react';
import { useExchangeRate } from "@/context/ExchangeRateContext";

interface StatsGridProps {
    loading: boolean;
    realIncome: number;
    pendingPayments: number;
    activeOrders: number;
    estimatedProfit: number;
}

export default function StatsGrid({ loading, realIncome, pendingPayments, activeOrders, estimatedProfit }: StatsGridProps) {
    const { formatBs } = useExchangeRate();

    return (
        <section>
            <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Resumen Financiero</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Ingresos Reales"
                    value={realIncome}
                    loading={loading}
                    formatValue
                    secondaryValue={formatBs(realIncome)}
                    icon={DollarSign}
                    iconColor="text-emerald-400"
                    gradient="from-emerald-500/20 to-teal-500/5"
                    borderColor="hover:border-emerald-500/30"
                />

                <StatCard
                    title="Por Cobrar"
                    value={pendingPayments}
                    loading={loading}
                    formatValue
                    secondaryValue={formatBs(pendingPayments)}
                    icon={AlertCircle}
                    iconColor="text-red-400"
                    gradient="from-red-500/20 to-orange-500/5"
                    borderColor="hover:border-red-500/30"
                />

                <StatCard
                    title="Pedidos Activos"
                    value={activeOrders}
                    loading={loading}
                    icon={Activity}
                    iconColor="text-amber-400"
                    gradient="from-amber-500/20 to-yellow-500/5"
                    borderColor="hover:border-amber-500/30"
                />

                <StatCard
                    title="Ganancia (Est.)"
                    value={estimatedProfit}
                    loading={loading}
                    formatValue
                    secondaryValue={formatBs(estimatedProfit)}
                    icon={Layers}
                    iconColor="text-indigo-400"
                    gradient="from-indigo-500/20 to-violet-500/5"
                    borderColor="hover:border-indigo-500/30"
                />
            </div>
        </section>
    );
}

function StatCard({ title, value, loading, formatValue, secondaryValue, icon: Icon, iconColor, gradient, borderColor }: any) {
    return (
        <div className={`relative p-5 rounded-3xl border border-white/5 bg-gradient-to-br ${gradient} backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${borderColor}`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/5 ${iconColor}`}>
                    <Icon size={24} />
                </div>
                {/* Optional decorative element */}
                <div className={`w-16 h-16 rounded-full blur-2xl absolute -top-4 -right-4 opacity-20 bg-current ${iconColor}`} />
            </div>

            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 opacity-80">{title}</p>
                <p className="text-2xl font-bold text-white tracking-tight">
                    {loading ? (
                        <span className="inline-block w-20 h-8 bg-white/10 rounded animate-pulse" />
                    ) : (
                        <>
                            {formatValue ? '$' : ''}{Number(value).toLocaleString(undefined, { minimumFractionDigits: formatValue ? 2 : 0 })}
                        </>
                    )}
                </p>
                {secondaryValue && !loading && (
                    <div className={`mt-2 flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-lg border border-white/5 w-fit ${iconColor}`}>
                        <span className="text-[9px] uppercase opacity-70">En Bs:</span>
                        <span className="text-[10px] font-mono font-bold tracking-tight">{secondaryValue}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
