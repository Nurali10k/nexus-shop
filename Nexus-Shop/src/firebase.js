import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAYww8En0RKfyHKLI7lgiMuGKc_IqYhZ_M",
  authDomain: "nexus-shop-31816.firebaseapp.com",
  projectId: "nexus-shop-31816",
  storageBucket: "nexus-shop-31816.firebasestorage.app",
  messagingSenderId: "106442497654",
  appId: "1:106442497654:web:9abc23cebbd9ffec080957",
  measurementId: "G-8MW1PP2RHS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');

export { app, auth, db, storage, googleProvider, githubProvider, signInWithPopup, signInWithRedirect, getRedirectResult };
