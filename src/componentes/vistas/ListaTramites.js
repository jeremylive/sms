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
  Grow,
  Popper,
  MenuItem,
  MenuList,
  ClickAwayListener,
  ButtonGroup,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import HomeIcon from "@material-ui/icons/Home";
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
    minheight: 650,
  },
  link: {
    display: "flex",
  },
  gridTextfield: {
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
};

const options = ["Aprobado", "Rechazado", "Prevención"];
const estado = "";
const id_tramite = 0;

function SplitButton() {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const handleClick = () => {
    console.info(`You clicked ${options[selectedIndex]}`);
    const estado = options[selectedIndex];
    console.info("este es el estado " + estado);
    console.info(id_tramite);
  };

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  return (
    <Grid container direction="column" alignItems="center">
      <Grid item xs={12}>
        <ButtonGroup
          variant="contained"
          color="primary"
          ref={anchorRef}
          aria-label="split button"
        >
          <Button onClick={handleClick}>{options[selectedIndex]}</Button>
          <Button
            color="primary"
            size="small"
            aria-controls={open ? "split-button-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-label="select merge strategy"
            aria-haspopup="menu"
            onClick={handleToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom" ? "center top" : "center bottom",
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList id="split-button-menu">
                    {options.map((option, index) => (
                      <MenuItem
                        key={option}
                        disabled={index === 2}
                        selected={index === selectedIndex}
                        onClick={(event) => handleMenuItemClick(event, index)}
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Grid>
    </Grid>
  );
}

class ListaTramites extends Component {
  state = {
    traslados: [],
    asignaciones: [],
    recepciones: [],

    tramites: [],
    rutas: [],

    textoBusqueda: "",

    options: ["Aprobado", "Rechazado", "Prevención"],
    open: false,
    anchorRef: null,
    selectedIndex: 1,
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

  cambiarBusquedaTexto = (e) => {
    const self = this;
    self.setState({ [e.target.name]: e.target.value });

    if (self.state.typingTimeout) {
      clearTimeout(self.state.typingTimeout);
    }

    self.setState({
      name: e.target.value,
      typing: false,
      typingTimeout: setTimeout((goTime) => {
        //Cargar todas los tramites que cumplan la busqueda
        let objectQuery = this.props.firebase.db
          .collection("Tramites")
          .orderBy("fechaInicio", "desc")
          .where("keywords", "array-contains", self.state.textoBusqueda);

        if (self.state.textoBusqueda.trim() === "") {
          objectQuery = this.props.firebase.db
            .collection("Tramites")
            .orderBy("fechaInicio", "desc");
        }

        objectQuery.get().then((snapshot) => {
          const arrayTramites = snapshot.docs.map((doc) => {
            let data = doc.data();
            let id = doc.id;
            return { id, ...data };
          });

          this.setState({ tramites: arrayTramites });
        });
        //Cargar nuevas rutas
        let rutas = [];
        for (const tramite of this.state.tramites) {
          const rutaQuery = this.props.firebase.db
            .collection("TareasXTramite")
            .where("idTramite", "==", tramite.id)
            .orderBy("fecha");

          let arrayRuta = [];
          rutaQuery.get().then((snapshotRuta) => {
            arrayRuta = snapshotRuta.docs.map((tarea) => {
              let data = tarea.data();
              return { ...data };
            });
          });

          let tareas = [];
          for (const tarea of arrayRuta) {
            const tareaQuery = this.props.firebase.db
              .collection(tarea.tipoTarea)
              .doc(tarea.idTarea);
            tareaQuery.get().then((result) => {
              let data = result.data();
              tareas.push({
                tipoTarea: tarea.tipoTarea,
                id: tarea.idTarea,
                ...data,
              });
            });
          }
          rutas.push({ idTramite: tramite.id, tareas });
        }
        this.setState({ rutas: rutas });
        console.log(rutas);
      }, 500),
    });
  };


  
  handleClick = () => {
    console.info(`You clicked ${options[this.state.selectedIndex]}`);
  };

  handleMenuItemClick = (event, index) => {
    this.setState({ selectedIndex: index });
    this.setState({ open: false });
  };

  handleClose = (event) => {
    if (
      this.state.anchorRef.current &&
      this.state.anchorRef.current.contains(event.target)
    ) {
      return;
    }
    this.setState({ open: false });
  };

  // ////////////////////////// Aqui no se como hacerle para que se implemente esta asignacion dentro de la clase
  // handleToggle = () => {
  //   setOpen((prevOpen) => !prevOpen);
  // };




  //Retorna las Card según el tipo de la tarea
  renderTarea(tarea, pIDTramite) {
    switch (tarea.tipoTarea) {
      case "Asignaciones":
        return (
          <Card style={style.card}>
            <CardMedia
              style={style.cardMedia}
              image={
                tarea.adjuntos
                  ? tarea.adjuntos[0]
                    ? tarea.adjuntos[0]
                    : logo
                  : logo
              }
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
        break;
      case "Recepciones":
        return (
          <Card style={style.card}>
            <CardMedia
              style={style.cardMedia}
              image={
                tarea.adjuntos
                  ? tarea.adjuntos[0]
                    ? tarea.adjuntos[0]
                    : logo
                  : logo
              }
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
      case "Traslados":
        return (
          <Card style={style.card}>
            <CardMedia
              style={style.cardMedia}
              image={
                tarea.adjuntos
                  ? tarea.adjuntos[0]
                    ? tarea.adjuntos[0]
                    : logo
                  : logo
              }
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
        break;
      default:
        return <Card>Error: Tipo de tarea desconocido</Card>;
        break;
    }
  }

  render() {
    return (
      <Container style={style.cardGrid}>
        <Paper style={style.paper}>
          <Grid item xs={12} sm={12}>
            <Breadcrumbs aria-label="breadcrumbs">
              <Link color="inherit" style={style.link} to="/tramites">
                <HomeIcon />
                Trámites
              </Link>
              <Typography color="textPrimary">
                Traslados, asignaciones y recepciones
              </Typography>
            </Breadcrumbs>
          </Grid>

          <Grid item xs={12} sm={6} style={style.gridTextfield}>
            <TextField
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              name="textoBusqueda"
              variant="outlined"
              label="Ingrese el inmueble a buscar"
              onChange={this.cambiarBusquedaTexto}
              value={this.state.textoBusqueda}
            />
          </Grid>

          {/*Mostrar las rutas*/}
          {this.state.rutas.map((ruta, index) => (
            <Grid item style={style.gridTextfield} key={ruta.idTramite}>
              {" "}
              Documento: {ruta.idTramite}
              
              
              {/* 
              Esta es la llamada de la funcion de afuera, si funciona bien pero nose como pasarle parametros.
              */}
              <SplitButton></SplitButton> 

              {/* 
              Este es el codigo de la funcion de arriba pero con las constantes creadas dentro de la clase.
              */}


              {/* <Grid container direction="column" alignItems="center">
                <Grid item xs={12}>
                  <ButtonGroup
                    variant="contained"
                    color="primary"
                    ref={this.state.anchorRef}
                    aria-label="split button"
                  >
                    <Button onClick={this.handleClick}>
                      {options[this.state.selectedIndex]}
                    </Button>
                    <Button
                      color="primary"
                      size="small"
                      aria-controls={this.state.open ? "split-button-menu" : undefined}
                      aria-expanded={this.state.open ? "true" : undefined}
                      aria-label="select merge strategy"
                      aria-haspopup="menu"
                       
                      // Esta linea se necesita para que muestre las opciones del combo Box
                      // onClick={handleToggle} 
                    >
                     
                      <ArrowDropDownIcon />
                    </Button>
                  </ButtonGroup>
                  <Popper
                    open={this.state.open}
                    // Aqui no se esta accediendo al tipo de dato cons que necesita para llamar al current.
                    anchorEl={this.state.anchorRef.current}
                    role={undefined}
                    transition
                    disablePortal
                  >
                    {({ TransitionProps, placement }) => (
                      <Grow
                        {...TransitionProps}
                        style={{
                          transformOrigin:
                            placement === "bottom"
                              ? "center top"
                              : "center bottom",
                        }}
                      >
                        <Paper>
                          <ClickAwayListener onClickAway={this.handleClose}>
                            <MenuList id="split-button-menu">
                              {options.map((option, index) => (
                                <MenuItem
                                  key={option}
                                  disabled={index === 2}
                                  selected={index === this.state.selectedIndex}
                                  onClick={(event) =>
                                    this.handleMenuItemClick(event, index)
                                  }
                                >
                                  {option}
                                </MenuItem>
                              ))}
                            </MenuList>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </Grid>
              </Grid> */}


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
            </Grid>
          ))}
        </Paper>
      </Container>
    );
  }
}

export default consumerFirebase(ListaTramites);

/*
    //Carga las recepciones
    let objectQuery = this.props.firebase.db
      .collection("Recepciones")
      .orderBy("fecha");
    const snapshot = await objectQuery.get();
    const arrayRecepcion = snapshot.docs.map((doc) => {
      let data = doc.data();
      let id = doc.id;
      return { id, ...data };
    });
    this.setState({recepciones: arrayRecepcion});
    console.log(this.state.recepciones);

    //Carga los traslados
    let objectQuery = this.props.firebase.db
    .collection("Traslados")
    .orderBy("fecha");
    const snapshot = await objectQuery.get();
    const arrayTraslado = snapshot.docs.map((doc) => {
      let data = doc.data();
      let id = doc.id;
      return { id, ...data };
    });
    this.setState({traslados: arrayTraslado});

    //Carga las asignaciones
    let objectQuery = this.props.firebase.db
      .collection("Asignaciones")
      .orderBy("fecha");
    const snapshot = await objectQuery.get();
    const arrayAsignacion = snapshot.docs.map((doc) => {
      let data = doc.data();
      let id = doc.id;
      return { id, ...data };
    });
    this.setState({asignaciones: arrayAsignacion});
    */

/*
        //Cargar todas los traslados que cumplan la busqueda
        let objectQuery = this.props.firebase.db
          .collection("Traslados")
          .orderBy("fecha")
          .where(
            "keywords",
            "array-contains",
            self.state.textoBusqueda.toLowerCase()
          );

        if (self.state.textoBusqueda.trim() === "") {
          objectQuery = this.props.firebase.db
            .collection("Traslados")
            .orderBy("fecha");
        }

        objectQuery.get().then((snapshot) => {
          const arrayInmueble = snapshot.docs.map((doc) => {
            let data = doc.data();
            let id = doc.id;
            return { id, ...data };
          });

          this.setState({
            traslados: arrayInmueble,
          });
        });

        //Cargar todas las asignaciones que cumplan la busqueda
        let objectQuery2 = this.props.firebase.db
          .collection("Asignaciones")
          .orderBy("fecha")
          .where(
            "keywords",
            "array-contains",
            self.state.textoBusqueda.toLowerCase()
          );

        if (self.state.textoBusqueda.trim() === "") {
          objectQuery2 = this.props.firebase.db
            .collection("Asignaciones")
            .orderBy("fecha");
        }

        objectQuery2.get().then((snapshot2) => {
          const arrayInmueble = snapshot2.docs.map((doc) => {
            let data = doc.data();
            let id = doc.id;
            return { id, ...data };
          });

          this.setState({
            asignaciones: arrayInmueble,
          });
        });

        //Cargar todas las recepciones que cumplan la busqueda
        let objectQuery3 = this.props.firebase.db
          .collection("Recepciones")
          .orderBy("fecha")
          .where(
            "keywords",
            "array-contains",
            self.state.textoBusqueda.toLowerCase()
          );

        if (self.state.textoBusqueda.trim() === "") {
          objectQuery3 = this.props.firebase.db
            .collection("Recepciones")
            .orderBy("fecha");
        }

        objectQuery3.get().then((snapshot3) => {
          const arrayInmueble = snapshot3.docs.map((doc) => {
            let data = doc.data();
            let id = doc.id;
            return { id, ...data };
          });
          this.setState({ recepciones: arrayInmueble });
        });
      */

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
