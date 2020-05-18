import React, { Component } from "react";
import { consumerFirebase } from "../../server";
import {
  Container,
  Paper,
  Grid,
  Breadcrumbs,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  MenuItem,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { Object, Date } from "core-js";
import { createKeyword } from "../sesion/actions/Keyword";
import ImageUploader from "react-images-upload";
import { openMensajePantalla } from "../sesion/actions/snackbarAction";
import HomeIcon from "@material-ui/icons/Home";
import uuid from "react-native-uuid";

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
  foto: {
    height: "100px",
  },
  comboBox: {
    width: 185,
  }
};

class NuevaRecepcion extends Component {
  state = {
    recepcion: {
      fecha: "",
      recibidoPor: "",
      enviadoPor: "",
      asunto: "",
      adjuntos: [],
    },
    archivos: [],
    usuarios: []
  };

  //Obtiene los usuarios para llenar el comboBox
  componentDidMount() {
    const usuariosQuery = this.props.firebase.db.collection("Users").orderBy("apellido");
    usuariosQuery.get().then((resultados) => {
      const arrayUsuarios = resultados.docs.map((usuario) => {
        let data = usuario.data();
        let id = usuario.id;
        return { id, ...data };
      });

      this.setState({
        usuarios: arrayUsuarios,
      });
    });
  };

  entradaDatoEnEstado = (e) => {
    let recepcion_ = Object.assign({}, this.state.recepcion);
    recepcion_[e.target.name] = e.target.value;
    this.setState({
      recepcion: recepcion_,
    });
  };

  guardarRecepcion = () => {
    const { archivos, recepcion: recepcion } = this.state;

    //Crearle a cada image(archivo) un alias, ese alias es la referencia con la cual posteriormente lo invocaras
    //Ademas ese alias sera almacenado en la base de datos(firestore.firebase)

    Object.keys(archivos).forEach(function (key) {
      let valorDinamico = Math.floor(new Date().getTime() / 1000);
      let nombre = archivos[key].name;
      let extension = nombre.split(".").pop();
      archivos[key].alias = (
        nombre.split(".")[0] +
        "_" +
        valorDinamico +
        "." +
        extension
      )
        .replace(/\s/g, "_")
        .toLowerCase();
    });

    const textoBusqueda =
      recepcion.fecha + " " + recepcion.enviadoPor + " " + recepcion.asunto;
    let keywords = createKeyword(textoBusqueda);

    this.props.firebase.guardarDocumentos(archivos).then((arregloUrls) => {
      recepcion.adjuntos = arregloUrls;
      recepcion.keywords = keywords;

      this.props.firebase.db
        .collection("Recepciones")
        .add(recepcion)
        .then((success) => {
          this.props.history.push("/");
        })
        .catch((error) => {
          openMensajePantalla({
            open: true,
            mensaje: error,
          });
        });
    });
  };

  subirAdjunto = (documentos) => {
    Object.keys(documentos).forEach(function (key) {
      documentos[key].urlTemp = URL.createObjectURL(documentos[key]);
    });

    this.setState({
      archivos: this.state.archivos.concat(documentos),
    });
  };

  eliminarAdjunto = (nombreAdjunto) => () => {
    this.setState({
      archivos: this.state.archivos.filter((archivo) => {
        return archivo.name !== nombreAdjunto;
      }),
    });
  };


  render() {
    let imagenKey = uuid.v4();
    return (
      <Container style={style.container}>
        <Paper style={style.paper}>
          <Grid item xs={12} md={8}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link color="inherit" style={style.link} to="/tramites">
                <HomeIcon style={style.homeIcon} />
                Inicio
              </Link>
              <Typography color="textPrimary">Nueva recepción</Typography>
            </Breadcrumbs>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="fecha"
              label="Fecha"
              fullWidth
              onChange={this.entradaDatoEnEstado}
              value={this.state.recepcion.fecha}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Recibido por"
              fullWidth
              name="recibidoPor"
              style={style.comboBox}
              onChange={this.entradaDatoEnEstado}
              value={this.state.recepcion.recibidoPor}> 
                  <MenuItem value={""}>Seleccione el usuario</MenuItem>
                  {this.state.usuarios.map((usuario) => (
                    <MenuItem value={usuario.id}>{usuario.nombre + " " + usuario.apellido}</MenuItem>
                  ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="enviadoPor"
              label="Enviado por"
              fullWidth
              onChange={this.entradaDatoEnEstado}
              value={this.state.recepcion.asunto}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="asunto"
              label="Asunto"
              fullWidth
              multiline
              style={style.comboBox}
              onChange={this.entradaDatoEnEstado}
              value={this.state.recepcion.asunto}
            />
          </Grid>

          <Grid container justify="center">
            <Grid item xs={12} sm={6}>
              <ImageUploader
                key={imagenKey}
                withIcon={true}
                buttonText="Seleccione los archivos a adjuntar"
                onChange={this.subirAdjunto}
                imgExtension={[".jpg", ".gif", ".png", ".jpeg"]}
                maxFileSize={5242880}
              />
            </Grid>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Table>
              <TableBody>
                {this.state.archivos.map((archivo, i) => (
                  <TableRow key={i}>
                    <TableCell align="left">
                      <img src={archivo.urlTemp} style={style.foto} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={this.eliminarAdjunto(archivo.name)}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
                onClick={this.guardarRecepcion}
              >
                Guardar
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  }
}

export default consumerFirebase(NuevaRecepcion);
