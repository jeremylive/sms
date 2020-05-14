export const openMensajePantalla = (dispatch, openMensaje) => {
  dispatch({
    type: "OPEN_SNACKBAR",
    openMensaje: openMensaje,
  });
};
