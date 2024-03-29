import React from "react";
import { List, Link, Avatar, ListItemText, ListItem } from "@material-ui/core";

export const MenuDerecha = ({
  classes,
  textoUsuario,
  fotoUsuario,
  salirSesion,
  verPerfil
}) => (
  <div className={classes.list}>
    <List>
      <ListItem button onClick={verPerfil}>
        <Avatar style={{backgroundColor: "#10A75F"}} alt={textoUsuario} src={fotoUsuario} />
        <ListItemText
          classes={{ primary: classes.listItemText }}
          primary={textoUsuario}
        />
      </ListItem>
      <ListItem button onClick={salirSesion}>
        <ListItemText
          classes={{ primary: classes.listItemText }}
          primary="Salir"
        />
      </ListItem>
    </List>
  </div>
);
