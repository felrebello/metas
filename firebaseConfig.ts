import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase - Substitua com suas credenciais do projeto Firebase
// Para obter essas credenciais:
// 1. Acesse https://console.firebase.google.com/
// 2. Selecione seu projeto "nort-metas"
// 3. Vá em Configurações do Projeto > Geral
// 4. Role até "Seus aplicativos" e selecione o app web
// 5. Copie as credenciais abaixo
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nort-metas.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nort-metas",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nort-metas.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore
export const db = getFirestore(app);

export default app;
