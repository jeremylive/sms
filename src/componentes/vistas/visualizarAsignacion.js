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
} from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import {openMensajePantalla} from  '../sesion/actions/snackbarAction';
import {enviarNotification} from '../sesion/actions/notificationAction';


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
    },
  };

  entradaDatoEnEstado = (e) => {
    let asignacion = Object.assign({}, this.state.asignacion);
    asignacion[e.target.name] = e.target.value;
    this.setState({ asignacion });
  };

  async componentDidMount() {
    const { id } = this.props.match.params;

    const asignacionCollection = this.props.firebase.db.collection("Asignaciones");
    const asignacionDB = await asignacionCollection.doc(id).get();
    let asignacionData = asignacionDB.data();
    //Ajusta el formato de la fecha
    let fechaString = asignacionData.fecha.toDate().toLocaleString(undefined, { hour12: "true" });
    asignacionData.fecha = fechaString;

    this.setState({
      asignacion: asignacionData,
    });
  }

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
        </Paper>
      </Container>
    );
  }
}

export default consumerFirebase(visualizarAsignacion);
