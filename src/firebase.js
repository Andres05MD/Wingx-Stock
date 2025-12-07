// Importa las funciones necesarias de los SDKs que necesitas
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase para tu aplicación web
// Para Firebase JS SDK v7.20.0 y posteriores, measurementId es opcional
const firebaseConfig = {
    apiKey: "AIzaSyBq2UhsG7lYR4z5SM9Ugp1c6ETSdCAEbnk",
    authDomain: "wingx-stock.firebaseapp.com",
    projectId: "wingx-stock",
    storageBucket: "wingx-stock.firebasestorage.app",
    messagingSenderId: "379122029948",
    appId: "1:379122029948:web:3f8136038b8fc2b0ee80f9",
    measurementId: "G-FXX7W4QMHR"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializar y exportar la base de datos Firestore
const db = getFirestore(app);

export { db };