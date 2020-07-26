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

class visualizarTraslado extends Component {
  state = {
    traslado: {
      fecha: "",
      asunto: "",
      adjuntos: [],
      confirmado: false,
      //ID del usuario
      trasladoPor: "",
      trasladoA: ""
    },
    //Nombre de la persona
    trasladoPorNombre: "",
    trasladoANombre: "",
    usuarioActual: ""
  };

  entradaDatoEnEstado = (e) => {
    let traslado = Object.assign({}, this.state.traslado);
    traslado[e.target.name] = e.target.value;
    this.setState({ traslado });
  };

  async componentDidMount() {
    const { id } = this.props.match.params;

    const trasladoCollection = this.props.firebase.db.collection("Traslados");
    const trasladoDB = await trasladoCollection.doc(id).get();
    let trasladoData = trasladoDB.data();
    //Ajusta el formato de la fecha
    let fechaString = trasladoData.fecha.toDate().toLocaleString(undefined, { hour12: "true" });
    trasladoData.fecha = fechaString;
    this.setState({ traslado: trasladoData });
    //Obtiene el nombre de los usuarios utilizando la id
    let usuarioQuery = this.props.firebase.db.collection("Users");
    let usuarioTrasladoPor = await usuarioQuery.doc(trasladoData.trasladoPor).get();
    let usuarioTrasladoA = await usuarioQuery.doc(trasladoData.trasladoA).get();
    let usuarioActual = await usuarioQuery.doc(this.props.firebase.auth.currentUser.uid).get();
    //Forma las strings de nombres
    let nombreUsuarioPor = usuarioTrasladoPor.data().nombre + " " + usuarioTrasladoPor.data().apellido;
    let nombreUsuarioA = usuarioTrasladoA.data().nombre + " " + usuarioTrasladoA.data().apellido;
    let nombreUsuarioActual = usuarioActual.data().nombre + " " + usuarioActual.data().apellido;

    this.setState({
      trasladoPorNombre: nombreUsuarioPor,
      trasladoANombre: nombreUsuarioA,
      usuarioActual: nombreUsuarioActual
    })
  }

//Confirmar traslado
confirmarTraslado = async () => {
  console.log(this.state.traslado.trasladoA + "==" + this.props.firebase.auth.currentUser.uid)
  if(this.state.traslado.trasladoA === this.props.firebase.auth.currentUser.uid){
    this.props.firebase.db
      .collection("Traslados")
      .doc(this.props.match.params.id)
      .update("confirmado", true)
      .then(() => {
        let traslado_ = Object.assign({}, this.state.traslado);
        traslado_.confirmado = true;
        this.setState({traslado:traslado_});
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
              <Typography color="textPrimary">Traslado</Typography>
            </Breadcrumbs>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="fecha"
              label="Fecha"
              fullWidth
              //onChange={this.entradaDatoEnEstado}
              value={this.state.traslado.fecha}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="trasladoPor"
              label="Trasladado por"
              fullWidth
              //onChange={this.entradaDatoEnEstado}
              value={this.state.trasladoPorNombre}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="trasladoA"
              label="Trasladado a"
              fullWidth
              //onChange={this.entradaDatoEnEstado}
              value={this.state.trasladoANombre}
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
              value={this.state.traslado.asunto}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            Traslado confirmado:
            <Checkbox
              label="Traslado confirmado"
              checked={this.state.traslado.confirmado}
              color="primary"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Table>
              <TableBody>
                {this.state.traslado.adjuntos
                  ? this.state.traslado.adjuntos.map((foto, i) => (
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
              onClick={this.confirmarTraslado}
            >
              Confirmar traslado
            </Button>
          </Grid>
        </Paper>
      </Container>
    );
  }
}

export default consumerFirebase(visualizarTraslado);
