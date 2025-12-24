import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, QuerySnapshot, DocumentData } from "firebase/firestore";

// Collection Names
const GARMENTS_COLLECTION = 'garments';
const ORDERS_COLLECTION = 'orders';
const STOCK_COLLECTION = 'stock';
const MATERIALS_COLLECTION = 'materials';
const CLIENTS_COLLECTION = 'clients';

// Interfaces
export interface BaseEntity {
    id?: string;
    [key: string]: any;
}

export interface Order extends BaseEntity {
    clientName: string;
    garmentName: string;
    garmentId?: string;
    size: string;
    price: number;
    paidAmount: number;
    status: string;
    createdAt?: string;
    appointmentDate?: string; // Date for measurements/fitting
    deliveryDate?: string; // Date for delivery
}

export interface GarmentMaterial {
    name: string;
    cost: number;
    quantity: number | string;
}

export interface Garment extends BaseEntity {
    name: string;
    price: number;
    size?: string;
    laborCost?: number;
    transportCost?: number;
    materials?: GarmentMaterial[];
}

export interface StockItem extends BaseEntity {
    garmentId?: string;
    // We should probably denormalize garmentName for easier display if garment is deleted or just for performance, 
    // but garmentId is key. legacy form showed garment info.
    garmentName?: string; // storing name just in case
    quantity: number;
    size: string;
    color?: string;
}

export interface Material extends BaseEntity {
    name: string;
    quantity: string | number; // Legacy uses string "1 unidad" sometimes
    price?: number;
    notes?: string;
    purchased?: boolean;
    createdAt?: string;
    source?: string; // Relation to Order or "Compras Extras"
}

export interface Sale extends BaseEntity {
    clientName: string;
    description: string;
    amount: number;
    date: string; // ISO date
}

export interface ClientMeasurements {
    waist?: number;
    hip?: number;
    chest?: number;
    back?: number;
    sleeve?: number;
    length?: number;
    pantsLength?: number;
    shoulder?: number;
    neck?: number;
    custom?: string; // For extra notes
}

export interface Client extends BaseEntity {
    name: string;
    phone?: string;
    notes?: string;
    measurements?: ClientMeasurements;
}

// Generic helper to map snapshot
const mapSnapshot = <T>(snapshot: QuerySnapshot<DocumentData>): T[] => {
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

// --- Orders ---
export async function getOrders(): Promise<Order[]> {
    try {
        const querySnapshot = await getDocs(collection(db, ORDERS_COLLECTION));
        return mapSnapshot<Order>(querySnapshot);
    } catch (e) {
        console.error("Error getting orders: ", e);
        return [];
    }
}

export async function getOrder(id: string): Promise<Order | undefined> {
    try {
        const docRef = doc(db, ORDERS_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Order;
        }
        return undefined;
    } catch (e) {
        console.error("Error getting order:", e);
        return undefined;
    }
}

export async function saveOrder(order: Order): Promise<string> {
    try {
        const { id, ...orderData } = order;
        const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderData);
        return docRef.id;
    } catch (e) {
        console.error("Error saving order: ", e);
        throw e;
    }
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    try {
        const docRef = doc(db, ORDERS_COLLECTION, id);
        await updateDoc(docRef, updates);
    } catch (e) {
        console.error("Error updating order: ", e);
        throw e;
    }
}

export async function deleteOrder(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, ORDERS_COLLECTION, id));
    } catch (e) {
        console.error("Error deleting order: ", e);
        throw e;
    }
}

// --- Garments ---
export async function getGarments(): Promise<Garment[]> {
    try {
        const querySnapshot = await getDocs(collection(db, GARMENTS_COLLECTION));
        return mapSnapshot<Garment>(querySnapshot);
    } catch (e) {
        console.error("Error getting garments: ", e);
        return [];
    }
}

export async function getGarmentById(id: string): Promise<Garment | null> {
    try {
        const docRef = doc(db, GARMENTS_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Garment;
        } else {
            return null;
        }
    } catch (e) {
        console.error("Error getting garment: ", e);
        return null;
    }
}

export async function saveGarment(garment: Garment): Promise<string> {
    try {
        const { id, ...data } = garment;
        const docRef = await addDoc(collection(db, GARMENTS_COLLECTION), data);
        return docRef.id;
    } catch (e) {
        console.error("Error saving garment: ", e);
        throw e;
    }
}

export async function updateGarment(id: string, updates: Partial<Garment>): Promise<void> {
    try {
        const docRef = doc(db, GARMENTS_COLLECTION, id);
        await updateDoc(docRef, updates);
    } catch (e) {
        console.error("Error updating garment: ", e);
        throw e;
    }
}

export async function deleteGarmentFromStorage(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, GARMENTS_COLLECTION, id));
    } catch (e) {
        console.error("Error deleting garment: ", e);
        throw e;
    }
}

// --- Stock ---
export async function getStockItems(): Promise<StockItem[]> {
    try {
        const querySnapshot = await getDocs(collection(db, STOCK_COLLECTION));
        return mapSnapshot<StockItem>(querySnapshot);
    } catch (e) {
        console.error("Error getting stock: ", e);
        return [];
    }
}

