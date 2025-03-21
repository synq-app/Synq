import { initializeApp } from "firebase/app";
import { getAuth, signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword, initializeAuth } from "firebase/auth"; // Import necessary Firebase Auth methods
import 'firebase/firestore';
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "todo",
  authDomain: "todo",
  projectId: "todo",
  storageBucket: "todo",
  messagingSenderId: "todo",
  appId: "todo",
  measurementId: "todo"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app);
const storage = getStorage(app);


export { auth, signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword, app, storage }; // Export auth and necessary methods
