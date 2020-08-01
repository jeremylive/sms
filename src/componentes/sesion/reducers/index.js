import sesionReducer from "./sesionReducer";
import openSnackbarReducer from "./openSnackbarReducer";

export const mainReducer = ({ sesion, openSnackbar }, action) => {
  return {
    sesion: sesionReducer(sesion, action),
    openSnackbar: openSnackbarReducer(openSnackbar, action),
  };
};
