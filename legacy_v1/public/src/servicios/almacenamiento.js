import { db } from '../config/firebase.js';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";

// Nombre de la colección en Firestore
const COLLECTION_NAME = 'garments';
const ORDERS_COLLECTION = 'orders';
const STOCK_COLLECTION = 'stock';

/**
 * Obtiene todos los pedidos de la base de datos.
 * @returns {Promise<Array>} Lista de pedidos.
 */
export async function getOrders() {
    try {
        const querySnapshot = await getDocs(collection(db, ORDERS_COLLECTION));
        const orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        return orders;
    } catch (e) {
        console.error("Error obteniendo pedidos: ", e);
        return [];
    }
}

/**
 * Guarda un nuevo pedido.
 * @param {Object} order - Objeto del pedido.
 */
export async function saveOrder(order) {
    try {
        const { id, ...orderData } = order;
        const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderData);
        return docRef.id;
    } catch (e) {
        console.error("Error guardando pedido: ", e);
        throw e;
    }
}

/**
 * Actualiza un pedido existente.
 * @param {string} id - ID del pedido.
 * @param {Object} updates - Datos a actualizar.
 */
export async function updateOrder(id, updates) {
    try {
        const docRef = doc(db, ORDERS_COLLECTION, id);
        await updateDoc(docRef, updates);
    } catch (e) {
        console.error("Error actualizando pedido: ", e);
        throw e;
    }
}

/**
 * Elimina un pedido.
 * @param {string} id - ID del pedido.
 */
export async function deleteOrder(id) {
    try {
        await deleteDoc(doc(db, ORDERS_COLLECTION, id));
    } catch (e) {
        console.error("Error eliminando pedido: ", e);
        throw e;
    }
}

/**
 * Actualiza una prenda existente en la base de datos.
 * @param {string} id - ID de la prenda a actualizar.
 * @param {Object} updates - Objeto con los campos a actualizar.
 */
export async function updateGarment(id, updates) {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, updates);
    } catch (e) {
        console.error("Error actualizando documento: ", e);
        throw e;
    }
}

/**
 * Obtiene todas las prendas de la base de datos.
 * @returns {Promise<Array>} Lista de objetos de prendas.
 */
export async function getGarments() {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const garments = [];
        querySnapshot.forEach((doc) => {
            // Combina el ID del documento con sus datos
            garments.push({ id: doc.id, ...doc.data() });
        });
        return garments;
    } catch (e) {
        console.error("Error obteniendo documentos: ", e);
        return [];
    }
}

/**
 * Obtiene una prenda por su ID.
 * @param {string} id - ID de la prenda.
 * @returns {Promise<Object|null>} Objeto de la prenda o null si no existe.
 */
export async function getGarmentById(id) {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (e) {
        console.error("Error obteniendo documento: ", e);
        return null;
    }
}

/**
 * Guarda una nueva prenda en la base de datos.
 * @param {Object} garment - Objeto de la prenda a guardar.
 * @returns {Promise<string>} ID del documento creado.
 */
export async function saveGarment(garment) {
    try {
        // Excluimos el ID local si existe, ya que Firestore generará uno único
        const { id, ...garmentData } = garment;
        const docRef = await addDoc(collection(db, COLLECTION_NAME), garmentData);
        return docRef.id;
    } catch (e) {
        console.error("Error agregando documento: ", e);
        throw e;
    }
}

/**
 * Elimina una prenda de la base de datos por su ID.
 * @param {string} id - ID del documento a eliminar.
 */
export async function deleteGarmentFromStorage(id) {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (e) {
        console.error("Error eliminando documento: ", e);
        throw e;
    }
}

// ==================== FUNCIONES DE STOCK ====================

/**
 * Obtiene todos los items en stock.
 * @returns {Promise<Array>} Lista de items en stock.
 */
export async function getStockItems() {
    try {
        const querySnapshot = await getDocs(collection(db, STOCK_COLLECTION));
        const stockItems = [];
        querySnapshot.forEach((doc) => {
            stockItems.push({ id: doc.id, ...doc.data() });
        });
        return stockItems;
    } catch (e) {
        console.error("Error obteniendo stock: ", e);
        return [];
    }
}

