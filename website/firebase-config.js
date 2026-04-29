const firebaseConfig = {
  apiKey: "AIzaSyDh-fKoteETN9dZEjA8oNCHD2SVmAXaVz0",
  authDomain: "bina-elektic.firebaseapp.com",
  databaseURL: "https://bina-elektic-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bina-elektic",
  storageBucket: "bina-elektic.firebasestorage.app",
  messagingSenderId: "823584262392",
  appId: "1:823584262392:web:6202d6c4fe1781c531930d",
  measurementId: "G-Y5E2WBE7M1"
};

// Initialize Firebase
let defaultApp;
if (!firebase.apps.length) {
  defaultApp = firebase.initializeApp(firebaseConfig);
} else {
  defaultApp = firebase.app();
}

const auth = firebase.auth();
const db = firebase.database();
