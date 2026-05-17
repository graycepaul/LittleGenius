import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCgtFbca_KiZLCYfOsfV2gAvOuAiDIqImc",
  authDomain: "littlegenius-2a195.firebaseapp.com",
  projectId: "littlegenius-2a195",
  storageBucket: "littlegenius-2a195.firebasestorage.app",
  messagingSenderId: "663898887122",
  appId: "1:663898887122:web:ed14e0cd17026b3a626e0b",
  measurementId: "G-EWM8W9VMC7"
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
