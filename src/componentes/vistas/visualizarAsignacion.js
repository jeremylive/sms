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
  Checkbox,
} from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import { openMensajePantalla } from "../sesion/actions/snackbarAction";


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
      asunto: "",
      adjuntos: [],
      confirmada: false,
      //ID del usuario
      asignacionPor: "",
      asignacionA: ""
    },
    //Nombre de la persona
    asignacionPorNombre: "",
    asignacionANombre: "",
    usuarioActual: ""
  };

  entradaDatoEnEstado = (e) => {
    let asignacion = Object.assign({}, this.state.asignacion);
    asignacion[e.target.name] = e.target.value;
    this.setState({ asignacion });
  };

  async componentDidMount() {
    //Cargo asignacion
    const { id } = this.props.match.params;

    const asignacionCollection = this.props.firebase.db.collection("Asignaciones");
    const asignacionDB = await asignacionCollection.doc(id).get();
    let asignacionData = asignacionDB.data();
    //Ajusta el formato de la fecha
    let fechaString = asignacionData.fecha.toDate().toLocaleString(undefined, { hour12: "true" });
    asignacionData.fecha = fechaString;
    this.setState({ asignacion: asignacionData });
    //Obtiene el nombre de los usuarios utilizando la id
    let usuarioQuery = this.props.firebase.db.collection("Users");
    let usuarioAsignacionPor = await usuarioQuery.doc(asignacionData.asignacionPor).get();
    let usuarioAsignacionA = await usuarioQuery.doc(asignacionData.asignacionA).get();
    let usuarioActual = await usuarioQuery.doc(this.props.firebase.auth.currentUser.uid).get();
    //Forma las strings de nombres
    let nombreUsuarioPor = usuarioAsignacionPor.data().nombre + " " + usuarioAsignacionPor.data().apellido;
    let nombreUsuarioA = usuarioAsignacionA.data().nombre + " " + usuarioAsignacionA.data().apellido;
    let nombreUsuarioActual = usuarioActual.data().nombre + " " + usuarioActual.data().apellido;

    this.setState({
      asignacionPorNombre: nombreUsuarioPor,
      asignacionANombre: nombreUsuarioA,
      usuarioActual: nombreUsuarioActual
    })
  }

  //Confirmar asignacion
  confirmarAsignacion = async () => {
    console.log(this.state.asignacion.asignacionA + "==" + this.props.firebase.auth.currentUser.uid)
    if(this.state.asignacion.asignacionA === this.props.firebase.auth.currentUser.uid){
      this.props.firebase.db
        .collection("Asignaciones")
        .doc(this.props.match.params.id)
        .update("confirmada", true)
        .then(() => {
          let asignacion_ = Object.assign({}, this.state.asignacion);
          asignacion_.confirmada = true;
          this.setState({asignacion:asignacion_});
        })
        .catch((error) => {
          openMensajePantalla({
            open: true,
            mensaje: error,
          })
        });
      alert("Cofirmación realizada! Por el usuario designado: "+this.state.usuarioActual);
    } else {
      alert("El usuario no puede confirmar ya que no le fue asignado esta tarea. El usuario ingresado en la aplicación "+
      this.state.usuarioActual + " no es el colaborador quien le fue asignado esta tarea.");
    }
  };


  render() {
    return (
      <Container style={style.container}>
        <Paper style={style.paper}>
          <Grid item xs={12} md={8}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link color="initial" style={style.link} href="/tramites">
                <HomeIcon style={style.homeIcon} />
                Trámites
              </Link>
              <Typography color="textPrimary">Asignacion</Typography>
            </Breadcrumbs>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="fecha"
              label="Fecha"
              fullWidth
              //onChange={this.entradaDatoEnEstado}
              value={this.state.asignacion.fecha}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="asignacionPor"
              label="Asignado por"
              fullWidth
              //onChange={this.entradaDatoEnEstado}
              value={this.state.asignacionPorNombre}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="asignacionA"
              label="Asignado a"
              fullWidth
              //onChange={this.entradaDatoEnEstado}
              value={this.state.asignacionANombre}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="asunto"
              label="Asunto"
              fullWidth
              rowsMax="4"
              multiline
              //onChange={this.entradaDatoEnEstado}
              value={this.state.asignacion.asunto}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            Asignación confirmada:
            <Checkbox
              label="Asignacion confirmada"
              checked={this.state.asignacion.confirmada}
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
                          <img alt={"Foto "+i} src={foto} style={style.fotoInmueble} />
                        </TableCell>
                      </TableRow>
                    ))
                  : ""}
              </TableBody>
            </Table>
          </Grid>

          <Grid item xs={12} md={6}>
            <Button
              type="button"
              variant="contained"
              size="large"
              color="primary"
              style={style.submit}
              onClick={this.confirmarAsignacion}
            >
              Confirmar asignación
            </Button>
          </Grid>
        </Paper>
      </Container>
    );
  }
}

export default consumerFirebase(visualizarAsignacion);
