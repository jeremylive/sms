import React, { Component } from "react";
import {
  Container,
  Breadcrumbs,
  Paper,
  Grid,
  Link,
  Typography,
  TextField,
  Button,
  TableBody,
  Table,
  TableRow,
  TableCell,
} from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import { consumerFirebase } from "../../server";
import { openMensajePantalla } from "../sesion/actions/snackbarAction";
import ImageUploader from "react-images-upload";
import uuid from "react-native-uuid";
import { Date, Math } from "core-js";
import { createKeyword } from "../sesion/actions/Keyword";

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
};

class NuevoInmueble extends Component {
  state = {
    inmueble: {
      direccion: "",
      ciudad: "",
      pais: "",
      descripcion: "",
      interior: "",
      fotos: [],
    },
    archivos: [],
  };

  entradaDatoEnEstado = (e) => {
    let inmueble_ = Object.assign({}, this.state.inmueble);
    inmueble_[e.target.name] = e.target.value;
    this.setState({
      inmueble: inmueble_,
    });
  };

  guardarInmueble = () => {
    const { archivos, inmueble } = this.state;

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
      inmueble.direccion + " " + inmueble.ciudad + " " + inmueble.pais;
    let keywords = createKeyword(textoBusqueda);

    this.props.firebase.guardarDocumentos(archivos).then((arregloUrls) => {
      inmueble.fotos = arregloUrls;
      inmueble.keywords = keywords;

      this.props.firebase.db
        .collection("Inmuebles")
        .add(inmueble)
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

  subirFotos = (documentos) => {
    Object.keys(documentos).forEach(function (key) {
      documentos[key].urlTemp = URL.createObjectURL(documentos[key]);
    });

    this.setState({
      archivos: this.state.archivos.concat(documentos),
    });
  };

  eliminarFoto = (nombreFoto) => () => {
    this.setState({
      archivos: this.state.archivos.filter((archivo) => {
        return archivo.name !== nombreFoto;
      }),
    });
  };

  render() {
    let imagenKey = uuid.v4();

    return (
      <Container style={style.container}>
        <Paper style={style.paper}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Breadcrumbs aria-label="breadcrumb">
                <Link color="inherit" style={style.link} href="/">
                  <HomeIcon style={style.homeIcon} />
                  Home
                </Link>
                <Typography color="textPrimary">Nuevo Inmueble</Typography>
              </Breadcrumbs>
            </Grid>

            <Grid item xs={12} md={12}>
              <TextField
                name="direccion"
                label="Direccion del inmueble"
                fullWidth
                onChange={this.entradaDatoEnEstado}
                value={this.state.inmueble.direccion}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="ciudad"
                label="Ciudad"
                fullWidth
                onChange={this.entradaDatoEnEstado}
                value={this.state.inmueble.ciudad}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="pais"
                label="Pais"
                fullWidth
                onChange={this.entradaDatoEnEstado}
                value={this.state.inmueble.pais}
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <TextField
                name="descripcion"
                label="Descripcion del Inmueble"
                fullWidth
                multiline
                onChange={this.entradaDatoEnEstado}
                value={this.state.inmueble.descripcion}
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <TextField
                name="interior"
                label="Interior del Inmueble"
                fullWidth
                multiline
                onChange={this.entradaDatoEnEstado}
                value={this.state.inmueble.interior}
              />
            </Grid>
          </Grid>

          <Grid container justify="center">
            <Grid item xs={12} sm={6}>
              <ImageUploader
                key={imagenKey}
                withIcon={true}
                buttonText="Seleccione Imagenes"
                onChange={this.subirFotos}
                imgExtension={[".jpg", ".gif", ".png", ".jpeg"]}
                maxFileSize={5242880}
              />
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
                          onClick={this.eliminarFoto(archivo.name)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Grid>
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
                onClick={this.guardarInmueble}
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

export default consumerFirebase(NuevoInmueble);
