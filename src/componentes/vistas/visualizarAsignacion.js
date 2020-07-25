import React, { Component } from "react";
import { consumerFirebase } from "../../server";
import {
  Container,
  Paper,
  Grid,
  Breadcrumbs,
  Link,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  MenuItem,
  Checkbox,
} from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import { openMensajePantalla } from "../sesion/actions/snackbarAction";
import { enviarNotification } from "../sesion/actions/notificationAction";


const style = {
  container: {
    paddingTop: "8px",
  },
  paper: {
    marginTop: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#f5f5f5",
  },
  link: {
    display: "flex",
  },
  homeIcon: {
    width: 20,
    height: 20,
    marginRight: "4px",
  },
  submit: {
    marginTop: 15,
    marginBottom: 10,
  },
  fotoInmueble: {
    height: "100px",
  },
};

class visualizarAsignacion extends Component {
  state = {
    asignacion: {
      fecha: "",
      asignacionPor: "",
      asignacionA: "",
      asunto: "",
      adjuntos: [],
      confirmarAsignacion: false,
    },
    usuarios: [],
    nombre_completo: "",
    confirmarAsignacionA: false
  };

  entradaDatoEnEstado = (e) => {
    let asignacion = Object.assign({}, this.state.asignacion);
    asignacion[e.target.name] = e.target.value;
    this.setState({ asignacion });
  };

  confirmoTarea = (e) => {
    this.setState({
      confirmarAsignacionA : e.target.checked
    });
  };

  async componentDidMount() {
    //Cargo asignacion
    const { id } = this.props.match.params;

    const asignacionCollection = this.props.firebase.db.collection(
      "Asignaciones"
    );
    const asignacionDB = await asignacionCollection.doc(id).get();
    let asignacionData = asignacionDB.data();
    //Ajusta el formato de la fecha
    let fechaString = asignacionData.fecha
      .toDate()
      .toLocaleString(undefined, { hour12: "true" });
    asignacionData.fecha = fechaString;

    this.setState({
      asignacion: asignacionData,
    });
    //Obtiene los usuarios para llenar el comboBox
    const usuariosQuery = this.props.firebase.db
      .collection("Users")
      .orderBy("apellido");
    usuariosQuery.get().then((resultados) => {
      let arrayUsuarios = resultados.docs.map((usuario) => {
        let id = usuario.id;
        let data = usuario.data();
        return { id, ...data };
      });

      this.setState({ usuarios: arrayUsuarios });
    });
    //Datos de confirmar asignacion
    const usuarioCollection = this.props.firebase.db.collection("Users");
    const usuarioDB = await usuarioCollection
      .doc(this.props.firebase.auth.currentUser.uid)
      .get();
    let usuarioData = usuarioDB.data();

    let nombre = usuarioData.nombre;
    let apellido = usuarioData.apellido;
    let nombreCompleto = nombre + " " + apellido;
    this.setState({nombre_completo: nombreCompleto});

    console.log(this.state.asignacion.asignacionA);
    console.log(this.state.nombre_completo);

    console.log(this.state.asignacion.confirmarAsignacion);

  }

  guardarAsignacion = async () => {

     // if(this.state.asignacion.asignacionA == this.state.nombre_completo){
    if (0 == 0) {
      console.log("son iguales");
        
      //this.setState({ confirmarAsignacionA : true });

      this.props.firebase.db
        .collection("Asignaciones")
        .doc(this.props.match.params.id)
        .update("confirmarAsignaciona", this.state.confirmarAsignacionA)
        .catch((error) => {
          openMensajePantalla({
            open: true,
            mensaje: error,
          });
        });

    } else {
      console.log("no son iguales");
    }


    console.log(this.state.asignacion.confirmarAsignacion);
    console.log(this.state.confirmarAsignacionA);
  };

  render() {
    return (
      <Container style={style.container}>
        <Paper style={style.paper}>
          <Grid item xs={12} md={8}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link color="inherit" style={style.link} href="/tramites">
                <HomeIcon style={style.homeIcon} />
                Trámites
              </Link>
              <Typography color="textPrimary">Asignaciones</Typography>
            </Breadcrumbs>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="fecha"
              label="Fecha"
              fullWidth
              onChange={this.entradaDatoEnEstado}
              value={this.state.asignacion.fecha}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="asignacionPor"
              label="Recibido por"
              fullWidth
              onChange={this.entradaDatoEnEstado}
              value={this.state.asignacion.asignacionPor}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="enviadoPor"
              label="Enviado por"
              fullWidth
              onChange={this.entradaDatoEnEstado}
              value={this.state.asignacion.asignacionA}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="asunto"
              label="Asunto"
              fullWidth
              rowsMax="4"
              multiline
              onChange={this.entradaDatoEnEstado}
              value={this.state.asignacion.asunto}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            Confirmo la asignación
            <Checkbox
              label="Confirmo Asignación"
              value="confirmarAsignacionA"
              checked={this.state.confirmarAsignacion}
              onChange={this.confirmoTarea}
              color="primary"
            />
        </Grid>

          <Grid item xs={12} sm={6}>
            <Table>
              <TableBody>
                {this.state.asignacion.adjuntos
                  ? this.state.asignacion.adjuntos.map((foto, i) => (
                      <TableRow key={i}>
                        <TableCell align="left">
                          <img src={foto} style={style.fotoInmueble} />
                        </TableCell>
                      </TableRow>
                    ))
                  : ""}
              </TableBody>
            </Table>
          </Grid>

          <Grid container justify="center">
            <Grid item xs={12} md={6}>
              <Button
                type="button"
                fullWidth
                variant="contained"
                size="large"
                color="primary"
                style={style.submit}
                onClick={this.guardarAsignacion}
              >
                Confirmo Asignación
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  }
}

export default consumerFirebase(visualizarAsignacion);
