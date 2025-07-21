// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";



const firebaseConfig = {
  apiKey: "AIzaSyACNkF3676oHXDOcBAePP3hMcFuHsqehy4",
  authDomain: "agu-event-cpx.firebaseapp.com",
  projectId: "agu-event-cpx",
  storageBucket: "agu-event-cpx.firebasestorage.app",
  messagingSenderId: "137090996592",
  appId: "1:137090996592:web:d0dafcd0e22a72d90197b5",
  measurementId: "G-G1C6Y5H2CC"
};

// Khởi tạo
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const statusBox = document.getElementById("status");

document.getElementById("registerBtn").addEventListener("click", async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      emailInput.value,
      passwordInput.value
    );
    statusBox.innerText = ` Registered: ${userCredential.user.email}`;
    alert("Account created successfully! Please log in.");
    const userRef = doc(db, "users", userCredential.user.uid);
    /// khởi tạo dữ liệu người dùng trong Firestore
    await setDoc(userRef, {
    email: userCredential.user.email,
    uid: userCredential.user.uid,
    createdAt: new Date().toISOString(),
    // name từ phần đầu email, ví dụ: nếu email là abc@mail.com thành abc"
    name: userCredential.user.email.split('@')[0],
    role: "member",
    point: 0,
    university: "AGU",
    });
    /// ending  


  } catch (error) {
    statusBox.innerText = ` ${error.message}`;
    alert("Error: " + error.message);
  }
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      emailInput.value,
      passwordInput.value
    );
    statusBox.innerText = ` Logged in as: ${userCredential.user.email}`;
    alert("Login successful! Welcome " + userCredential.user.email);
    const userRef = doc(db, "users", userCredential.user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        // Hiển thị dữ liệu người dùng hoặc chuyển hướng đến trang cá nhân
        window.location.href = "./personalAccpage.html"; // Chuyển hướng đến trang cá nhân
    } else {
     console.warn("No user data found!");
    }

  } catch (error) {
    statusBox.innerText = ` ${error.message}`;
    alert("Error: " + error.message);
  }
});

