import React, { Component } from 'react';
import * as firebaseui from 'firebaseui';
import { Container, Avatar, Typography, Grid, TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import LockOutlineIcon from '@material-ui/icons/LockOutlined';
import { consumerFirebase } from '../../server';
import {StateContext} from '../sesion/store';
import { openMensajePantalla } from '../sesion/actions/snackbarAction';


const style={
    paper:{
        marginTop: 9,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    avatar: {
        margin: 5,
        backgroundColor: "red"
    },
    form: {
        width: "100%",
        marginTop: 8
    },
    submit: {
        marginTop: 10,
        marginBottom: 20
    },
    captcha : {
        flexGrow  : 1,
        marginBottom : 10
    }
    
}



class LoginTelefono extends Component {
    static contextType = StateContext;

    state = {
        disable : true,
        dialogAbierto : false,
        codigoConfirmacion : null,
        usuario : {
            telefono : '',
            codigo : ''
        }
    }


    componentDidMount(){
        const {firebase} = this.props;

        firebase.auth.languageCode = "es";
        window.recaptchaVerifier = new firebase.authorization.RecaptchaVerifier(
            this.recaptcha,
            {
                size : "normal",
                callback : response => {
                    this.setState({
                        disable : false
                    })
                },
                "expired-callback" : function(){
                    this.setState({
                        disable: true
                    });

                    //window.location.reload();
                }
            }
        );

        window.recaptchaVerifier.render().then(function(widgetID){
            window.recaptchaVerifierId = widgetID;
        });


    }

    verificarNumero = e => {
        e.preventDefault();
        console.log('exeute o nor');
        const {firebase} = this.props;
        const appVerificacion = window.recaptchaVerifier;

        const [{sesion}, dispatch] = this.context;

        firebase.auth
            .signInWithPhoneNumber(this.state.usuario.telefono, appVerificacion)
            .then(codigoEnviado => {
                this.setState({
                      dialogAbierto : true,
                      codigoConfirmacion:codigoEnviado       
                })
            })
            .catch(error=>{
                console.log('error', error);
                openMensajePantalla(dispatch, {
                    open: true,
                    mensaje : error.message
                })
            })
    }

    onChange = e => {
        let usuario = Object.assign({}, this.state.usuario);
        usuario[e.target.name] = e.target.value;
        this.setState({usuario})

    }


    loginConTelefono = () => {
        const {firebase} = this.props;

        let credencial = firebase.authorization.PhoneAuthProvider.credential(this.state.codigoConfirmacion.verificationId, this.state.usuario.codigo);

        const [{usuario}, dispatch] = this.context;


        firebase.auth
            .signInAndRetrieveDataWithCredential(credencial)
                .then(authUser => {
                    firebase.db
                        .collection("Users")
                        .doc(authUser.user.uid)
                        .set({
                            id: authUser.user.uid,
                            telefono: authUser.user.phoneNumber
                        }, {merge: true} )
                        .then(success=>{

                            firebase.db
                                .collection("Users")
                                .doc(authUser.user.uid)
                                .get()
                                .then(doc=>{
                                    dispatch({
                                        type:'INICIAR_SESION',
                                        sesion : doc.data(),
                                        autenticado: true
                                    });
                                    this.props.history.push('/tramites');
                               })
                        })
                })
                .catch(error=>{
                    openMensajePantalla(dispatch, {
                        open: true,
                        mensaje : error.message
                    })
                })
                


    }

   
    render() {
        return (
            <Container maxWidth="xs">
                <Dialog open={this.state.dialogAbierto} onClose={()=>{  this.setState({ dialogAbierto: false}) } }>
                   <DialogTitle>Ingrese su codigo</DialogTitle> 
                   <DialogContent>
                       <DialogContentText>
                           Ingrese el codigo que recibio por mensaje de texto
                       </DialogContentText>
                        <TextField autoFocus margin="dense" name="codigo" fullWidth value={this.state.usuario.codigo} onChange={this.onChange}/>
                   </DialogContent>
                   <DialogActions>
                       <Button color="primary" onClick={()=>{  this.setState({ dialogAbierto: false}) } }>Cancelar</Button>
                       <Button color="primary" onClick={this.loginConTelefono}>Verificar</Button>
                   </DialogActions>

                </Dialog>


                <div style={style.paper}>
                    <Avatar style={style.avatar}>
                        <LockOutlineIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Ingrese numero telefonico
                    </Typography>
                    <form style={style.form}>
                        <Grid container style={style.captcha} justify="center">
                            <div ref={ref => (this.recaptcha = ref)}></div>    
                        </Grid>
                        <TextField 
                            variant="outlined"
                            fullWidth
                            name="telefono"
                            label="Ingrese numero telefonico"
                            value={this.state.usuario.telefono} 
                            onChange={this.onChange}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            style={style.submit}
                            onClick={this.verificarNumero}
                            disabled = {this.state.disable}
                        >
                            Enviar
                        </Button>
                        
                    </form>
                </div>
            </Container>
        );
    }
}

export default consumerFirebase(LoginTelefono);