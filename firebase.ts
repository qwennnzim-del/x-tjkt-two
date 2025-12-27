
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Konfigurasi asli milik X TJKT TWO
const firebaseConfig = {
  apiKey: "AIzaSyBYiDoFZC1lPhgJcqkN-wctmSIHj2OzQYY",
  authDomain: "tjkt-two.firebaseapp.com",
  projectId: "tjkt-two",
  storageBucket: "tjkt-two.firebasestorage.app",
  messagingSenderId: "1009609789902",
  appId: "1:1009609789902:web:c609868dea4dcb4638db9f",
  measurementId: "G-3H3K86JJ5V"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const momentsCollection = collection(db, "moments");
