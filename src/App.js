import React, { useEffect } from "react";
import "./App.css";

import ListaInmuebles from "./componentes/vistas/ListaInmuebles";
//import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import theme from "./theme/theme";
import AppNavbar from "./componentes/layout/AppNavbar";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
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
import ListaTramites from "./componentes/vistas/ListaTramites";
import NuevoTraslado from "./componentes/vistas/NuevoTraslado";
import NuevoAsignacion from "./componentes/vistas/NuevaAsignacion";
import LoginTelefono from "./componentes/seguridad/LoginTelefono";
import NuevaRecepcion from "./componentes/vistas/NuevaRecepcion";

import store from "./redux/store";
import { Provider } from "react-redux";

import { openMensajePantalla } from "./componentes/sesion/actions/snackbarAction";
import visualizarRecepcion from "./componentes/vistas/visualizarRecepcion";
import ListaUsuarios from "./componentes/vistas/ListaUsuarios";
import visualizarTraslado from "./componentes/vistas/visualizarTraslado";
import visualizarAsignacion from "./componentes/vistas/visualizarAsignacion";
import UsuariosCreados from "./componentes/vistas/UsuariosCreados";

import verNotas from "./componentes/vistas/verNotas";
import NuevaNota from "./componentes/vistas/NuevaNota";

function App(props) {
  let firebase = React.useContext(FirebaseContext);
  const [autenticacionIniciada, setupFirebaseInicial] = React.useState(false);

  const [{ openSnackbar }, dispatch] = useStateValue();

  useEffect(() => {
    firebase.estaIniciado().then((val) => {
      setupFirebaseInicial(val);
    });

    if (firebase.messagingValidation.isSupported()) {
      firebase.messaging.onMessage((payload) => {
        openMensajePantalla(dispatch, {
          open: true,
          mensaje:
            payload.notification.title + ". " + payload.notification.body,
        });
      });
    }
  });

  return autenticacionIniciada !== false ? (
    <Provider store={store}>
      <React.Fragment>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={openSnackbar ? openSnackbar.open : false}
          autoHideDuration={3000}
          ContentProps={{
            "aria-describedby": "message-id",
          }}
          message={
            <span id="message-id">
              {openSnackbar ? openSnackbar.mensaje : ""}
            </span>
          }
          onClose={() =>
            dispatch({
              type: "OPEN_SNACKBAR",
              openMensaje: {
                open: false,
                mensaje: "",
              },
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

                <RutaAutenticada
                  exact
                  path="/auth/perfil"
                  autenticadoFirebase={firebase.auth.currentUser}
                  component={PerfilUsuario}
                />
                <RutaAutenticada
                  exact
                  path="/tramites"
                  autenticadoFirebase={firebase.auth.currentUser}
                  component={ListaTramites}
                />

                <RutaAutenticada
                  exact
                  path="/tramite/traslado/nuevo"
                  autenticadoFirebase={firebase.auth.currentUser}
                  component={NuevoTraslado}
                />
                <RutaAutenticada
                  exact
                  path="/tramite/asignacion/nuevo"
                  autenticadoFirebase={firebase.auth.currentUser}
                  component={NuevoAsignacion}
                />
                <RutaAutenticada
                  exact
                  path="/tramite/recepcion/nuevo"
                  autenticadoFirebase={firebase.auth.currentUser}
                  component={NuevaRecepcion}
                />
                <RutaAutenticada
                  exact
                  path="/tramite/notas/:id/nueva"
                  autenticadoFirebase={firebase.auth.currentUser}
                  component={NuevaNota}
                />
                <RutaAutenticada
                  exact
                  path="/tramite/recepcion/:id"
                  autenticadoFirebase={firebase.auth.currentUser}
                  component={visualizarRecepcion}
                />
                <RutaAutenticada
                  exact
                  path="/tramite/asignacion/:id"
                  autenticadoFirebase={firebase.auth.currentUser}
                  component={visualizarAsignacion}
                />
                <RutaAutenticada
                  exact
                  path="/tramite/traslado/:id"
                  autenticadoFirebase={firebase.auth.currentUser}
                  component={visualizarTraslado}
                />
                <RutaAutenticada
                  exact
                  path="/tramite/notas/:id"
                  autenticadoFirebase={firebase.auth.currentUser}
                  component={verNotas}
                />
                <RutaAutenticada
                  exact
                  path="/listausuarios"
                  autenticadoFirebase={firebase.auth.currentUser}
                  component={ListaUsuarios}
                />

                {/* <Route
                  path="/auth/usuariosCreados"
                  exact
                  component={UsuariosCreados}
                /> */}

                <Route
                  path="/auth/registrarusuario"
                  exact
                  component={RegistrarUsuarios}
                />

                <Route path="/auth/login" exact component={Login} />
                <Route
                  path="/auth/loginTelefono"
                  exact
                  component={LoginTelefono}
                />
                {/*Redirige a la pagina de login en lugar de mostrar una página en blanco
                <Route exact path="/">
                  <Redirect to="/auth/login" />
                </Route>
                */}

              </Switch>
            </Grid>
          </MuiThemeProvider>
        </Router>
      </React.Fragment>
    </Provider>
  ) : null;
}

export default App;
