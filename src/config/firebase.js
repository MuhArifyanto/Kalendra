// Configuration for Firebase Authentication
export const firebaseConfig = {
  apiKey: "AIzaSyDujQBMfR2UuoHHurXXhQkwS3GDD7wSvZM",
  authDomain: "bebas-2ccb8.firebaseapp.com",
  projectId: "bebas-2ccb8",
  storageBucket: "bebas-2ccb8.firebasestorage.app",
  messagingSenderId: "483083409061",
  appId: "1:483083409061:web:5278e4f4437a68295c9f4c",
  measurementId: "G-FW14YYDHRG"
};

let sdkPromise = null;

export function loadFirebaseSDK() {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Browser environment required.'));
    }

    if (window.firebase?.auth) {
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(firebaseConfig);
      }
      return resolve(window.firebase);
    }

    // Fallback dynamic script loader if not already loaded from index.html
    const appScript = document.createElement('script');
    appScript.src = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js';
    appScript.onload = () => {
      const authScript = document.createElement('script');
      authScript.src = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js';
      authScript.onload = () => {
        if (!window.firebase.apps.length) {
          window.firebase.initializeApp(firebaseConfig);
        }
        resolve(window.firebase);
      };
      authScript.onerror = () => reject(new Error('Gagal memuat Firebase Auth SDK. Periksa koneksi internet Anda.'));
      document.head.appendChild(authScript);
    };
    appScript.onerror = () => reject(new Error('Gagal memuat Firebase App SDK. Periksa koneksi internet Anda.'));
    document.head.appendChild(appScript);
  });

  return sdkPromise;
}

export async function loginWithGooglePopup() {
  const firebase = await loadFirebaseSDK();
  const auth = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  
  const result = await auth.signInWithPopup(provider);
  const user = result.user;
  
  const name = user.displayName || user.email.split('@')[0];
  const initial = (name.charAt(0) || 'G').toUpperCase();
  
  return {
    id: user.uid,
    name: name,
    email: user.email,
    avatar: initial,
    photoURL: user.photoURL,
    createdAt: user.metadata?.creationTime || new Date().toISOString()
  };
}

export async function logoutFirebase() {
  try {
    const firebase = await loadFirebaseSDK();
    if (firebase?.auth) {
      await firebase.auth().signOut();
    }
  } catch (err) {
    console.warn('Firebase logout warning:', err);
  }
}

export default firebaseConfig;
