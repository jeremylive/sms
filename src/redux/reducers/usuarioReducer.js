const initialState = {
    usuarios : [],
    mensaje: {}
}

export default function (state = initialState, action){
    switch(action.type){
        case "LISTA_USUARIOS" : 
          return {
              ...state,
              usuarios : action.payload
          }
          
        case "ACTUALIZAR_ROLES":
            return {
                ...state,
                mensaje: action.payload
            }
        
        default : 
          return state;
    }
}