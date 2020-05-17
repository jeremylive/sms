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
    translados: [],
    asignaciones: [],
    recepciones: [],
  };

  async componentDidMount() {
    //Traslados
    let objectQuery = this.props.firebase.db
      .collection("Translados")
      .orderBy("fecha");

    const snapshot = await objectQuery.get();

    const arrayTranslado = snapshot.docs.map((doc) => {
      let data = doc.data();
      let id = doc.id;
      return { id, ...data };
    });

    this.setState({
      translados: arrayTranslado,
    });

    //Asignaciones
    let objectQuery2 = this.props.firebase.db
      .collection("Asignaciones")
      .orderBy("fecha");

    const snapshot2 = await objectQuery2.get();

    const arrayAsignacion = snapshot2.docs.map((doc) => {
      let data = doc.data();
      let id = doc.id;
      return { id, ...data };
    });

    this.setState({
      asignaciones: arrayAsignacion,
    });

    //Recepciones
    let objectQuery3 = this.props.firebase.db
      .collection("Recepciones")
      .orderBy("fecha");

    const snapshot3 = await objectQuery3.get();

    const arrayRecepcion = snapshot3.docs.map((doc) => {
      let data = doc.data();
      let id = doc.id;
      return { id, ...data };
    });

    this.setState({
      recepciones: arrayRecepcion,
    });
  }

  //Eliminar Traslados
  eliminarTranslado = (id) => {
    this.props.firebase.db
      .collection("Translados")
      .doc(id)
      .delete()
      .then((success) => {
        this.eliminarTransladoDeListaEstado(id);
      });
  };

  eliminarTransladoDeListaEstado = (id) => {
    const transladoListaNueva = this.state.translados.filter(
      (translado) => translado.id !== id
    );
    this.setState({
      translados: transladoListaNueva,
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

  getTranslado = (id) => {
    this.props.history.push("/tramite/translado/" + id);
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
              <Typography color="textPrimary">Transacción, asginació y recepción</Typography>
            </Breadcrumbs>
          </Grid>

          <Grid item xs={12} sm={12} style={style.gridTextfield}>
            <Grid container spacing={4}>
              {this.state.translados.map((card) => (
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
                      title="Translado"
                    />

                    <CardContent style={style.cardContent}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {"Transacion: " + card.asunto + ", " + card.transladoA}
                      </Typography>
                    </CardContent>

                    <CardActions>
                    <Button
                        size="small"
                        color="primary"
                        onClick={() => this.getTranslado(card.id)}
                      >
                        Visualizar
                      </Button>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => this.eliminarTranslado(card.id)}
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

          
        </Paper>
      </Container>
    );
  }
}

export default consumerFirebase(ListaTramites);
