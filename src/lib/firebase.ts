import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBq2UhsG7lYR4z5SM9Ugp1c6ETSdCAEbnk",
    authDomain: "wingx-stock.firebaseapp.com",
    projectId: "wingx-stock",
    storageBucket: "wingx-stock.firebasestorage.app",
    messagingSenderId: "379122029948",
    appId: "1:379122029948:web:3f8136038b8fc2b0ee80f9",
    measurementId: "G-FXX7W4QMHR"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics (client-side only)
let analytics;
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

const auth = getAuth(app);

export { app, db, analytics, auth };
