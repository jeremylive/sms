import React from "react";
import { List, ListItem, ListItemText, Divider } from "@material-ui/core";
import { Link } from "react-router-dom";

export const MenuIzquierda = ({ classes, permisoToGetNotification }) => (
  <div className={classes.list}>
    {/* <List>
      <ListItem component={Link} button to="/auth/perfil">
        <i className="material-icons">account_box</i>
        <ListItemText
          classes={{ primary: classes.listItemText }}
          primary="Perfil"
        />
      </ListItem>
    </List>
    <Divider /> */}
    
    <ListItem component={Link} button to="/tramites">
        <i className="material-icons">business</i>
        <ListItemText
          classes={{ primary: classes.listItemText }}
          primary="Trámites activos"
        />
    </ListItem>
    <Divider/>
    <List>
      <ListItem component={Link} button to="/tramite/recepcion/nuevo">
        <i className="material-icons">add_box</i>
        <ListItemText
          classes={{ primary: classes.listItemText }}
          primary="Nueva Recepción"
        />
      </ListItem>
      <ListItem component={Link} button to="/tramite/asignacion/nuevo">
        <i className="material-icons">add_box</i>
        <ListItemText
          classes={{ primary: classes.listItemText }}
          primary="Nueva Asignacion"
        />
      </ListItem>
      <ListItem component={Link} button to="/tramite/traslado/nuevo">
        <i className="material-icons">add_box</i>
        <ListItemText
          classes={{ primary: classes.listItemText }}
          primary="Nuevo Traslado"
        />
      </ListItem>




      {/* <ListItem button onClick={permisoToGetNotification}>
        <i className="material-icons">notifications_none</i>
        <ListItemText
          classes={{ primary: classes.listItemText }}
          primary="Recibir Notificaciones"
        />
      </ListItem> */}

{/* 
      <ListItem component={Link} button to="/listausuarios">
        <i className="material-icons">group</i>
        <ListItemText
          classes={{ primary: classes.listItemText }}
          primary="Lista de usuarios"
        />
      </ListItem> */}

{/* 
      <ListItem component={Link} button to="/auth/UsuariosCreados">
        <i className="material-icons">group</i>
        <ListItemText
          classes={{ primary: classes.listItemText }}
          primary="Usuarios creados"
        />
      </ListItem> */}

      {/* <ListItem component={Link} button to="/inmueble/nuevo">
        <i className="material-icons">add_box</i>
        <ListItemText
          classes={{ primary: classes.listItemText }}
          primary="Nuevo Inmueble"
        />
      </ListItem>
      <ListItem component={Link} button to="">
        <i className="material-icons">business</i>
        <ListItemText
          classes={{ primary: classes.listItemText }}
          primary="Inmueble"
        />
      </ListItem>
      <ListItem component={Link} button to="">
        <i className="material-icons">mail_outline</i>
        <ListItemText
          classes={{ primary: classes.listItemText }}
          primary="Mensaje"
        />
      </ListItem> */}
    </List>
  </div>
);
