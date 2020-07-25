import React, { Component } from "react";
import { consumerFirebase } from "../../server";
import {
  Container,
  Paper,
  Grid,
  Breadcrumbs,
  TextField,
  Typography,
  Card,
  CardMedia,
  Button,
  CardContent,
  CardActions,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  DialogActions,
  Divider,
  InputLabel
} from "@material-ui/core";
import { Link } from "react-router-dom";
//Iconos
import HomeIcon from "@material-ui/icons/Home";
import SearchIcon from "@material-ui/icons/Search";

import { openMensajePantalla } from "../sesion/actions/snackbarAction";

const style = {
  cardGrid: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  paper: {
    backgroundColor: "#f5f5f5",
    padding: "20px",
    minHeight: 650,
  },
  link: {
    display: "flex",
  },
  gridTextfield: {
    minWidth: "75%",
    marginTop: "20px",
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardMedia: {
    paddingTop: "56.25%",
  },
  cardContent: {
    flexGrow: 1,
    padding: "10px 15px"
  },
  barraBoton: {
    marginTop: "20px",
  },
  botonBuscar: {
    marginTop: "20px",
    marginLeft: "10px",
    height: 56,
  },
  botonTramite: {
    marginRight: "10px",
    marginBottom: "15px"
  }
};

class ListaTramites extends Component {
  state = {
    tramites: [],
    rutas: [],
    textoBusqueda: "",

    selectEstado: "",
    estadoDialog: false,
    idTramiteActual: "",
  };

  /*Ejemplo de propiedad tramites
    {
      {id: "Tramite-1",
       estado: "X",
       fechaInicio: X,
       keywords: {"Tramite-1","Julio",...}
      } ,
      {id: "Tramite-2",
       estado: "Y",
       fechaInicio: Y,
       keywords: {"Tramite-2","Julio",...}
      }
    }

    Ejemplo de propiedad rutas
    {
      {idTramite: "Tramite-1",
       tareas: {  
                  { tipoTarea: "Asignaciones",
                    id: "abCdEFg",
                    adjuntos: {"Link a foto 1","Link a foto 2"},
                    asignacionA: "Persona 1",
                    asignacionPor: "Persona 2"
                    asunto: "Prueba",
                    fecha: "X"
                    idTramite: "Tramite-1"
                  } , ... un objeto por cada tarea del Tramite-1, tiene campos diferentes según la tabla del tipo de tarea
                }
      } , ... un objeto por cada tramite
    }
  */

  async componentDidMount() {
    //Cargar trámites
    let tramitesQuery = this.props.firebase.db
      .collection("Tramites")
      .orderBy("fechaInicio", "desc");
    const snapshot = await tramitesQuery.get();
    const arrayTramites = snapshot.docs.map((doc) => {
      let data = doc.data();
      let id = doc.id;
      return { id, ...data };
    });

    this.setState({ tramites: arrayTramites });

    //Cargar rutas
    let rutas = [];
    for (const tramite of this.state.tramites) {
      const rutaQuery = this.props.firebase.db
        .collection("TareasXTramite")
        .where("idTramite", "==", tramite.id)
        .orderBy("fecha");

      let snapshotRuta = await rutaQuery.get();
      let arrayRuta = snapshotRuta.docs.map((tarea) => {
        let data = tarea.data();
        return { ...data };
      });

      let tareas = [];
      for (const tarea of arrayRuta) {
        let tareaQuery = this.props.firebase.db
          .collection(tarea.tipoTarea)
          .doc(tarea.idTarea);
        let result = await tareaQuery.get();
        let data = result.data();
        tareas.push({ tipoTarea: tarea.tipoTarea, id: tarea.idTarea, ...data });
      }
      rutas.push({ idTramite: tramite.id, tareas });
    }
    this.setState({ rutas: rutas });
  }

  //Eliminar un Traslado
  async eliminarTraslado(pIDTarea, pIDTramite) {
    //Elimina de la tabla Traslados
    this.props.firebase.db.collection("Traslados").doc(pIDTarea).delete();
    this.eliminarAux(pIDTarea, pIDTramite);
  }

  //Eliminar una Asignacion
  async eliminarAsignacion(pIDTarea, pIDTramite) {
    //Elimina de la tabla Asignaciones
    this.props.firebase.db.collection("Asignaciones").doc(pIDTarea).delete();
    this.eliminarAux(pIDTarea, pIDTramite);
  }

  //Eliminar Recepciones
  async eliminarRecepcion(pIDTarea, pIDTramite) {
    this.props.firebase.db.collection("Recepciones").doc(pIDTarea).delete();
    this.eliminarAux(pIDTarea, pIDTramite);
  }

  //Eliminaciones generales para cualquier tarea
  async eliminarAux(pIDTarea, pIDTramite) {
    //Elimina de la tabla TareasXTramite
    const queryTareasTramite = this.props.firebase.db
      .collection("TareasXTramite")
      .where("idTarea", "==", pIDTarea);
    const snapshotTarea = await queryTareasTramite.get();
    let idDocumento = snapshotTarea.docs[0].id;
    this.props.firebase.db
      .collection("TareasXTramite")
      .doc(idDocumento)
      .delete();
    //Borra de la lista de rutas
    let arrayRutasNuevo = this.state.rutas;
    let arrayTareasNuevo = this.state.rutas
      .find((tramite) => tramite.idTramite == pIDTramite)
      .tareas.filter((tarea) => tarea.id !== pIDTarea);
    arrayRutasNuevo.find(
      (tramite) => tramite.idTramite == pIDTramite
    ).tareas = arrayTareasNuevo;
    this.setState({ rutas: arrayRutasNuevo });
  }

  //Ver detalles de una tarea de Recepcion
  getRecepcion = (id) => {
    this.props.history.push("/tramite/recepcion/" + id);
  };

  //Ver detalles de una tarea de Asignacion
  getAsignacion = (id) => {
    this.props.history.push("/tramite/asignacion/" + id);
  };

  //Ver detalles de una tarea de Traslado
  getTraslado = (id) => {
    this.props.history.push("/tramite/traslado/" + id);
  };

  //Ver notas de un tramite
  getNotas = (id) => {
    this.props.history.push("/tramite/notas/" + id);
  };

  //Cambiar texto de busqueda
  cambiarTextoBusqueda(e) {
    let newState = {};
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }

  //Buscar tramites
  async buscarTramites() {
    //Cargar todas los tramites que cumplan la busqueda
    let tramitesQuery = this.props.firebase.db
      .collection("Tramites")
      .where("keywords", "array-contains", this.state.textoBusqueda);
    //Si la búsqueda esta vacía retorna todos los trámites
    if (this.state.textoBusqueda.trim() === "") {
      tramitesQuery = this.props.firebase.db
        .collection("Tramites")
        .orderBy("fechaInicio", "desc");
    }

    const snapshot = await tramitesQuery.get();
    const arrayTramites = snapshot.docs.map((doc) => {
      let data = doc.data();
      let id = doc.id;
      return { id, ...data };
    });
    this.setState({ tramites: arrayTramites });

    //Cargar nuevas rutas
    let rutas = [];
    for (const tramite of this.state.tramites) {
      const rutaQuery = this.props.firebase.db
        .collection("TareasXTramite")
        .where("idTramite", "==", tramite.id)
        .orderBy("fecha");
      let snapshotRuta = await rutaQuery.get();
      let arrayRuta = snapshotRuta.docs.map((tarea) => {
        let data = tarea.data();
        return { ...data };
      });

      let tareas = [];
      for (const tarea of arrayRuta) {
        let tareaQuery = this.props.firebase.db
          .collection(tarea.tipoTarea)
          .doc(tarea.idTarea);
        let result = await tareaQuery.get();
        let data = result.data();
        tareas.push({ tipoTarea: tarea.tipoTarea, id: tarea.idTarea, ...data });
      }
      rutas.push({ idTramite: tramite.id, tareas });
    }
    this.setState({ rutas: rutas });
  }

  //Metodos del Estado
  //Seleccionar un estado en el Dialog
  dialogSeleccionarEstado = (event) => {
    this.setState({ selectEstado: event.target.value });
  };

  //Cambiar el estado de un trámite
  cambiarEstado = async () => {
    if (this.state.selectEstado === "") {
      console.log("No seleccionó ningún estado");
      return;
    }
    //Obtiene las palabras de busqueda
    let tramiteQuery = await this.props.firebase.db
      .collection("Tramites")
      .doc(this.state.idTramiteActual)
      .get();
    let tramiteData = tramiteQuery.data();
    let arrayPalabras = tramiteData.keywords;
    arrayPalabras[8] = this.state.selectEstado; //Actualiza la palabra de busqueda con el estado
    //Actualiza el tramite
    this.props.firebase.db
      .collection("Tramites")
      .doc(this.state.idTramiteActual)
      .update("estado", this.state.selectEstado, "keywords", arrayPalabras)
      .then(() => {
        //Cierra el dialogo y refresca los resultados
        this.setState({ estadoDialog: false });
        this.buscarTramites();
      })
      .catch((error) => {
        openMensajePantalla({
          open: true,
          mensaje: error,
        });
      });
  };

  //Abre el Dialog
  abrirDialog = (idTramite) => {
    this.setState({ idTramiteActual: idTramite });
    this.setState({ estadoDialog: true });
    //Reinicia el estado del Select
    this.setState({ selectEstado: "" });
  };

  //Retorna las Card según el tipo de la tarea
  renderTarea(tarea, pIDTramite) {
    switch (tarea.tipoTarea) {
      case "Asignaciones":
        //Si tiene imagen retorna una tarjeta con imagen
        if (tarea.adjuntos.length != 0) {
          return (
            <Card style={style.card}>
              <CardMedia
                style={style.cardMedia}
                image={tarea.adjuntos[0]}
                title="Asignacion"
              />

              <CardContent style={style.cardContent}>
                <Typography gutterBottom variant="body2" component="h2">
                  {"Asignacion: " +
                    tarea.asunto +
                    ", " +
                    tarea.fecha
                      .toDate()
                      .toLocaleString(undefined, { hour12: "true" })}
                </Typography>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => this.getAsignacion(tarea.id)}
                >
                  Visualizar
                </Button>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => this.eliminarAsignacion(tarea.id, pIDTramite)}
                >
                  Eliminar
                </Button>
              </CardActions>
            </Card>
          );
        }
        //Si no tiene imagen retorna una tarjeta sin imagen
        else {
          return (
            <Card style={style.card}>
              <CardContent style={style.cardContent}>
                <Grid
                  container
                  alignContent="center"
                  style={{ height: "100%" }}
                >
                  <Grid item>
                    <Typography gutterBottom variant="body2" component="h2">
                      {"Asignacion: " +
                        tarea.asunto +
                        ", " +
                        tarea.fecha
                          .toDate()
                          .toLocaleString(undefined, { hour12: "true" })}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => this.getAsignacion(tarea.id)}
                >
                  Visualizar
                </Button>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => this.eliminarAsignacion(tarea.id, pIDTramite)}
                >
                  Eliminar
                </Button>
              </CardActions>
            </Card>
          );
        }
      case "Recepciones":
        //Si tiene imagen retorna una tarjeta con imagen
        if (tarea.adjuntos.length != 0) {
          return (
            <Card style={style.card}>
              <CardMedia
                style={style.cardMedia}
                image={tarea.adjuntos[0]}
                title="Recepcion"
              />

              <CardContent style={style.cardContent}>
                <Typography gutterBottom variant="body2" component="h2">
                  {"Recepcion: " +
                    tarea.enviadoPor +
                    ", " +
                    tarea.fecha
                      .toDate()
                      .toLocaleString(undefined, { hour12: "true" })}
                </Typography>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => this.getRecepcion(tarea.id)}
                >
                  Visualizar
                </Button>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => this.eliminarRecepcion(tarea.id, pIDTramite)}
                >
                  Eliminar
                </Button>
              </CardActions>
            </Card>
          );
        }
        //Si no tiene imagen retorna una tarjeta sin imagen
        else {
          return (
            <Card style={style.card}>
              <CardContent style={style.cardContent}>
                <Grid
                  container
                  alignContent="center"
                  style={{ height: "100%" }}
                >
                  <Grid item>
                    <Typography gutterBottom variant="body2" component="h2">
                      {"Recepcion: " +
                        tarea.enviadoPor +
                        ", " +
                        tarea.fecha
                          .toDate()
                          .toLocaleString(undefined, { hour12: "true" })}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => this.getRecepcion(tarea.id)}
                >
                  Visualizar
                </Button>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => this.eliminarRecepcion(tarea.id, pIDTramite)}
                >
                  Eliminar
                </Button>
              </CardActions>
            </Card>
          );
        }

      case "Traslados":
        //Si tiene imagen retorna una tarjeta con imagen
        if (tarea.adjuntos.length != 0) {
          return (
            <Card style={style.card}>
              <CardMedia
                style={style.cardMedia}
                image={tarea.adjuntos[0]}
                title="Traslado"
              />

              <CardContent style={style.cardContent}>
                <Typography gutterBottom variant="body2" component="h2">
                  {"Traslado: " +
                    tarea.asunto +
                    ", " +
                    tarea.fecha
                      .toDate()
                      .toLocaleString(undefined, { hour12: "true" })}
                </Typography>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => this.getTraslado(tarea.id)}
                >
                  Visualizar
                </Button>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => this.eliminarTraslado(tarea.id, pIDTramite)}
                >
                  Eliminar
                </Button>
              </CardActions>
            </Card>
          );
        }
        //Si no tiene imagen retorna una tarjeta sin imagen
        else {
          return (
            <Card style={style.card}>
              <CardContent style={style.cardContent}>
                <Grid
                  container
                  alignContent="center"
                  style={{ height: "100%" }}
                >
                  <Grid item>
                    <Typography gutterBottom variant="body2" component="h2">
                      {"Traslado: " +
                        tarea.asunto +
                        ", " +
                        tarea.fecha
                          .toDate()
                          .toLocaleString(undefined, { hour12: "true" })}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => this.getTraslado(tarea.id)}
                >
                  Visualizar
                </Button>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => this.eliminarTraslado(tarea.id, pIDTramite)}
                >
                  Eliminar
                </Button>
              </CardActions>
            </Card>
          );
        }
      default:
        return <Card>Error: Tipo de tarea desconocido</Card>;
    }
  }

  render() {
    return (
      <Container style={style.cardGrid}>
        <Dialog
          maxWidth="xs"
          fullWidth
          open={this.state.estadoDialog}
          onClose={() => {
            this.setState({ estadoDialog: false });
          }}
        >
          <DialogTitle>Estado del trámite {this.state.idTramiteActual}</DialogTitle>
          <DialogContent>
            <Grid container justify="center">
              <Grid item style={{marginRight:"30px"}}>
                <InputLabel id="select-Estado">Seleccione el estado</InputLabel>
                <Select
                  labelId="select-Estado"
                  value={this.state.selectEstado}
                  onChange={this.dialogSeleccionarEstado}
                  style={{minWidth:"100%"}}
                >
                  <MenuItem value={"Aprobado"}>Aprobado</MenuItem>
                  <MenuItem value={"Rechazado"}>Rechazado</MenuItem>
                  <MenuItem value={"Prevencion"}>Prevención</MenuItem>
                  <MenuItem value={"En proceso"}>En proceso</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={3} md={"auto"}>
                <Button
                  color="secondary"
                  onClick={() => this.cambiarEstado()}
                  variant="contained"
                >
                  Actualizar Estado
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={() => {
                this.setState({ estadoDialog: false });
              }}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        <Paper style={style.paper}>
          <Grid item xs={12} sm={12}>
            <Breadcrumbs aria-label="breadcrumbs">
              <Link color="inherit" style={style.link} to="/tramites">
                <HomeIcon />
                Inicio
              </Link>
              <Typography color="textPrimary">Trámites</Typography>
            </Breadcrumbs>
          </Grid>

          <Grid container>
            <Grid item style={style.gridTextfield}>
              <TextField
                fullWidth
                InputLabelProps={{ shrink: true }}
                name="textoBusqueda"
                variant="outlined"
                label="Ingrese los parámetros de búsqueda"
                onChange={this.cambiarTextoBusqueda.bind(this)}
                value={this.state.textoBusqueda}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                style={style.botonBuscar}
                size="small"
                disableElevation
                onClick={this.buscarTramites.bind(this)}
              >
                <SearchIcon />
              </Button>
            </Grid>
          </Grid>

          {/*Mostrar las rutas*/
          this.state.rutas.map((ruta, index) => (
            <Grid item style={style.gridTextfield} key={ruta.idTramite}>
              <Grid container style={{marginBottom:"5px"}}>
                <Typography variant="body1">Documento: {ruta.idTramite}</Typography>
                <Typography variant="body1" style={{marginLeft:"10px"}}>Estado: {this.state.tramites[index].estado}</Typography> 
              </Grid>
              <Button
                variant="contained"
                onClick={() => this.abrirDialog(ruta.idTramite)}
                color="primary"
                size="small"
                style={style.botonTramite}
                disableElevation
              >
                Cambiar estado
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                style={style.botonTramite}
                disableElevation
                onClick={() => this.getNotas(ruta.idTramite)}
              >
                Ver notas
              </Button>
              <Grid
                container
                spacing={1}
                container
                direction="row"
                alignitems="stretch"
              >
                {this.state.rutas[index].tareas.map((tarea) => (
                  <Grid item key={tarea.id} xs={12} sm={6} md={2}>
                    {this.renderTarea(tarea, ruta.idTramite)}
                  </Grid>
                ))}
              </Grid>
              <Divider style={{ margin: "10px" }} />
            </Grid>
          )) }
        </Paper>
      </Container>
    );
  }
}

export default consumerFirebase(ListaTramites);