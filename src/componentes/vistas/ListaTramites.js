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
} from "@material-ui/core";
import { Link } from "react-router-dom";
import HomeIcon from "@material-ui/icons/Home";
import logo from "../../logo.svg";

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

class ListaTramites extends Component {
  state = {
    traslados: [],
    asignaciones: [],
    recepciones: [],
    
    tramites: [],
    rutas: [],
    
    textoBusqueda: "",
  };

  async componentDidMount() {
    //Cargar trámites
    let tramitesQuery = this.props.firebase.db
      .collection("Tramites")
      .orderBy("fechaInicio","desc");
    const snapshot = await tramitesQuery.get();
    const arrayTramites = snapshot.docs.map((doc) => {
        let data = doc.data();
        let id = doc.id;
        return { id, ...data };
      });

    this.setState({tramites: arrayTramites});

    //Cargar rutas
    let rutas = [];
    for (const tramite of this.state.tramites) {
      const rutaQuery = this.props.firebase.db
      .collection("TareasXTramite")
      .where("idTramite","==",tramite.id)
      .orderBy("fecha")
      
      let snapshotRuta = await rutaQuery.get();
      let arrayRuta = snapshotRuta.docs.map((tarea) => {
        let data = tarea.data();
        return { ...data };
      });

      let tareas = [];
      for (const tarea of arrayRuta) {
        this.props.firebase.db
        .collection(tarea.tipoTarea)
        .doc(tarea.idTarea)
        .get()
        .then((result) => {
          let data = result.data();
          tareas.push({ tipoTarea: tarea.tipoTarea, id: tarea.idTarea, ...data});
        });
      }
      rutas.push({idTramite: tramite.id, tareas});
    }
    this.setState({rutas: rutas});
    
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
  }

  //Eliminar Traslados
  eliminarTraslado = (id) => {
    this.props.firebase.db
      .collection("Traslados")
      .doc(id)
      .delete()
      .then((success) => {
        this.eliminarTrasladoDeListaEstado(id);
      });
  };

  eliminarTrasladoDeListaEstado = (id) => {
    const trasladoListaNueva = this.state.traslados.filter(
      (traslado) => traslado.id !== id
    );
    this.setState({
      traslados: trasladoListaNueva,
    });
  };

  //Eliminar Asignaciones
  eliminarAsignacion = (id) => {
    this.props.firebase.db
      .collection("Asignaciones")
      .doc(id)
      .delete()
      .then((success) => {
        this.eliminarAsignacionDeListaEstado(id);
      });
  };

  eliminarAsignacionDeListaEstado = (id) => {
    const asignacionListaNueva = this.state.asignaciones.filter(
      (asignacion) => asignacion.id !== id
    );
    this.setState({
      asignaciones: asignacionListaNueva,
    });
  };

  //Eliminar Recepciones
  eliminarRecepcion = (id) => {
    this.props.firebase.db
      .collection("Recepciones")
      .doc(id)
      .delete()
      .then((success) => {
        this.eliminarRecepcionDeListaEstado(id);
      });
  };

  eliminarRecepcionDeListaEstado = (id) => {
    const recepcionListaNueva = this.state.recepciones.filter(
      (recepcion) => recepcion.id !== id
    );
    this.setState({
      recepciones: recepcionListaNueva,
    });
  };

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
    self.setState({
      [e.target.name]: e.target.value,
    });

    if (self.state.typingTimeout) {
      clearTimeout(self.state.typingTimeout);
    }

    self.setState({
      name: e.target.value,
      typing: false,
      typingTimeout: setTimeout((goTime) => {

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

          this.setState({
            recepciones: arrayInmueble,
          });
        });



      }, 500),
    });
  };

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
              <Typography color="textPrimary">Traslados, asignaciones y recepciones</Typography>
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
          <Grid container style={style.gridTextfield} direction="column" alignitems="stretch">
            {this.state.rutas.map((ruta) => (
              <Grid container direction="row" alignitems="stretch" key={ruta.idTramite}>Documento: {ruta.idTramite}
                {ruta.tareas.map((tarea) => (
                  <Grid item key={tarea.id} xs={12} sm={6} md={2}>
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
                        Tarea
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ))}
          </Grid>
{/*

                      <CardContent style={style.cardContent}>
                        <Typography gutterBottom variant="h5" component="h2">
                          {"Recepcion: " + card.asunto + ", " + card.enviadoPor}
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
                          onClick={() => this.eliminarRecepcion(tarea.id)}
                        >
                          Eliminar
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ))}
          </Grid>

        
          <Grid item xs={12} sm={12} style={style.gridTextfield}>
            <Grid container spacing={4}>
              {this.state.traslados.map((card) => (
                <Grid item key={card.id} xs={12} sm={6} md={4}>
                  <Card style={style.card}>
                    <CardMedia
                      style={style.cardMedia}
                      image={
                        card.adjuntos
                          ? card.adjuntos[0]
                            ? card.adjuntos[0]
                            : logo
                          : logo
                      }
                      title="Traslado"
                    />

                    <CardContent style={style.cardContent}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {"Traslado: " + card.asunto + ", " + card.trasladoA}
                      </Typography>
                    </CardContent>

                    <CardActions>
                    <Button
                        size="small"
                        color="primary"
                        onClick={() => this.getTraslado(card.id)}
                      >
                        Visualizar
                      </Button>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => this.eliminarTraslado(card.id)}
                      >
                        Eliminar
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>


          <Grid item xs={12} sm={12} style={style.gridTextfield}>
            <Grid container spacing={4}>
              {this.state.asignaciones.map((card2) => (
                <Grid item key={card2.id} xs={12} sm={6} md={4}>
                  <Card style={style.card}>
                    <CardMedia
                      style={style.cardMedia}
                      image={
                        card2.adjuntos
                          ? card2.adjuntos[0]
                            ? card2.adjuntos[0]
                            : logo
                          : logo
                      }
                      title="Asignacion"
                    />

                    <CardContent style={style.cardContent}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {"Asignacion: " +
                          card2.asunto +
                          ", " +
                          card2.asignacionA}
                      </Typography>
                    </CardContent>

                    <CardActions>
                    <Button
                        size="small"
                        color="primary"
                        onClick={() => this.getAsignacion(card2.id)}
                      >
                        Visualizar
                      </Button>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => this.eliminarAsignacion(card2.id)}
                      >
                        Eliminar
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>


          <Grid item xs={12} sm={12} style={style.gridTextfield}>
            <Grid container spacing={4}>
              {this.state.recepciones.map((card3) => (
                <Grid item key={card3.id} xs={12} sm={6} md={4}>
                  <Card style={style.card}>
                    <CardMedia
                      style={style.cardMedia}
                      image={
                        card3.adjuntos
                          ? card3.adjuntos[0]
                            ? card3.adjuntos[0]
                            : logo
                          : logo
                      }
                      title="Recepcion"
                    />

                    <CardContent style={style.cardContent}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {"Recepcion: " +
                          card3.asunto +
                          ", " +
                          card3.enviadoPor}
                      </Typography>
                    </CardContent>

                    <CardActions>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => this.getRecepcion(card3.id)}
                      >
                        Visualizar
                      </Button>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => this.eliminarRecepcion(card3.id)}
                      >
                        Eliminar
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
          */}

        </Paper>
      </Container>
    );
  }
}

export default consumerFirebase(ListaTramites);
