// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAUQ1_Hv7rvLbD7jHKrA3a4DD_qe3ukGd4",
  authDomain: "librahub-cd407.firebaseapp.com",
  projectId: "librahub-cd407",
  storageBucket: "librahub-cd407.firebasestorage.app",
  messagingSenderId: "304810434717",
  appId: "1:304810434717:web:942f26fdd3160440833474",
  measurementId: "G-31WNMDN3HR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);