export async function saveStockItem(item: StockItem): Promise<string> {
    try {
        const { id, ...data } = item;
        const docRef = await addDoc(collection(db, STOCK_COLLECTION), data);
        return docRef.id;
    } catch (e) {
        console.error("Error saving stock item: ", e);
        throw e;
    }
}

export async function updateStockItem(id: string, updates: Partial<StockItem>): Promise<void> {
    try {
        const docRef = doc(db, STOCK_COLLECTION, id);
        await updateDoc(docRef, updates);
    } catch (e) {
        console.error("Error updating stock item: ", e);
        throw e;
    }
}

export async function deleteStockItem(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, STOCK_COLLECTION, id));
    } catch (e) {
        console.error("Error deleting stock item: ", e);
        throw e;
    }
}

// --- Materials ---
export async function getMaterials(): Promise<Material[]> {
    try {
        const querySnapshot = await getDocs(collection(db, MATERIALS_COLLECTION));
        return mapSnapshot<Material>(querySnapshot);
    } catch (e) {
        console.error("Error getting materials: ", e);
        return [];
    }
}

export async function saveMaterial(material: Material): Promise<string> {
    try {
        const { id, ...data } = material;
        const docRef = await addDoc(collection(db, MATERIALS_COLLECTION), data);
        return docRef.id;
    } catch (e) {
        console.error("Error saving material: ", e);
        throw e;
    }
}

export async function updateMaterial(id: string, updates: Partial<Material>): Promise<void> {
    try {
        const docRef = doc(db, MATERIALS_COLLECTION, id);
        await updateDoc(docRef, updates);
    } catch (e) {
        console.error("Error updating material: ", e);
        throw e;
    }
}

export async function deleteMaterial(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, MATERIALS_COLLECTION, id));
    } catch (e) {
        console.error("Error deleting material: ", e);
        throw e;
    }
}

// --- Sales ---
const SALES_COLLECTION = 'sales';

export async function getSales(): Promise<Sale[]> {
    try {
        const querySnapshot = await getDocs(collection(db, SALES_COLLECTION));
        return mapSnapshot<Sale>(querySnapshot);
    } catch (e) {
        console.error("Error getting sales: ", e);
        return [];
    }
}

export async function saveSale(sale: Sale): Promise<string> {
    try {
        const { id, ...data } = sale;
        const docRef = await addDoc(collection(db, SALES_COLLECTION), data);
        return docRef.id;
    } catch (e) {
        console.error("Error saving sale: ", e);
        throw e;
    }
}

export async function updateSale(id: string, updates: Partial<Sale>): Promise<void> {
    try {
        const docRef = doc(db, SALES_COLLECTION, id);
        await updateDoc(docRef, updates);
    } catch (e) {
        console.error("Error updating sale: ", e);
        throw e;
    }
}

export async function deleteSale(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, SALES_COLLECTION, id));
    } catch (e) {
        console.error("Error deleting sale: ", e);
        throw e;
    }
}

// --- Events ---
const EVENTS_COLLECTION = 'events';

export interface CalendarEvent extends BaseEntity {
    title: string;
    date: string; // ISO date YYYY-MM-DD
    type: 'delivery' | 'meeting' | 'other';
    description?: string;
}

export async function getEvents(): Promise<CalendarEvent[]> {
    try {
        const querySnapshot = await getDocs(collection(db, EVENTS_COLLECTION));
        return mapSnapshot<CalendarEvent>(querySnapshot);
    } catch (e) {
        console.error("Error getting events: ", e);
        return [];
    }
}

export async function saveEvent(event: CalendarEvent): Promise<string> {
    try {
        const { id, ...data } = event;
        const docRef = await addDoc(collection(db, EVENTS_COLLECTION), data);
        return docRef.id;
    } catch (e) {
        console.error("Error saving event: ", e);
        throw e;
    }
}

export async function deleteEvent(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, EVENTS_COLLECTION, id));
    } catch (e) {
        console.error("Error deleting event: ", e);
        throw e;
    }
}

// --- Clients ---
export async function getClients(): Promise<Client[]> {
    try {
        const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION));
        return mapSnapshot<Client>(querySnapshot);
    } catch (e) {
        console.error("Error getting clients: ", e);
        return [];
    }
}

export async function saveClient(client: Client): Promise<string> {
    try {
        const { id, ...data } = client;
        const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), data);
        return docRef.id;
    } catch (e) {
        console.error("Error saving client: ", e);
        throw e;
    }
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<void> {
    try {
        const docRef = doc(db, CLIENTS_COLLECTION, id);
        await updateDoc(docRef, updates);
    } catch (e) {
        console.error("Error updating client: ", e);
        throw e;
    }
}

export async function deleteClient(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, CLIENTS_COLLECTION, id));
    } catch (e) {
        console.error("Error deleting client: ", e);
        throw e;
    }
}
