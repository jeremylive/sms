import React, { Component } from "react";
import { Container, Dialog, DialogTitle, TableCell, TableRow, Button, Grid, Table, TableBody, Paper } from "@material-ui/core";
import { consumerFirebase } from "../../server";
import { openMensajePantalla } from "../sesion/actions/snackbarAction";
import { enviarNotification } from "../sesion/actions/notificationAction";
import { useStateValue } from "../sesion/store";
import { useState } from "react";

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
  form: {
    width: "100%",
    marginTop: 20,
  },
  submit: {
    marginTop: 15,
    marginBottom: 20,
  },
  avatar: {
    margin: 8,
    backgroundColor: "red",
  },
  comboBox: {
    width: 435,
  },
};

const UsuariosCreados = (props) => {
  const [{ sesion }, dispatch] = useStateValue();
  const firebase = props.firebase;

  let [user, updateUser] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    id: "",
    foto: "",
    role: "",
  });

  const userCollection = props.firebase.db.collection("Users");
  const userDB = userCollection.get();

  updateUser(userDB);


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

  return sesion ? (
    <Container style={style.container}>
      <Paper style={style.paper}>
        <Grid container justify="center">
          <Grid item xs={12} sm={12}>
            <Table>
              <TableBody>
                {user
                  ? user.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell align="left">
                          {row.email || row.role}
                        </TableCell>
                        <TableCell align="left">
                          {row.nombre
                            ? row.nombre + " " + row.apellido
                            : "No tiene nombre"}
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
                      </TableRow>
                    ))
                  : ""}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  ) : null;
};

export default consumerFirebase(UsuariosCreados);
