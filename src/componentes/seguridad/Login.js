import React, { Component } from "react";
import {
  Container,
  Avatar,
  Typography,
  TextField,
  Button,
  Grid,
} from "@material-ui/core";
import LockOutLineIcon from "@material-ui/icons/LockOutlined";
import { compose } from "recompose";
import { consumerFirebase } from "../../server";
import { iniciarSesion } from "../sesion/actions/sesionAction";
import { StateContext } from "../sesion/store";
import { openMensajePantalla } from "../sesion/actions/snackbarAction";
import { Link } from "react-router-dom";

const style = {
  paper: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: 5,
    backgroundColor: "#10A75F",
  },
  form: {
    width: "100%",
    marginTop: 8,
  },
  submit: {
    marginTop: 10,
    marginBottom: 10,
  }
};

class Login extends Component {
  static contextType = StateContext;

  state = {
    firebase: null,
    usuario: {
      email: "",
      password: "",
    },
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.firebase === prevState.firebase) {
      return null;
    }

    return {
      firebase: nextProps.firebase,
    };
  }

  onChange = (e) => {
    let usuario = Object.assign({}, this.state.usuario);
    usuario[e.target.name] = e.target.value;
    this.setState({
      usuario: usuario,
    });
  };

  login = async (e) => {
    e.preventDefault();
    const [{ sesion }, dispatch] = this.context;
    const { firebase, usuario } = this.state;
    const { email, password } = usuario;

    let callback = await iniciarSesion(dispatch, firebase, email, password);
    if (callback.status) {
      this.props.history.push("/tramites");
    } else {
      openMensajePantalla(dispatch, {
        open: true,
        mensaje: callback.mensaje.message,
      });
    }
  };

  resetearPassword = () => {
    const {firebase, usuario} = this.state;
    const [{sesion}, dispatch] = this.context;

    firebase.auth.sendPasswordResetEmail(usuario.email)
        .then(success=>{
            openMensajePantalla(dispatch,{
                open: true,
                mensaje: "Se ha enviado un correo electronico a tu cuenta"
            })
        })
        .catch(error=>{
            openMensajePantalla(dispatch, {
                open : true,
                mensaje: error.message
            })
        })
}

  render() {
    return (
      <Container maxWidth="xs">
        <div style={style.paper}>
          <Avatar style={style.avatar}>
            <LockOutLineIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Inicio de sesión
          </Typography>
          <form style={style.form}>
            <TextField
              variant="outlined"
              label="Correo electrónico"
              name="email"
              fullWidth
              margin="normal"
              onChange={this.onChange}
              value={this.state.usuario.email}
            />
            <TextField
              variant="outlined"
              label="Contraseña"
              type="password"
              name="password"
              fullWidth
              margin="normal"
              onChange={this.onChange}
              value={this.state.usuario.password}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              onClick={this.login}
              style={style.submit}
            >
              Ingresar
            </Button>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              style={style.submit}
              href="/auth/loginTelefono"
            >
              Ingrese con su teléfono
            </Button>

            <Grid container style={{marginTop:"10px"}}>
            <Grid item xs>
                <Link href="#" variant="body2" onClick={this.resetearPassword}>
                  {"¿Olvidó su contraseña?"}
                </Link>
              </Grid>

              <Grid item>
                <Link to="/auth/registrarusuario" variant="body2">
                  {"Registrar un usuario nuevo"}
                </Link>
              </Grid>
              
            </Grid>
          </form>

        </div>
      </Container>
    );
  }
}

export default compose(consumerFirebase)(Login);
