import axios from 'axios';

export const obtenerPermisoNotification = (firebase, usuario, dispatch) => {
    return new Promise(async(resolve, eject) =>{
        const message = firebase.messaging;
        await message.requestPermission();
        const token = await message.getToken();

        if(!usuario.tokenArreglo){
            usuario.tokenArreglo = [];
        }

        const tokenArregloFilter = usuario.tokenArreglo.filter(tk => tk !== token);
        tokenArregloFilter.push(token);
        
        usuario.tokenArreglo = tokenArregloFilter;

        firebase.db
            .collection("Users")
            .doc(firebase.auth.currentUser.uid)
            .set(usuario, {merge:true})
            .then(sucess => {

                dispatch({
                    type: "INICIAR_SESION",
                    sesion: usuario,
                    autenticado: true
                })
                resolve(true);
            })
            .catch(error => {
                resolve(false);
            })
    })
}

export const enviarNotification = (token) => {
    return new Promise(async(resolve, eject)=>{
       //const respuesta =  await axios.post("https://us-central1-smssendporwerfree.cloudfunctions.net/notificacionPoint", token);
       const respuesta =  await axios.post("https://us-central1-home-b0086.cloudfunctions.net/notificationEnviar", token);
       resolve(respuesta);
    })
}