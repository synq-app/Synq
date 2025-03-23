import { initializeApp } from "firebase/app";
import { getAuth, signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword, initializeAuth } from "firebase/auth"; // Import necessary Firebase Auth methods
import 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { ENV_VARS } from '../../../config';


const firebaseConfig = {
  apiKey: ENV_VARS.apiKey ,
  authDomain: ENV_VARS.authDomain,
  projectId: ENV_VARS.projectId,
  storageBucket: ENV_VARS.storageBucket,
  messagingSenderId: ENV_VARS.messagingSenderId,
  appId: ENV_VARS.appId,
  measurementId: ENV_VARS.measurementId
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app);
const storage = getStorage(app);


export { auth, signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword, app, storage }; // Export auth and necessary methods
