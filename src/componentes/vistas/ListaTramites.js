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
} from "@material-ui/core";
import { Link } from "react-router-dom";
//Iconos
import HomeIcon from "@material-ui/icons/Home";
import SearchIcon from "@material-ui/icons/Search";

import { openMensajePantalla } from "../sesion/actions/snackbarAction";
import logo from "../../logo.svg";
import FormControl from "@material-ui/core/FormControl";
import NativeSelect from "@material-ui/core/NativeSelect";
import InputLabel from "@material-ui/core/InputLabel";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";

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
  },
  barraBoton: {
    marginTop: "20px",
  },
  botonBuscar: {
    marginTop: "20px",
    marginLeft: "10px",
    height: 56,
  },
};

class ListaTramites extends Component {
  state = {
    traslados: [],
    asignaciones: [],
    recepciones: [],

    tramites: [],
    rutas: [],

    textoBusqueda: "",

    selectEstado: "0",
    estadoDialog: false,
    idTramiteActual: 0,
  };

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

  getRecepcion = (id) => {
    this.props.history.push("/tramite/recepcion/" + id);
  };

  getAsignacion = (id) => {
    this.props.history.push("/tramite/asignacion/" + id);
  };

  getTraslado = (id) => {
    this.props.history.push("/tramite/traslado/" + id);
  };

  getNotas = (id) => {
    this.props.history.push("/tramite/notas/" + id);
  };

  //Buscar tramites
  cambiarTextoBusqueda(e) {
    let newState = {};
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }

  async buscarTramites() {
    //Vacía la lista de tramites
    this.setState({ tramites: [] });
    this.setState({ rutas: [] });

    console.log(this.state.textoBusqueda);
    //Cargar todas los tramites que cumplan la busqueda
    let tramitesQuery = this.props.firebase.db
      .collection("Tramites")
      .where("keywords", "array-contains", this.state.textoBusqueda);

    //Si la búsqueda esta vacía busca todos los trámites
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
  eventoEnCombobox = (event) => {
    this.setState({ selectEstado: event.target.value });
  };

  agregarEstado = async () => {
    if (this.state.selectEstado === "0") {
      console.log("No seleccionó ningún estado");
      return;
    }
    console.log(this.state.selectEstado);
    //Inserta en tramite el estado
    this.props.firebase.db
      .collection("Tramites")
      .doc(this.state.idTramiteActual)
      .update("estado", this.state.selectEstado)
      .catch((error) => {
        openMensajePantalla({
          open: true,
          mensaje: error,
        });
      });
  };

  abrirDialogConUsuario = (idTramite) => {
    this.setState({ idTramiteActual: idTramite });
    this.setState({ estadoDialog: true });
  };

  imprimirEstado = () => {
    this.props.firebase.db
      .collection("Tramites")
      .doc(this.state.idTramiteActual)
      .get()
      .then((doc) => {
        console.log("El estado es:", doc.data().estado);
      });
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
          open={this.state.estadoDialog}
          onClose={() => {
            this.setState({ estadoDialog: false });
          }}
        >
          <DialogTitle>Estado del Trámite</DialogTitle>
          <DialogContent>
            <Grid container justify="center">
              <Grid item xs={6} sm={6}>
                <Select
                  value={this.state.selectEstado}
                  onChange={this.eventoEnCombobox}
                >
                  <MenuItem value={""}>Seleccione el Estado</MenuItem>
                  <MenuItem value={"Aprobado"}>Aprobado</MenuItem>
                  <MenuItem value={"Rechazado"}>Rechazado</MenuItem>
                  <MenuItem value={"Prevencion"}>Prevención</MenuItem>
                  <MenuItem value={"En proceso"}>En proceso</MenuItem>
                </Select>


                {/* <this.imprimirEstado></this.imprimirEstado> */}
              </Grid>
              <Grid item xs={6} sm={6}>
                <Button
                  color="secondary"
                  onClick={() => this.agregarEstado()}
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
              <Typography color="textPrimary">Trámites activos</Typography>
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

          {
            /*Mostrar las rutas*/
            this.state.rutas.map((ruta, index) => (
              <Grid item style={style.gridTextfield} key={ruta.idTramite}>
                Documento: {ruta.idTramite}
                <p></p>
                {
                  //Mostrar las notas
                  this.state.tramites.map((tramite) => (
                    <Grid
                      item
                      key={tramite.id}
                      xs={12}
                      sm={6}
                      md={2}
                      style={{ minWidth: "100%" }}
                    >
                      Estado: {tramite.estado}
                      
                    </Grid>
                  ))
                }
                <p></p>
                <Button
                  variant="contained"
                  onClick={() => this.abrirDialogConUsuario(ruta.idTramite)}
                  color="primary"
                  size="small"
                  style={{ marginRight: "10px" }}
                  disableElevation
                >
                  Estado
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  disableElevation
                  onClick={() => this.getNotas(ruta.idTramite)}
                >
                  Ver notas
                </Button>
                <p></p>
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
            ))
          }
        </Paper>
      </Container>
    );
  }
}

export default consumerFirebase(ListaTramites);

{
  /* <FormControl fullWidth color="finish">
<InputLabel htmlFor="demo-customized-select-native">
  Estado
</InputLabel>
<NativeSelect id="demo-customized-select-native">
  <option aria-label="None" value="" />
  <option value={10}>Proceso</option>
  <option value={20}>Terminado</option>
  <option value={30}>Observación</option>
</NativeSelect>
</FormControl>

<ButtonGroup>
<ButtonDropdown
  isOpen={this.state.dropdownOpen}
  toggle={this.toggle}
>
  <DropdownToggle caret>Estado</DropdownToggle>
  <DropdownMenu>
    <DropdownItem>Aprobado</DropdownItem>
    <DropdownItem>Rechazado</DropdownItem>
    <DropdownItem>Prevención</DropdownItem>
  </DropdownMenu>
</ButtonDropdown>
</ButtonGroup> */
}
