import React, { useEffect } from "react";
import "./App.css";

import ListaInmuebles from "./componentes/vistas/ListaInmuebles";
//import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import theme from "./theme/theme";
import AppNavbar from "./componentes/layout/AppNavbar";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import RegistrarUsuarios from "./componentes/seguridad/RegistrarUsuarios";
import Login from "./componentes/seguridad/Login";
import { FirebaseContext } from "./server";
import { useStateValue } from "./componentes/sesion/store";
import { Snackbar } from "@material-ui/core";
//import { openSnackbarReducer } from "./sesion/reducers/openSnackbarReducer";
import RutaAutenticada from "./componentes/seguridad/RutaAutenticada";
import PerfilUsuario from "./componentes/seguridad/PerfilUsuario";
import NuevoInmueble from "./componentes/vistas/NuevoInmueble";
import EditarInmueble from "./componentes/vistas/EditarInmueble";
import ListaTranslado from "./componentes/vistas/ListaTranslado";
import NuevoTranslado from "./componentes/vistas/NuevoTranslado";
import NuevoAsignacion from "./componentes/vistas/NuevaAsignacion";
import NuevaRecepcion from "./componentes/vistas/NuevaRecepcion";

function App(props) {
  let firebase = React.useContext(FirebaseContext);
  const [autenticacionIniciada, setupFirebaseInicial] = React.useState(false);

  const [{ openSnackbar }, dispatch] = useStateValue();

  useEffect(() => {
    firebase.estaIniciado().then((val) => {
      setupFirebaseInicial(val);
    });
  });


  return autenticacionIniciada !== false ? (
    <React.Fragment>
      <Snackbar
        anchorOrigin = {{vertical:"bottom", horizontal:"center"}}
        open={openSnackbar ? openSnackbar.open : false}
        autoHideDuration={3000}
        ContentProps={{
          "aria-describedby": "message-id"
        }}
        message={
          <span id="message-id">
            {openSnackbar ? openSnackbar.mensaje : ""}
          </span>
        }
        onClose = {()=>
          dispatch({
            type: "OPEN_SNACKBAR",
            openMensaje: {
              open: false,
              mensaje: ""
            }
          })
        }
      ></Snackbar>
      <Router>
        <MuiThemeProvider theme={theme}>
          <AppNavbar />

          <Grid container>
            <Switch>  
              {/* <RutaAutenticada exact path="/" autenticadoFirebase={firebase.auth.currentUser} component={ListaInmuebles} />
              <RutaAutenticada exact path="/inmueble/nuevo" autenticadoFirebase={firebase.auth.currentUser} component={NuevoInmueble} />
              <RutaAutenticada exact path="/inmueble/:id" autenticadoFirebase={firebase.auth.currentUser} component={EditarInmueble} />
              */}

              <RutaAutenticada exact path="/auth/perfil" autenticadoFirebase={firebase.auth.currentUser} component={PerfilUsuario} />
              <RutaAutenticada exact path="/tramite/translado" autenticadoFirebase={firebase.auth.currentUser} component={ListaTranslado} />
              
              <RutaAutenticada exact path="/tramite/translado/nuevo" autenticadoFirebase={firebase.auth.currentUser} component={NuevoTranslado} />
              <RutaAutenticada exact path="/tramite/asignacion/nuevo" autenticadoFirebase={firebase.auth.currentUser} component={NuevoAsignacion} />
              <RutaAutenticada exact path="/tramite/recepcion/nuevo" autenticadoFirebase={firebase.auth.currentUser} component={NuevaRecepcion} />
                       

              <Route
                path="/auth/registrarusuario"
                exact
                component={RegistrarUsuarios}
              />
              
              <Route path="/auth/login" exact component={Login} />
            </Switch>
          </Grid>
        </MuiThemeProvider>
      </Router>
    </React.Fragment>
  ) : null;
}

export default App;
