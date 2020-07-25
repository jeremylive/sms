import React, { Component } from "react";
import { consumerFirebase } from "../../server";
import {
  Container,
  Paper,
  Grid,
  Breadcrumbs,
  Typography,
  TextField,
  Button
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
    width: "auto"
  }
};

class NuevaNota extends Component {
  state = {
    nota: {
      idTramite: "",
      contenido: "",
      fecha: new Date()
    }
  };

  componentDidMount() {
    //Obtiene el id del tramite
    let nota_ = Object.assign({}, this.state.nota);
    nota_.idTramite = this.props.match.params.id;
    this.setState({
      nota: nota_,
    });
  };

  entradaDatoEnEstado = (e) => {
    let nota_ = Object.assign({}, this.state.nota);
    nota_[e.target.name] = e.target.value;
    this.setState({
      nota: nota_,
    });
  };

  crearNota = () => {
    //Guarda automaticamente la fecha en que se crea la nota
    this.state.fecha = new Date();

    this.props.firebase.db
      .collection("Notas")
      .add(this.state.nota)
      .then(() => {;
        this.props.history.goBack();
      })
      .catch((error) => {
        openMensajePantalla({
          open: true,
          mensaje: error,
        });
      });
  };

  render() {
    return (
      <Container style={style.container}>
        <Paper style={style.paper}>
          <Grid item xs={12} md={8}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link color="initial" style={style.link} to={"/tramite/notas/"+this.props.match.params.id}>
                <HomeIcon style={style.homeIcon} />
                Notas del trámite {this.props.match.params.id}
              </Link>
              <Typography color="textPrimary">Nueva nota</Typography>
            </Breadcrumbs>
          </Grid>

          <Grid item xs={12} sm={6} md={2} style={{minWidth:"80%"}}>
            <TextField
              name="contenido"
              label="Contenido de la nota"
              margin="dense"
              variant="outlined"
              rows={4}
              multiline
              style={{width:"100%"}}
              onChange={this.entradaDatoEnEstado}
              value={this.state.nota.contenido}
            > 
            </TextField>
          </Grid>

          <Button
            type="button"
            fullWidth
            variant="contained"
            color="primary"
            style={style.submit}
            onClick={this.crearNota}
          >
            Guardar nota
          </Button>
        </Paper>
      </Container>
    );
  }
}

export default consumerFirebase(NuevaNota);