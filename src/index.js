import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App.js";
import * as serviceWorker from "./serviceWorker";
import Firebase, { FirebaseContext } from "./server";
import { initialState } from "./componentes/sesion/initialState";
import { StateProvider } from "./componentes/sesion/store";
//import sesionReducer from "./componentes/sesion/reducers/sesionReducer";
import { mainReducer } from "./componentes/sesion/reducers";

const firebase = new Firebase();

ReactDOM.render(
  <FirebaseContext.Provider value={firebase}>
    <StateProvider initialState={initialState} reducer={mainReducer}>
      <App />
    </StateProvider>
  </FirebaseContext.Provider>,
  document.getElementById("root")
);

if(firebase.messagingValidation.isSupported()){

  if("serviceWorker" in navigator){
      navigator.serviceWorker
          .register("/firebase-messaging-sw.js")
          .then(registration => {
              console.log("Registracion completa en el service worker", registration.scope);
          })
          .catch(err =>{
              console.log("Fallo en registrar en el service worker")
          })
  }

}
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
