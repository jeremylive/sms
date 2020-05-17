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
    padding: "20px",
    backgroundColor: "#f5f5f5",
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


class visualizarTranslado extends Component {
  state = {
    translado: {
      fecha: "",
      transladoPor: "",
      transladoA: "",
      asunto: "",
      adjuntos: [],
    },
  };

  entradaDatoEnEstado = (e) => {
    let translado = Object.assign({}, this.state.translado);
    translado[e.target.name] = e.target.value;
    this.setState({ translado });
  };

  async componentDidMount() {
    const { id } = this.props.match.params;

    const transladoCollection = this.props.firebase.db.collection(
      "Translados"
    );
    const transladoDB = await transladoCollection.doc(id).get();

    this.setState({
      translado: transladoDB.data(),
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
              <Typography color="textPrimary">Translados</Typography>
            </Breadcrumbs>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="fecha"
              label="Fecha"
              fullWidth
              onChange={this.entradaDatoEnEstado}
              value={this.state.translado.fecha}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="transladoPor"
              label="Recibido por"
              fullWidth
              onChange={this.entradaDatoEnEstado}
              value={this.state.translado.transladoPor}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="transladoA"
              label="Enviado por"
              fullWidth
              onChange={this.entradaDatoEnEstado}
              value={this.state.translado.transladoA}
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
              value={this.state.translado.asunto}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Table>
              <TableBody>
                {this.state.translado.adjuntos
                  ? this.state.translado.adjuntos.map((foto, i) => (
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

export default consumerFirebase(visualizarTranslado);
