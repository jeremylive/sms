import app from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import 'firebase/storage';
import "firebase/messaging";

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

class Firebase {

  constructor() {
    app.initializeApp(config);
    this.db = app.firestore();
    this.auth = app.auth();
    this.storage = app.storage();
    this.authorization = app.auth;


    this.messagingValidation = app.messaging;
    if(this.messagingValidation.isSupported()){
        this.messaging = app.messaging();
        this.messaging.usePublicVapidKey("BK9GQoiCucOLg8oguKDZi4wlFSxXmSfCvRzs9HbQRY8ydPKZmjZugtVqds7WjPzM91hezr17_I4j6ln3bH0o3B8");
    }

    this.storage.ref().constructor.prototype.guardarDocumentos = function(documentos){
      var ref=this;
      return Promise.all(documentos.map(function(file){
        return ref.child(file.alias).put(file).then(snapshot =>{
          return ref.child(file.alias).getDownloadURL();
        })
      }))
    }
  }

  estaIniciado() {
    return new Promise(resolve => {
      this.auth.onAuthStateChanged(resolve)
    })
  }

  guardarDocumento = (nombreDocumento, documento) => this.storage.ref().child(nombreDocumento).put(documento);

  devolverDocumento = (documentoUrl) => this.storage.ref().child(documentoUrl).getDownloadURL();

  guardarDocumentos = (documentos) => this.storage.ref().guardarDocumentos(documentos);

  eliminarDocumento = (documento) => this.storage.ref().child(documento).delete();

}

export default Firebase;
