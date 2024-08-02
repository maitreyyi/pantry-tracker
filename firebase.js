// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyI0VOm0xoLYQ5Mc_wnf-U0zxPOqYlU3U",
  authDomain: "pantry-tracker-9b6e8.firebaseapp.com",
  projectId: "pantry-tracker-9b6e8",
  storageBucket: "pantry-tracker-9b6e8.appspot.com",
  messagingSenderId: "817809864059",
  appId: "1:817809864059:web:23a596ae415ea6a5ec39de"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}