/**
 * Guarda un nuevo item en stock.
 * @param {Object} stockItem - Objeto del item en stock.
 * @returns {Promise<string>} ID del documento creado.
 */
export async function saveStockItem(stockItem) {
    try {
        const { id, ...stockData } = stockItem;
        const docRef = await addDoc(collection(db, STOCK_COLLECTION), stockData);
        return docRef.id;
    } catch (e) {
        console.error("Error guardando item en stock: ", e);
        throw e;
    }
}

/**
 * Actualiza un item en stock.
 * @param {string} id - ID del item.
 * @param {Object} updates - Datos a actualizar.
 */
export async function updateStockItem(id, updates) {
    try {
        const docRef = doc(db, STOCK_COLLECTION, id);
        await updateDoc(docRef, updates);
    } catch (e) {
        console.error("Error actualizando item en stock: ", e);
        throw e;
    }
}

/**
 * Elimina un item del stock.
 * @param {string} id - ID del item.
 */
export async function deleteStockItem(id) {
    try {
        await deleteDoc(doc(db, STOCK_COLLECTION, id));
    } catch (e) {
        console.error("Error eliminando item del stock: ", e);
        throw e;
    }
}

// ==================== FUNCIONES DE MATERIALES ====================

const MATERIALS_COLLECTION = 'materials';

/**
 * Obtiene todos los materiales.
 * @returns {Promise<Array>} Lista de materiales.
 */
export async function getMaterials() {
    try {
        const querySnapshot = await getDocs(collection(db, MATERIALS_COLLECTION));
        const materials = [];
        querySnapshot.forEach((doc) => {
            materials.push({ id: doc.id, ...doc.data() });
        });
        return materials;
    } catch (e) {
        console.error("Error obteniendo materiales: ", e);
        return [];
    }
}

/**
 * Guarda un nuevo material.
 * @param {Object} material - Objeto del material.
 * @returns {Promise<string>} ID del documento creado.
 */
export async function saveMaterial(material) {
    try {
        const { id, ...materialData } = material;
        const docRef = await addDoc(collection(db, MATERIALS_COLLECTION), materialData);
        return docRef.id;
    } catch (e) {
        console.error("Error guardando material: ", e);
        throw e;
    }
}

/**
 * Actualiza un material existente.
 * @param {string} id - ID del material.
 * @param {Object} updates - Datos a actualizar.
 */
export async function updateMaterial(id, updates) {
    try {
        const docRef = doc(db, MATERIALS_COLLECTION, id);
        await updateDoc(docRef, updates);
    } catch (e) {
        console.error("Error actualizando material: ", e);
        throw e;
    }
}

/**
 * Elimina un material.
 * @param {string} id - ID del material.
 */
export async function deleteMaterial(id) {
    try {
        await deleteDoc(doc(db, MATERIALS_COLLECTION, id));
    } catch (e) {
        console.error("Error eliminando material: ", e);
        throw e;
    }
}

// ==================== FUNCIONES DE CLIENTES ====================

const CLIENTS_COLLECTION = 'clients';

export async function getClients() {
    try {
        const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION));
        const clients = [];
        querySnapshot.forEach((doc) => {
            clients.push({ id: doc.id, ...doc.data() });
        });
        return clients;
    } catch (e) {
        console.error("Error obteniendo clientes: ", e);
        return [];
    }
}

export async function saveClient(client) {
    try {
        const { id, ...clientData } = client;
        const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), clientData);
        return docRef.id;
    } catch (e) {
        console.error("Error guardando cliente: ", e);
        throw e;
    }
}

export async function updateClient(id, updates) {
    try {
        const docRef = doc(db, CLIENTS_COLLECTION, id);
        await updateDoc(docRef, updates);
    } catch (e) {
        console.error("Error actualizando cliente: ", e);
        throw e;
    }
}

export async function deleteClient(id) {
    try {
        await deleteDoc(doc(db, CLIENTS_COLLECTION, id));
    } catch (e) {
        console.error("Error eliminando cliente: ", e);
        throw e;
    }
}
