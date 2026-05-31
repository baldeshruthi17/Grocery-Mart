import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import appletConfig from "../../firebase-applet-config.json";

// Extract client credentials, prioritizing environment properties or user's custom project if available
const metaEnv = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyB3E2G6uPfMsdBZG0f1NQZhT6FXrGfmcZQ" || appletConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "jangaon-mart.firebaseapp.com" || appletConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "jangaon-mart" || appletConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "jangaon-mart.firebasestorage.app" || appletConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "239154164054" || appletConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:239154164054:web:abdb2ed627611d3359e6f7" || appletConfig.appId,
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with localized Database ID only for default applet project
const isAppletProject = firebaseConfig.projectId === appletConfig.projectId;
export const db = (isAppletProject && appletConfig.firestoreDatabaseId)
  ? getFirestore(app, appletConfig.firestoreDatabaseId)
  : getFirestore(app);
// Initialize Authentication and Storage
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connectivity check block as required by guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Please check your Firebase configuration: client is offline.");
    }
  }
}
testConnection();

export default app;
