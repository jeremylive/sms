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
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";


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

class visualizarRecepcion extends Component {
  state = {
    recepcion: {
      fecha: "",
      recibidoPor: "",
      enviadoPor: "",
      asunto: "",
      adjuntos: [],
    },
    recibidoPorNombre: ""
  };

  entradaDatoEnEstado = (e) => {
    let recepcion = Object.assign({}, this.state.recepcion);
    recepcion[e.target.name] = e.target.value;
    this.setState({ recepcion });
  };

  async componentDidMount() {
    const { id } = this.props.match.params;

    const recepcionCollection = this.props.firebase.db.collection("Recepciones" );
    const recepcionDB = await recepcionCollection.doc(id).get();
    let recepcionData = recepcionDB.data();
    //Ajusta el formato de la fecha
    let fechaString = recepcionData.fecha.toDate().toLocaleString(undefined, { hour12: "true" });
    recepcionData.fecha = fechaString;
    this.setState({
      recepcion: recepcionData,
    });
    //Obtiene el nombre de los usuarios utilizando la id
    let usuarioQuery = this.props.firebase.db.collection("Users");
    let usuarioSnapshot = await usuarioQuery.doc(recepcionData.recibidoPor).get();
    let usuarioData = usuarioSnapshot.data();
    let nombreUsuario = usuarioData.nombre + " " + usuarioData.apellido;
    this.setState({recibidoPorNombre: nombreUsuario})
  }

  
  render() {
    return (
      <Container style={style.container}>
        <Paper style={style.paper}>
          <Grid item xs={12} md={8}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link color="initial" style={style.link} href="/tramites">
                <HomeIcon style={style.homeIcon}/>
                Trámites
              </Link>
              <Typography color="textPrimary">Recepción</Typography>
            </Breadcrumbs>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="fecha"
              label="Fecha"
              fullWidth
              //onChange={this.entradaDatoEnEstado}
              value={this.state.recepcion.fecha}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="recibidoPor"
              label="Recibido por"
              fullWidth
              //onChange={this.entradaDatoEnEstado}
              value={this.state.recibidoPorNombre}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="enviadoPor"
              label="Enviado por"
              fullWidth
              //onChange={this.entradaDatoEnEstado}
              value={this.state.recepcion.enviadoPor}
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
              value={this.state.recepcion.asunto}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Table>
              <TableBody>
                {this.state.recepcion.adjuntos
                  ? this.state.recepcion.adjuntos.map((foto, i) => (
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
        </Paper>
      </Container>
    );
  }
}

export default consumerFirebase(visualizarRecepcion);
