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

class NuevaRecepcion extends Component {
  state = {
    recepcion: {
      idTramite: "",
      fecha: new Date(),
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

  crearTramite = () => {
    //Palabras de búsqueda
    let busqueda = [];
    let _fecha = this.state.recepcion.fecha;
    //  Día
    busqueda.push(""+_fecha.getDate() );
    //  Nombre del mes
    let numeroMes = _fecha.getMonth();
    let nombreMes = "";
    switch (numeroMes) {
      case 0:
        nombreMes = "Enero";
        break;
      case 1:
        nombreMes = "Febrero";
        break;
      case 2:
        nombreMes = "Marzo";
        break;
      case 3:
        nombreMes = "Abril";
        break;
      case 4:
        nombreMes = "Mayo";
        break;
      case 5:
        nombreMes = "Junio";
        break;
      case 6:
        nombreMes = "Julio";
        break;
      case 7:
        nombreMes = "Agosto";
        break;
      case 8:
        nombreMes = "Setiembre";
        break;
      case 9:
        nombreMes = "Octubre";
        break;
      case 10:
        nombreMes = "Noviembre";
        break;
      case 11:
        nombreMes = "Diciembre";
        break;
      default:
        break;
    }
    busqueda.push(nombreMes);
    busqueda.push(nombreMes.toLowerCase() );
    //  Año
    busqueda.push(""+_fecha.getFullYear() );
    //  Día de Mes
    busqueda.push(_fecha.getDate() + " de " + nombreMes );
    busqueda.push(_fecha.getDate() + " de " + nombreMes.toLowerCase() );
    //  Día de Mes de Año
    busqueda.push(_fecha.getDate() + " de " + nombreMes + " de " + _fecha.getFullYear() );
    busqueda.push(_fecha.getDate() + " de " + nombreMes.toLowerCase() + " de " + _fecha.getFullYear() );
    //  Estado
    busqueda.push("En proceso");
    //  ID Documento
    busqueda.push(this.state.recepcion.idTramite);

    //Crea el tramite en la BD
    const tramite = {
      estado: "En proceso",
      fechaInicio: this.state.recepcion.fecha,
      keywords: busqueda
    }
    this.props.firebase.db
      .collection("Tramites")
      .doc(this.state.recepcion.idTramite)
      .set(tramite)
      .catch((error) => {
        openMensajePantalla({
          open: true,
          mensaje: error,
        });
      });
  }

  //Crea la asociación entre Tarea y Tramite en la BD
  crearTareaXTramite = (paramIDTarea) => {
    const tareaXtramite = {
      fecha: this.state.recepcion.fecha,
      idTarea: paramIDTarea,
      idTramite: this.state.recepcion.idTramite,
      tipoTarea: "Recepciones"
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

  guardarRecepcion = () => {
    //Guarda automaticamente la fecha en que se guarda la tarea
    let recepcion_ = Object.assign({}, this.state.recepcion);
    recepcion_["fecha"] = new Date();
    this.setState({
      recepcion: recepcion_,
    });
    //Crea el trámite
    this.crearTramite();

    const { archivos, recepcion } = this.state;
    
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

    this.props.firebase.guardarDocumentos(archivos).then((arregloUrls) => {
      recepcion.adjuntos = arregloUrls;

      this.props.firebase.db
        .collection("Recepciones")
        .add(recepcion)
        .then((recepcionCreada) => {
          //Crea la tareaXtramite
          this.crearTareaXTramite(recepcionCreada.id);
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
                Inicio
              </Link>
              <Typography color="textPrimary">Nueva recepción</Typography>
            </Breadcrumbs>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Recibido por"
              fullWidth
              margin="dense"
              name="recibidoPor"
              style={style.campoTexto}
              onChange={this.entradaDatoEnEstado}
              value={this.state.recepcion.recibidoPor}> 
                  <MenuItem value={""}>Seleccione el usuario</MenuItem>
                  {this.state.usuarios.map((usuario) => (
                    <MenuItem key={usuario.id} value={usuario.id}>{usuario.nombre + " " + usuario.apellido}</MenuItem>
                  ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="enviadoPor"
              label="Enviado por"
              style={style.campoTexto}
              fullWidth
              margin="dense"
              onChange={this.entradaDatoEnEstado}
              value={this.state.recepcion.enviadoPor}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="idTramite"
              label="ID del documento"
              style={style.campoTexto}
              fullWidth
              margin="dense"
              onChange={this.entradaDatoEnEstado}
              value={this.state.recepcion.idTramite}
              
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="asunto"
              label="Asunto"
              style={style.campoTexto}
              fullWidth
              margin="dense"
              multiline
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
