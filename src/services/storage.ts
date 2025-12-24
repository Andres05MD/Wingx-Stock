import { db, auth } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, deleteDoc, query, where, setDoc } from "firebase/firestore";

// Interfaces
export interface GarmentMaterial {
    name: string;
    cost: number;
    quantity: string;
}

export interface Garment {
    id?: string;
    name: string;
    size: string;
    price: number;
    laborCost: number;
    transportCost: number;
    materials: GarmentMaterial[];
    ownerId?: string;
    createdAt?: string;
}

export interface Client {
    id?: string;
    name: string;
    phone: string;
    notes: string;
    measurements?: Record<string, any>;
    ownerId?: string;
    createdAt?: string;
}

export interface Order {
    id?: string;
    clientName: string;
    garmentName: string;
    size: string;
    price: number;
    paidAmount: number;
    status: string;
    createdAt: string;
    appointmentDate?: string;
    deliveryDate?: string;
    garmentId?: string;
    ownerId?: string;
}

export interface StockItem {
    id?: string;
    garmentId: string;
    garmentName?: string;
    size: string;
    quantity: number;
    color?: string;
    ownerId?: string;
    createdAt?: string;
}

export interface CalendarEvent {
    id?: string;
    title: string;
    date: string; // YYYY-MM-DD
    type: 'delivery' | 'meeting' | 'other';
    ownerId?: string;
    createdAt?: string;
}

export interface Material { // For shopping list
    id?: string;
    name: string;
    quantity: string | number;
    price: number;
    source?: string;
    purchased?: boolean;
    notes?: string;
    ownerId?: string;
    createdAt?: string;
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    role: 'admin' | 'user';
    createdAt?: string;
}


// Helper to get current user ID
const getUserId = () => {
    return auth.currentUser?.uid;
};

// Users & Roles
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) return docSnap.data() as UserProfile;
    return null;
};

export const saveUserProfile = async (user: UserProfile) => {
    return setDoc(doc(db, "users", user.uid), user, { merge: true });
};

export const getCurrentUserRole = async (): Promise<'admin' | 'user'> => {
    const userId = getUserId();
    if (!userId) return 'user';
    const profile = await getUserProfile(userId);
    return profile?.role || 'user';
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
    const role = await getCurrentUserRole();
    if (role !== 'admin') return [];

    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map(doc => doc.data() as UserProfile);
};


// Generic Helper for RBAC Queries
const getCollectionData = async (collectionName: string) => {
    const userId = getUserId();
    if (!userId) return [];

    const role = await getCurrentUserRole();

    let q;
    if (role === 'admin') {
        q = collection(db, collectionName);
    } else {
        q = query(collection(db, collectionName), where("ownerId", "==", userId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Garments
export const saveGarment = async (garment: Garment) => {
    const userId = getUserId();
    if (!userId) throw new Error("User not authenticated");
    return addDoc(collection(db, "garments"), { ...garment, ownerId: userId, createdAt: new Date().toISOString() });
};

export const updateGarment = async (id: string, data: Partial<Garment>) => {
    return updateDoc(doc(db, "garments", id), data);
};

export const getGarments = async (): Promise<Garment[]> => {
    return await getCollectionData("garments") as Garment[];
};

export const getGarmentById = async (id: string): Promise<Garment | null> => {
    const docSnap = await getDoc(doc(db, "garments", id));
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as Garment;
    return null;
};

export const deleteGarmentFromStorage = async (id: string) => {
    return deleteDoc(doc(db, "garments", id));
};


// Clients
export const saveClient = async (client: Client) => {
    const userId = getUserId();
    if (!userId) throw new Error("User not authenticated");
    return addDoc(collection(db, "clients"), { ...client, ownerId: userId, createdAt: new Date().toISOString() });
};

export const updateClient = async (id: string, data: Partial<Client>) => {
    return updateDoc(doc(db, "clients", id), data);
};

export const getClients = async (): Promise<Client[]> => {
    return await getCollectionData("clients") as Client[];
};

export const deleteClient = async (id: string) => {
    return deleteDoc(doc(db, "clients", id));
};


// Orders
export const saveOrder = async (order: Order) => {
    const userId = getUserId();
    if (!userId) throw new Error("User not authenticated");
    return addDoc(collection(db, "orders"), { ...order, ownerId: userId });
};

export const updateOrder = async (id: string, data: Partial<Order>) => {
    return updateDoc(doc(db, "orders", id), data);
};

export const getOrders = async (): Promise<Order[]> => {
    return await getCollectionData("orders") as Order[];
};

export const getOrder = async (id: string): Promise<Order | null> => {
    const docSnap = await getDoc(doc(db, "orders", id));
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as Order;
    return null;
};

export const deleteOrder = async (id: string) => {
    return deleteDoc(doc(db, "orders", id));
};

// Materials (Shopping List)
export const saveMaterial = async (material: Material) => {
    const userId = getUserId();
    if (!userId) throw new Error("User not authenticated");
    return addDoc(collection(db, "materials"), { ...material, ownerId: userId, createdAt: new Date().toISOString() });
};

export const getMaterials = async (): Promise<Material[]> => {
    return await getCollectionData("materials") as Material[];
};

export const updateMaterial = async (id: string, data: Partial<Material>) => {
    return updateDoc(doc(db, "materials", id), data);
};

export const deleteMaterial = async (id: string) => {
    return deleteDoc(doc(db, "materials", id));
};


// Stock
export const saveStockItem = async (item: StockItem) => {
    const userId = getUserId();
    if (!userId) throw new Error("User not authenticated");
    return addDoc(collection(db, "stock"), { ...item, ownerId: userId, createdAt: new Date().toISOString() });
};

export const getStockItems = async (): Promise<StockItem[]> => {
    return await getCollectionData("stock") as StockItem[];
};

export const updateStockItem = async (id: string, data: Partial<StockItem>) => {
    return updateDoc(doc(db, "stock", id), data);
};

export const deleteStockItem = async (id: string) => {
    return deleteDoc(doc(db, "stock", id));
};

// Events / Agenda
export const saveEvent = async (event: CalendarEvent) => {
    const userId = getUserId();
    if (!userId) throw new Error("User not authenticated");
    return addDoc(collection(db, "events"), { ...event, ownerId: userId, createdAt: new Date().toISOString() });
};

export const getEvents = async (): Promise<CalendarEvent[]> => {
    return await getCollectionData("events") as CalendarEvent[];
};

export const deleteEvent = async (id: string) => {
    return deleteDoc(doc(db, "events", id));
};
