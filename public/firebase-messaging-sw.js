importScripts("https://www.gstatic.com/firebasejs/7.6.2/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/7.6.2/firebase-messaging.js");

const config = {
    apiKey: "AIzaSyA3oS-J8wff3FL6Pbf2pxOcvAOlnTE2ue0",
    authDomain: "smssendporwerfree.firebaseapp.com",
    databaseURL: "https://smssendporwerfree.firebaseio.com",
    projectId: "smssendporwerfree",
    storageBucket: "smssendporwerfree.appspot.com",
    messagingSenderId: "128246135432",
    appId: "1:128246135432:web:1261eedfef60b361f5bd3d",
    measurementId: "G-QGE008BGQT"
};

firebase.initializeApp(config);
const messaging = firebase.messaging();