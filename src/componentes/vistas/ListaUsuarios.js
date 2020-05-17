import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Grid,
  Table,
  TableBody,
  Button,
  TableCell,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  DialogActions,
} from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import {
  obtenerUsuariosApp,
  actualizarRoles,
} from "../../redux/actions/usuarioAction";
import { enviarCorreoElectronico } from "../../redux/actions/emailAction";

import { useStateValue } from "../sesion/store";
import { openMensajePantalla } from "../sesion/actions/snackbarAction";
import { refrescarSesion } from "../sesion/actions/sesionAction";
import { consumerFirebase } from "../../server";
import { enviarNotification } from "../sesion/actions/notificationAction";

const style = {
  paper: {
    marginTop: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#f5f5f5",
  },
  container: {
    paddingTop: "8px",
  },
};

const ListaUsuarios = (props) => {
  const [{ sesion }, dispatch] = useStateValue();

  const [isLoading, setIsLoading] = useState(false);

  const [estadoDialog, abreDialog] = useState(false);
  const [usuarioDialog, llenarUsuarioDialog] = useState({
    email: "",
    telefono: "",
    roles: [],
  });

  const [selectRole, cambiarSelectRole] = useState("0");

  const listaArreglo = useSelector((state) => state.usuarioRedux.usuarios);
  const dispatchRedux = useDispatch();

  useEffect(() => {
    async function obtenerData() {
      await obtenerUsuariosApp(dispatchRedux);
    }

    if (!isLoading) {
      setIsLoading(true);
      obtenerData();
    }
  });

  const enviarEmail = (email) => {
    const obj = {
      email: email,
      titulo: "Mensaje desde App React Extremo",
      mensaje: "Gracias por participar del curso",
    };

    enviarCorreoElectronico(obj).then((dataServer) => {
      console.log(dataServer);
      openMensajePantalla(dispatch, {
        open: true,
        mensaje: "Se envio el correo electronico al destinatario " + email,
      });
    });
  };

  const abrirDialogConUsuario = (row) => {
    llenarUsuarioDialog(row);
    abreDialog(true);
  };

  const eventoEnCombobox = (event) => {
    cambiarSelectRole(event.target.value);
  };

  const agregarRol = async () => {
    if (selectRole === "0") {
      openMensajePantalla(dispatch, {
        open: true,
        mensaje: "Seleccione un role valido",
      });
      return;
    }

    if (!usuarioDialog.roles) {
      usuarioDialog.roles = [];
    }

    let existeRole = usuarioDialog.roles.filter(
      (rol) => rol.nombre === selectRole
    );

    if (existeRole.length === 0) {
      /***CREACION DEL  CUSTOM USER CLAIM */
      const customClaims = {};
      usuarioDialog.roles.map((_role) => {
        Object.defineProperty(customClaims, _role.nombre, {
          value: _role.estado,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      });

      Object.defineProperty(customClaims, selectRole, {
        value: true,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      /**FIN DE LA CREACION DEL CUSTOM USER CLAIM*/

      usuarioDialog.roles.push({ nombre: selectRole, estado: true });

      actualizarRoles(
        dispatchRedux,
        usuarioDialog,
        customClaims,
        props.firebase
      ).then((respuesta) => {
        if (respuesta.data.status !== "error") {
          refrescarSesion(props.firebase);

          openMensajePantalla(dispatch, {
            open: true,
            mensaje: "Se guardo exitosamente el rol de usuario",
          });
        } else {
          const rolesOriginal = usuarioDialog.roles.filter(
            (rol) => rol.nombre !== selectRole
          );
          llenarUsuarioDialog({
            ...usuarioDialog,
            roles: rolesOriginal,
          });

          openMensajePantalla(dispatch, {
            open: true,
            mensaje: respuesta.data.mensaje,
          });
        }

        obtenerUsuariosApp(dispatchRedux);
      });
    }
  };

  const removerRol = async (rol) => {
    const usuarioRolesOriginal = usuarioDialog.roles;

    const nuevoArregloRoles = usuarioDialog.roles.filter(
      (currentRol) => currentRol.nombre !== rol
    );

    usuarioDialog.roles = nuevoArregloRoles;

    const customClaims = {};
    nuevoArregloRoles.map((_rol) => {
      Object.defineProperty(customClaims, _rol.nombre, {
        value: _rol.estado,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    });

    Object.defineProperty(customClaims, rol, {
      value: false,
      writable: true,
      enumerable: true,
      configurable: true,
    });

    actualizarRoles(
      dispatchRedux,
      usuarioDialog,
      customClaims,
      props.firebase
    ).then((respuesta) => {
      if (respuesta.data.status !== "error") {
        refrescarSesion(props.firebase);

        openMensajePantalla(dispatch, {
          open: true,
          mensaje: "Se guardo exitosamente el rol de usuario",
        });
      } else {
        llenarUsuarioDialog({
          ...usuarioDialog,
          roles: usuarioRolesOriginal,
        });
        openMensajePantalla(dispatch, {
          open: true,
          mensaje: respuesta.data.mensaje,
        });
      }

      obtenerUsuariosApp(dispatchRedux);
    });
  };

  const enviarPushNotification = (usuarioFila) => {
    if (props.firebase.messagingValidation.isSupported()) {
      const listaToken = usuarioFila.tokenArreglo;
      const obj = {
        token: listaToken || [],
      };

      enviarNotification(obj).then((respuestaServidor) => {
        openMensajePantalla(dispatch, {
          open: true,
          mensaje: respuestaServidor.data.mensaje,
        });
      });
    } else {
      openMensajePantalla(dispatch, {
        open: true,
        mensaje: "Esta version de browser no soporta push notifications",
      });
    }
  };

  return (
    <Container style={style.container}>
      <Dialog
        open={estadoDialog}
        onClose={() => {
          abreDialog(false);
        }}
      >
        <DialogTitle>
          Roles del usuario {usuarioDialog.email || usuarioDialog.telefono}
        </DialogTitle>
        <DialogContent>
          <Grid container justify="center">
            <Grid item xs={6} sm={6}>
              <Select value={selectRole} onChange={eventoEnCombobox}>
                <MenuItem value={"0"}>Seleccione Rol</MenuItem>
                <MenuItem value={"ADMIN"}>Administrador</MenuItem>
                <MenuItem value={"OPERADOR"}>Operador</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={6} sm={6}>
              <Button
                color="secondary"
                onClick={() => agregarRol()}
                variant="contained"
              >
                Agregar
              </Button>
            </Grid>

            <Grid item xs={12} sm={12}>
              <Table>
                <TableBody>
                  {usuarioDialog.roles
                    ? usuarioDialog.roles.map((role, i) => (
                        <TableRow key={i}>
                          <TableCell aligh="left">{role.nombre}</TableCell>
                          <TableCell aligh="left">
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => removerRol(role.nombre)}
                            >
                              Eliminar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    : null}
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              abreDialog(false);
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Paper style={style.paper}>
        <Grid container justify="center">
          <Grid item xs={12} sm={12}>
            <Table>
              <TableBody>
                {listaArreglo
                  ? listaArreglo.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell align="left">
                          {row.email || row.telefono}
                        </TableCell>
                        <TableCell align="left">
                          {row.nombre
                            ? row.nombre + " " + row.apellido
                            : "No tiene nombre"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            onClick={() => abrirDialogConUsuario(row)}
                            color="primary"
                            size="small"
                          >
                            Roles
                          </Button>
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="contained"
                            onClick={() => enviarPushNotification(row)}
                            color="primary"
                            size="small"
                          >
                            Notificacion
                          </Button>
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="contained"
                            onClick={() => enviarEmail(row.email)}
                            color="primary"
                            size="small"
                          >
                            Enviar Mensaje
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  : ""}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default consumerFirebase(ListaUsuarios);
