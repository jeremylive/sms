//descargo y instalo nodejs y visual studio
//--terminal
//Creo proyecto REACT
npx create-react-app sms-app
//Agrego librerias
npm install @material-ui/core
//Dentro de index.html agrego esto en la linea 18 y 19
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
//librerias
npm install --save react-router-dom
npm install @material-ui/icons
npm install @material-ui/styles
npm install -g firebase-tools
{
firebase login
..
Y
Logearse..
..
}
{
firebase init
Y
2,4y5 yes
Use an existing project
chose :)
enter
enter
N
N
enter
}
..
npm install recompose
npm install firebase
...
npm run-script build
--
En package.json agregar esta linea
    "postbuild": "rimraf build/**/*.map",
dentro de "scripts" para que no se vea el codigo 
--
Entrar a firebase.json y cambiar
"public" por "build"
--
Meterlo a producion...=>
npm install -g firebase-tools
firebase login
firebase init
=>
Seleccionar Hosting
Escribir build
No
No
No
firebase deploy
//
instalar libreria=>
npm install firebaseui --save
//
...
=>crear carpeta Functions: dentro de Functions
npm install -g firebase-tools
firebase init
Y
Functions
Use an existing.
TypeScript
Y
Y
...... firebase deploy  .. cuando ya este el codigo



.. dentro de funtions
npm i glob
npm i camelcase
npm install @types/glob
//
=> Librerias con Type Headers dentro de functions
npm i cors
npm i @types/cors
.
npm i nodemailer
npm i @types/nodemailer
.
npm i express
npm i @types/express
.
npm i cookie-parser
npm i @types/cookie-parser
..
Dentro de Funtions =>
firebase deploy --only functions
Y

... Hacer esto de arriba, cada vez que quiera agregar un function

...///Intalar librerias de Redux
npm i redux
npm i react-redux
npm i redux-thunk
npm i axios

=>htttps://www.google.com/settings/security/lesssecureapps

///// importar en Appp.js
import store from './redux/store';
import {Provider} from 'react-redux';

<Provider store={store}>
 <React.Fragment...
<
<
</>

