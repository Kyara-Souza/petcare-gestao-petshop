const firebaseConfig = {
  apiKey: "AIzaSyCVfBhDqtCx7J2ruXFJk94ILTANh2-gnXM",
  authDomain: "pet-care-98f16.firebaseapp.com",
  projectId: "pet-care-98f16",
  storageBucket: "pet-care-98f16.firebasestorage.app",
  messagingSenderId: "393508476215",
  appId: "1:393508476215:web:0b8d023e7c77aae82eb6b2",
  measurementId: "G-N8GF5XT91F"
};

const app = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const db = firebase.firestore();
