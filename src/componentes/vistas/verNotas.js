import React, { Component } from "react";
import { consumerFirebase } from "../../server";
import {
  Container,
  Paper,
  Grid,
  Breadcrumbs,
  Link,
  Typography,
  Card,
  Button
} from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";

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
  nota: {
    padding: "6px",
    backgroundColor: "#ffffff",
    marginBottom: "10px"
  },
  link: {
    display: "flex",
  },
  homeIcon: {
    width: 20,
    height: 20,
    marginRight: "4px",
  },
};


class verNotas extends Component {
  state = {
    notas: []
  };

  async componentDidMount() {
    const { id } = this.props.match.params;

    //Cargar notas del tramite
    let notasQuery = this.props.firebase.db
      .collection("Notas")
      .orderBy("fecha", "asc")
      .where("idTramite", "==", id);
    let snapshotNotas = await notasQuery.get();
    let arrayNotas = snapshotNotas.docs.map((nota) => {
      let id = nota.id;
      let data = nota.data();
      //Ajusta el formato de la fecha
      let fechaString = data.fecha.toDate().toLocaleString(undefined, { hour12: "true" });
      data.fecha = fechaString;
      return { id, ...data };
    });
    
    this.setState({
      notas: arrayNotas,
    });
  }

  crearNota = (idTramite) => {
    this.props.history.push("/tramite/notas/"+idTramite+"/nueva");
  };

  render() {
    return (
      <Container style={style.container}>
        <Paper style={style.paper}>
          <Grid style={{marginBottom:"10px"}}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link color="inherit" style={style.link} href="/tramites">
                <HomeIcon style={style.homeIcon} />
                Trámites
              </Link>
              <Typography color="textPrimary">Notas del trámite{" "+this.props.match.params.id}</Typography>
            </Breadcrumbs>
          </Grid>

          {//Mostrar las notas
          this.state.notas.map((nota) => (
            <Grid item key={nota.id} xs={12} sm={6} md={2} style={{minWidth:"100%"}}>
              <Card style={style.nota}>
                Fecha: {nota.fecha}
                <p></p>
                {nota.contenido}
              </Card>
            </Grid>
          ))}
          <Button
            variant="contained"
            color="primary"
            size="small"
            disableElevation
            onClick={() => this.crearNota(this.props.match.params.id)}
          >
            Agregar nota
          </Button>
        </Paper>
      </Container>
    );
  }
}

export default consumerFirebase(verNotas);
