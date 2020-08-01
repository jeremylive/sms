export const createKeyword = (text) => {
  const arregloKeywords = [];
  const arregloPalabras = text.match(/("[^"]+"|[^"\s]+)/g);

  arregloPalabras.forEach((palabra) => {
    let palabraResumida = "";
    palabra.split("").forEach((letra) => {
      palabraResumida += letra;
      arregloKeywords.push(palabraResumida.toLowerCase());
    });
  });

  let letraResumida;
  text.split("").forEach((letra) => {
    letraResumida += letra;
    arregloKeywords.push(letraResumida);
  });

  return arregloKeywords;
};
