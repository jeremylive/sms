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

class visualizarTraslado extends Component {
  state = {
    traslado: {
      fecha: "",
      trasladoPor: "",
      trasladoA: "",
      asunto: "",
      adjuntos: [],
      confirmarTraslado: "",
    },
    usuarios: [],
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

    this.setState({
      traslado: trasladoData,
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
              <Typography color="textPrimary">Traslados</Typography>
            </Breadcrumbs>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="fecha"
              label="Fecha"
              fullWidth
              onChange={this.entradaDatoEnEstado}
              value={this.state.traslado.fecha}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="trasladoPor"
              label="Recibido por"
              fullWidth
              onChange={this.entradaDatoEnEstado}
              value={this.state.traslado.trasladoPor}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="trasladoA"
              label="Enviado por"
              fullWidth
              onChange={this.entradaDatoEnEstado}
              value={this.state.traslado.trasladoA}
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
              value={this.state.traslado.asunto}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Table>
              <TableBody>
                {this.state.traslado.adjuntos
                  ? this.state.traslado.adjuntos.map((foto, i) => (
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

          <Grid item xs={12} md={6}>
            <TextField
              select
              name="confirmarTraslado"
              label="Confirmación de Traslado por"
              fullWidth
              margin="dense"
              style={style.campoTexto}
              onChange={this.entradaDatoEnEstado}
              value={this.state.traslado.confirmarTranslado}
            >
              <MenuItem value={""}>Seleccione el usuario</MenuItem>
              {this.state.usuarios.map((usuario) => (
                <MenuItem
                  key={usuario.id}
                  value={usuario.nombre + " " + usuario.apellido}
                >
                  {usuario.nombre + " " + usuario.apellido}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Paper>
      </Container>
    );
  }
}

export default consumerFirebase(visualizarTraslado);
