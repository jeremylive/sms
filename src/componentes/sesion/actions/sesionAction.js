export const refrescarSesion = firebase => {
  return new Promise((resolve, eject) => {
    firebase.auth.onAuthStateChanged(user => {
      if(user){
        user.getIdToken(true);
        resolve();
      }
    });
  });
};


export const iniciarSesion = (dispatch, firebase, email, password) => {
  return new Promise((resolve, eject) => {
    firebase.auth
      .signInWithEmailAndPassword(email, password)
      .then((auth) => {
        firebase.db
          .collection("Users")
          .doc(auth.user.uid)
          .get()
          .then((doc) => {
            const usuarioDB = doc.data();
            dispatch({
              type: "INICIAR_SESION",
              sesion: usuarioDB,
              autenticado: true,
            });
            resolve({ status: true });
          });
      })
      .catch((error) => {
        console.log("error", error);
        resolve({ status: false, mensaje: error });
      });
  });
};

export const crearUsuario = (dispatch, firebase, usuario) => {
  return new Promise((resolve, eject) => {
    firebase.auth
      .createUserWithEmailAndPassword(usuario.email, usuario.password)
      .then((auth) => {
        firebase.db
          .collection("Users")
          .doc(auth.user.uid)
          .set(
            {
              id: auth.user.uid,
              email: usuario.email,
              nombre: usuario.nombre,
              apellido: usuario.apellido,
            },
            { merge: true }
          )
          .then((doc) => {
            usuario.id = auth.user.uid;
            dispatch({
              type: "INICIAR_SESION",
              sesion: usuario,
              atenticado: true,
            });
            resolve({ status: true });
          })
      })
      .catch((error) => {
        console.log("error", error);
        resolve({ status: false, mensaje: error });
      });
  });
};

export const salirSesion = (dispatch, firebase) => {
  return new Promise((resolve, eject) => {
    firebase.auth.signOut().then((salir) => {
      dispatch({
        type: "SALIR_SESION",
        nuevoUsuario: {
          nombre: "",
          apellido: "",
          email: "",
          foto: "",
          id: "",
          telefono: "",
        },
        autenticado: false,
      });
      resolve();
    });
  });
};
