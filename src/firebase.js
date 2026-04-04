import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBcNl5NItIzxJ4H1M-KoAaJQYMe0uRjg4I",
  authDomain: "mzansibuild-d6d43.firebaseapp.com",
  projectId: "mzansibuild-d6d43",
  storageBucket: "mzansibuild-d6d43.firebasestorage.app",
  messagingSenderId: "455889799912",
  appId: "1:455889799912:web:1a7b3120baa63a80ea975d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;