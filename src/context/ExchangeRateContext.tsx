"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ExchangeRateContextType {
    rate: number;
    loading: boolean;
    error: string | null;
    convertToBs: (usdAmount: number) => number;
    formatBs: (usdAmount: number) => string;
}

const ExchangeRateContext = createContext<ExchangeRateContextType>({} as ExchangeRateContextType);

export const ExchangeRateProvider = ({ children }: { children: React.ReactNode }) => {
    const [rate, setRate] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRate = async () => {
            try {
                const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
                if (!response.ok) throw new Error("Failed to fetch rate");
                
                const data = await response.json();
                if (data && data.promedio) {
                    setRate(data.promedio);
                } else {
                    throw new Error("Invalid data format");
                }
            } catch (err) {
                console.error("Error fetching exchange rate:", err);
                setError("No se pudo obtener la tasa BCV");
                // Fallback or retry could be here, but for now we just show error state or 0
            } finally {
                setLoading(false);
            }
        };

        fetchRate();
    }, []);

    const convertToBs = (usdAmount: number) => {
        if (!rate) return 0;
        return usdAmount * rate;
    };

    const formatBs = (usdAmount: number) => {
        const bsAmount = convertToBs(usdAmount);
        return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(bsAmount);
    };

    return (
        <ExchangeRateContext.Provider value={{ rate, loading, error, convertToBs, formatBs }}>
            {children}
        </ExchangeRateContext.Provider>
    );
};

export const useExchangeRate = () => useContext(ExchangeRateContext);
