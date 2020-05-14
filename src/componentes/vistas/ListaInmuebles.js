import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import { Container, Breadcrumbs, Typography, TextField, Grid, Paper, Link, CardMedia, Card, CardContent, CardActions, ButtonGroup } from "@material-ui/core";
import HomeIcon from '@material-ui/icons/Home';
import { consumerFirebase } from "../../server";
import logo from "../../logo.svg";
import ArrowLeft from '@material-ui/icons/ArrowLeft';
import ArrowRight from '@material-ui/icons/ArrowRight';

const style = {
  cardGrid: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  paper: {
    backgroundColor: "#f5f5f5",
    padding: "20px",
    minheight: 650
  },
  link: {
    display: "flex",
  },
  gridTextfield: {
      marginTop : "20px"
  },
  card: {
      height: "100%",
      display: "flex",
      flexDirection: "column"
  },
  cardMedia: {
      paddingTop: "56.25%"
  },
  cardContent: {
      flexGrow: 1
  },
  barraBoton: {
    marginTop: "20px"
  }
};

class ListaInmuebles extends Component {

  state = {
    inmuebles : [],
    textoBusqueda : ""
  }

  cambiarBusquedaTexto = e => {
    const self = this;
    self.setState({
        [e.target.name] : e.target.value
    })

    if(self.state.typingTimeout){
        clearTimeout(self.state.typingTimeout);
    }

    self.setState({
        name: e.target.value,
        typing: false,
        typingTimeout: setTimeout(goTime => {
            let objectQuery = this.props.firebase.db
                .collection("Inmuebles")
                .orderBy("direccion")
                .where("keywords", "array-contains", self.state.textoBusqueda.toLowerCase());
            
                if(self.state.textoBusqueda.trim()===""){
                    objectQuery = this.props.firebase.db
                    .collection("Inmuebles")
                    .orderBy("direccion")
                }

                objectQuery.get().then(snapshot => {
                    const arrayInmueble = snapshot.docs.map(doc => {
                        let data = doc.data();
                        let id = doc.id;
                        return {id, ...data};
                    })

                    this.setState({
                        inmuebles: arrayInmueble
                    })
                })
        })
    })
  }

  async componentDidMount(){
      let objectQuery = this.props.firebase.db.collection("Inmuebles").orderBy("direccion");

      const snapshot = await objectQuery.get();

      const arrayInmueble = snapshot.docs.map(doc => {
          let data = doc.data();
          let id = doc.id;
          return {id, ...data};
      })

      this.setState({
          inmuebles: arrayInmueble
      })
  }

  eliminarInmueble = id => {
      this.props.firebase.db
        .collection("Inmuebles")
        .doc(id)
        .delete()
        .then(success => {
            this.eliminarInmuebleDeListaEstado(id);
        })
  }

  eliminarInmuebleDeListaEstado = id => {
      const inmuebleListaNueva =  this.state.inmuebles.filter(
          inmueble => inmueble.id !== id
      )
      this.setState({
          inmuebles:inmuebleListaNueva
      })
  }

  editarInmueble = id => {
    this.props.history.push("/inmueble/" + id);
  };

  render() {
    return (
        <Container style={style.cardGrid}>
          <Paper style={style.paper}>
            <Grid item xs={12} sm={12}>
              <Breadcrumbs aria-label="breadcrumbs">
                <Link color="inherit" style={style.link} href="/">
                    <HomeIcon />
                    Home
                </Link>
                <Typography color="textPrimary">Mis Inmuebles</Typography>
              </Breadcrumbs>
            </Grid>
            <Grid item xs={12} sm={6} style={style.gridTextfield}>
                <TextField
                    fullWidth
                    InputLabelProps = {{
                        shrink : true
                    }}
                    name="textoBusqueda"
                    variant="outlined"
                    label="Ingrese el inmueble a buscar"
                    onChange={this.cambiarBusquedaTexto}
                    value={this.state.textoBusqueda}
                />
            </Grid>

            <Grid item xs={12} sm={12} style={style.barraBoton}>
              <Grid container spacing={1} direction="column" alignItems="flex-end">
                <ButtonGroup size="small" aria-label="Small outlined group">
                  <Button>
                    <ArrowLeft />
                  </Button>
                  <Button>
                    <ArrowRight />
                  </Button>
                </ButtonGroup>
              </Grid>
            </Grid>

            <Grid item xs={12} sm={12} style={style.gridTextfield}>
              <Grid container spacing={4}>
                {this.state.inmuebles.map(card => (
                    <Grid item key={card.id} xs={12} sm={6} md={4}>
                      <Card style={style.card}>

                        <CardMedia
                          style={style.cardMedia}
                          image={
                              card.fotos
                              ? card.fotos[0]
                                ? card.fotos[0]
                                : logo
                              : logo
                          }
                          title="Mi Inmueble"
                        />

                        <CardContent style={style.cardContent}>
                            <Typography gutterBottom variant="h5" component="h2">
                                {card.ciudad + ", " + card.pais}
                            </Typography>
                        </CardContent>

                        <CardActions >
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => this.editarInmueble(card.id)}
                          >
                              Editar
                          </Button>
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => this.eliminarInmueble(card.id)}
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

export default consumerFirebase(ListaInmuebles);
