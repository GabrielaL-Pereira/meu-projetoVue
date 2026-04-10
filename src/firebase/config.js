import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6stM5LsKhBOJBtUxVmyO-DwBxIxG4iNo",
  authDomain: "vue-firebase-pinia-d0d4b.firebaseapp.com",
  projectId: "vue-firebase-pinia-d0d4b",
  storageBucket: "vue-firebase-pinia-d0d4b.firebasestorage.app",
  messagingSenderId: "439134909057",
  appId: "1:439134909057:web:571eb9bd0f53844d291380"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };