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
  campoTexto: {
    width: 200
  }
};

class NuevoAsignacion extends Component {
  state = {
    asignacion: {
      idTramite: "",
      fecha: new Date(),
      asignacionPor: "",
      asignacionA: "",
      asunto: "",
      adjuntos: [],
      confirmada: false,
    },
    archivos: [],
    usuarios: [],
    tramites: []
  };

  componentDidMount() {
    //Obtiene los usuarios para llenar el comboBox
    const usuariosQuery = this.props.firebase.db.collection("Users").orderBy("apellido");
    usuariosQuery.get().then((resultados) => {
      let arrayUsuarios = resultados.docs.map((usuario) => {
        let id = usuario.id;
        let data = usuario.data();
        return { id, ...data };
      });

      this.setState({usuarios: arrayUsuarios});
    });
    //Obtiene los tramites, que estén en proceso, para llenar el combobox
    const tramitesQuery = this.props.firebase.db.collection("Tramites").where("estado","==","En proceso");
    tramitesQuery.get().then((resultTramite) => {
      let arrayTramite = resultTramite.docs.map((tramite) => {
        let id = tramite.id;
        return id;
      });

      this.setState({tramites: arrayTramite });
    });
  };

  entradaDatoEnEstado = (e) => {
    let asignacion_ = Object.assign({}, this.state.asignacion);
    asignacion_[e.target.name] = e.target.value;
    this.setState({
        asignacion: asignacion_,
    });
  };

  crearTareaXTramite = (paramIDTarea) => {
    const tareaXtramite = {
      fecha: this.state.asignacion.fecha,
      idTarea: paramIDTarea,
      idTramite: this.state.asignacion.idTramite,
      tipoTarea: "Asignaciones"
    }
    this.props.firebase.db
      .collection("TareasXTramite")
      .add(tareaXtramite)
      .catch((error) => {
        openMensajePantalla({
          open: true,
          mensaje: error,
        });
      });
  }

  guardarAsignacion = () => {
    //Guarda automaticamente la fecha en que se guarda la tarea
    let asignacion_ = Object.assign({}, this.state.asignacion);
    asignacion_["fecha"] = new Date();
    this.setState({
      asignacion: asignacion_,
    });
    const { archivos, asignacion } = this.state;

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
    console.log("esta es la fecha de asignacion" + asignacion.fecha)

    this.props.firebase.guardarDocumentos(archivos).then((arregloUrls) => {
        asignacion.adjuntos = arregloUrls;

      this.props.firebase.db
        .collection("Asignaciones")
        .add(asignacion)
        .then((asignacionCreada) => {
          //Crea la tareaXtramite
          this.crearTareaXTramite(asignacionCreada.id);
          this.props.history.push("/tramites");
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
              <Link color="initial" style={style.link} to="/tramites">
                <HomeIcon style={style.homeIcon} />
                Home
              </Link>
              <Typography color="textPrimary">Nueva asignación</Typography>
            </Breadcrumbs>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              name="idTramite"
              label="ID del documento"
              fullWidth
              margin="dense"
              style={style.campoTexto}
              onChange={this.entradaDatoEnEstado}
              value={this.state.asignacion.idTramite}>
                <MenuItem value={""}>Seleccione el documento</MenuItem>
                {this.state.tramites.map((tramite) => (
                  <MenuItem key={tramite} value={tramite}>{tramite}</MenuItem>
                ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              name="asignacionPor"
              label="Asignado por"
              fullWidth
              margin="dense"
              style={style.campoTexto}
              onChange={this.entradaDatoEnEstado}
              value={this.state.asignacion.asignacionPor}>
                <MenuItem value={""}>Seleccione el usuario</MenuItem>
                {this.state.usuarios.map((usuario) => (
                  <MenuItem key={usuario.id} value={usuario.id}>{usuario.nombre + " " + usuario.apellido}</MenuItem>
                ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Asignado a"
              fullWidth
              margin="dense"
              style={style.campoTexto}
              name="asignacionA"
              onChange={this.entradaDatoEnEstado}
              value={this.state.asignacion.asignacionA}>
                <MenuItem value={""}>Seleccione el usuario</MenuItem>
                {this.state.usuarios.map((usuario) => (
                  <MenuItem key={usuario.id} value={usuario.id}>{usuario.nombre + " " + usuario.apellido}</MenuItem>
                ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="asunto"
              label="Asunto"
              fullWidth
              margin="dense"
              style={style.campoTexto}
              multiline
              onChange={this.entradaDatoEnEstado}
              value={this.state.asignacion.asunto}
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
                      <img alt={"Foto "+i} src={archivo.urlTemp} style={style.foto} />
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
                onClick={this.guardarAsignacion}
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

export default consumerFirebase(NuevoAsignacion);
