import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBbpLo8dUyj4HkNUIC7CFLP3bR5e2svV0",
  authDomain: "brainstorming-roundrobin.firebaseapp.com",
  projectId: "brainstorming-roundrobin",
  storageBucket: "brainstorming-roundrobin.appspot.com",
  messagingSenderId: "851082384508",
  appId: "1:851082384508:web:8b8e34c8dfb230819dbde9",
  measurementId: "G-YC57VZKVB8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
