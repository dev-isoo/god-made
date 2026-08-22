 import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


const firebaseConfig = {

  apiKey: "AIzaSyDozjZf98Z8fKZKmEBNLdTc5AL1Hl5xplE",

  authDomain: "godmade-bb068.firebaseapp.com",

  projectId: "godmade-bb068",

  storageBucket: "godmade-bb068.firebasestorage.app",

  messagingSenderId: "786908568592",

  appId: "1:786908568592:web:a386b1ce8d46ef53e5fe95",

  measurementId: "G-RTNN19SKVC"

};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);


export {
  app,
  auth,
  db,
  storage
};