"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Order, getOrders } from "@/services/storage";
import { useAuth } from "./AuthContext";

interface OrdersContextType {
    orders: Order[];
    loading: boolean;
    error: string | null;
    refreshOrders: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType>({} as OrdersContextType);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
    const { user, role } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshOrders = useCallback(async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getOrders(role || undefined, user.uid);
            setOrders(data);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("No se pudieron cargar los pedidos");
        } finally {
            setLoading(false);
        }
    }, [user, role]);

    useEffect(() => {
        if (user?.uid) {
            refreshOrders();
        } else {
            setOrders([]);
            setLoading(false);
        }
    }, [user, role, refreshOrders]);

    return (
        <OrdersContext.Provider value={{ orders, loading, error, refreshOrders }}>
            {children}
        </OrdersContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrdersContext);
    if (!context) {
        throw new Error("useOrders must be used within OrdersProvider");
    }
    return context;
};
