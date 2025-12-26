"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Material, getMaterials } from "@/services/storage";
import { useAuth } from "./AuthContext";

interface MaterialsContextType {
    materials: Material[];
    loading: boolean;
    error: string | null;
    refreshMaterials: () => Promise<void>;
}

const MaterialsContext = createContext<MaterialsContextType>({} as MaterialsContextType);

export const MaterialsProvider = ({ children }: { children: ReactNode }) => {
    const { user, role } = useAuth();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshMaterials = useCallback(async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getMaterials(role || undefined, user.uid);
            setMaterials(data);
        } catch (err) {
            console.error("Error fetching materials:", err);
            setError("No se pudieron cargar los materiales");
        } finally {
            setLoading(false);
        }
    }, [user, role]);

    useEffect(() => {
        if (user?.uid) {
            refreshMaterials();
        } else {
            setMaterials([]);
            setLoading(false);
        }
    }, [user, role, refreshMaterials]);

    return (
        <MaterialsContext.Provider value={{ materials, loading, error, refreshMaterials }}>
            {children}
        </MaterialsContext.Provider>
    );
};

export const useMaterials = () => {
    const context = useContext(MaterialsContext);
    if (!context) {
        throw new Error("useMaterials must be used within MaterialsProvider");
    }
    return context;
};
