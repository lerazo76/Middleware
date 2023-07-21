/* PLANIFICADOR TAREAS
  se encarga de comparar la nueva version detectada del modelo arquitectura de monitoreo con la configuracion de monitoreo 
  en ejecucion del sistema.
*/

const fs = require("fs");
let StartApp = require("../../../StartApp");
let filePath = StartApp.filePath;
let tipoEjecucion = StartApp.tipoEjecucion;
let json = JSON.parse(fs.readFileSync("./modelos/Modelo.json", "utf8"));

/*CODIGO ALEX, FUNCION PARA BUSCAR EN EL JSON LOS NODOS Y CONVERTIRLOS A ARREGLOS DE OBJETOS INCLUYENDO EL NUMERO DE NIVELES DESEADO */

function buscarValor(objeto, parametro, nivel) {
  const resultados = [];
  const arrayformat = [];
  const pila = [{ objeto, objetoPadre: null, keyPadre: null }];
  while (pila.length > 0) {
    const { objeto: obj, objetoPadre, keyPadre } = pila.pop();
    for (const key in obj) {
      if (obj[key] === parametro) {
        const resultado = {
          // tipo: obj[key],
          objetoPadre: Object.assign({}, objetoPadre, { [keyPadre]: obj }),
        };
        resultados.push(resultado);
      } else if (typeof obj[key] === "object") {
        pila.push({ objeto: obj[key], objetoPadre: obj, keyPadre: key });
      }
    }
  }
  for (let i = 0; i < resultados.length; i++) {
    //recorrer el arreglo resultados si se encontro mas de una coincidencia del parametro y trabajar con cada una
    objetoPadreActual = resultados[i].objetoPadre; //obtener la instancia de objeto padre
    //Separar objetoPadreActual en el numero de niveles indicado
    let objNivelesEstruct = estructurarObj(objetoPadreActual, nivel);
    arrayformat.push(objNivelesEstruct);
  }
  return arrayformat;
}

function estructurarObj(obj, nivelMax = Infinity) {
  function descomponer(obj, nivel = 1, clavePadre = "") {
    if (nivel > nivelMax) {
      return obj;
    }
    const atributos = obj["$"]; //obtener los atributos del objeto actual
    const clavesAnidadas = Object.keys(obj).filter((clave) => clave !== "$"); //obtener las subclaves excepto $
    const objetoAplanado = { ...atributos }; //instancia de objeto aplanado
    if (nivel < nivelMax && clavesAnidadas.length > 0) {
      //verificar el nivel y la existencia de claves anidadas
      for (const clave of clavesAnidadas) {
        //recorrer claves anidadas
        if (Array.isArray(obj[clave])) {
          //si clave es un array llamar recursivamente a descomponer
          objetoAplanado[clave] = []; //array que tendra los resultados de descomponer cada elemento del array
          obj[clave].forEach((item, indice) => {
            const objetoAnidado = descomponer(
              item,
              nivel + 1,
              `${clavePadre}.${clave}[${indice}]` //se actualiza la clave del nivel superior para que se refleje la jerarquia de niveles
            );
            objetoAplanado[clave].push(objetoAnidado); //se agrega los resultados al objeto vacio inicializado anteriormente
          });
        } else {
          //si no es un array
          // const objetoAnidado = descomponer(
          //   //se llama a la función descomponer para el objeto anidado
          //   obj[clave],
          //   nivel + 1, //se incrementa el nivel
          //   `${clavePadre}.${clave}` //se actualiza la clave del nivel superior para que se refleje la jerarquia de niveles
          // );
          // objetoAplanado[clave] = objetoAnidado; // se agrega los resultados a objetoAplanado
          objetoAplanado[clave] = obj[clave]; //al ser un valor no se tiene que dividir ni recorrer varias veces
        }
      }
    }
    return objetoAplanado;
  }
  return descomponer(obj);
}

/*SUBFUNCION PARA CAMBIAR EL PATH DE UN ATRIBUTO DEL ARREGLO DE OBJETOS DE LOS NODOS AL VALOR CORRESPONDIENTE */
function cambiarValorPropiedad(objeto, propiedad, objson) { //FUNCION PARA CAMBIAR EL PATH DE UNA PROPIEDAD POR EL VALOR 
  for (var key in objeto) {
    if (typeof objeto[key] === "object") {
      cambiarValorPropiedad(objeto[key], propiedad, objson); // Llamada recursiva
    } else if (key === propiedad) {
      valorcambiar = objeto[key]; //obtener el valor de la propiedad para poder buscar en el json
      numrutas = valorcambiar.split(" "); //verificar si tiene uno o dos path
      if (numrutas.length > 1) {
        //caso dos rutas o mas
        let arraynuevRutas = [];
        numrutas.forEach((element) => {
          ruta = transformaraRuta(element); //conseguir la ruta del elemento 
          ruta = "ArchitectureSelfAwarenessIoT." + ruta; //se agrega la key inicial a la ruta para poder acceder
          nuevoValor = buscarValorConRuta(objson, ruta); //llamado a la funcion para buscar el valor con la ruta armada
          arraynuevRutas.push(nuevoValor); //almacenar en un array los valores
          ;
        }); 
        objeto[key] = arraynuevRutas;  //como una propiedad tiene dos o mas valores se agrega el array
      } else {
        ruta = transformaraRuta(valorcambiar);
        ruta = "ArchitectureSelfAwarenessIoT." + ruta ;
        nuevoValor = buscarValorConRuta(objson, ruta);
        objeto[key] = nuevoValor;
      }
    }
  }
}

function buscarValorConRuta(objeto, ruta) {
  const propiedades = ruta.split("."); // Dividir la ruta en propiedades separadas por puntos 
  let valor = objeto; // Inicializar "valor" con el objeto de entrada
  for (let prop of propiedades) { // Iterar sobre cada propiedad en el arreglo "propiedades"
    valor = valor[prop]; // Acceder a la propiedad actual en el objeto "valor"
    if (valor === undefined) { // Si el valor es indefinido,la ruta no es válida
      return undefined;
    }
  }
  valor = obtenerParesClaveValor(valor["$"]); // Obtener los pares clave-valor del objeto en la propiedad "$"
  return valor; //Devolver el valor buscado con la ruta
}

function obtenerParesClaveValor(objeto) { 
  const resultado = {}; // Objeto vacío para almacenar los pares clave-valor resultantes
  for (let clave in objeto) { // Iterar sobre cada clave en el objeto de entrada
    resultado[clave] = objeto[clave]; // Asignar el valor correspondiente a la clave en el objeto de entrada al objeto resultado
  }
  return resultado; // Devolver el objeto resultado 
}

function transformaraRuta(cadena) { 
  const sinBarras = cadena.replace(/\//g, ''); // Eliminar todas las barras diagonales ('/') de la cadena
  let sinBarrasYarroba = sinBarras.replace(/@/g, (coincidencia, desplazamiento) => { // Reemplazar todas las apariciones del carácter '@' y cambiarlos por punto
    return desplazamiento === 0 ? coincidencia : '.'; // 
  });
  sinBarrasYarroba = sinBarrasYarroba.slice(1); 
  return sinBarrasYarroba; // Devolver el valor final de que es la ruta
} /* FIN SUBFUNCION PARA CAMBIAR EL PATH DE UN ATRIBUTO DEL ARREGLO DE OBJETOS DE LOS NODOS AL VALOR CORRESPONDIENTE */

/* Convertir el modeloJSON en un arreglo de objetos, haciendo un llamado a la funcion buscarValor */
const arregloNodos = [];
const nodosCloud = buscarValor(json, "MonitorIoT:CloudNode", 4);
const nodosFog = buscarValor(json, "MonitorIoT:FogNode", 4);
const nodosIotGateway = buscarValor(json, "MonitorIoT:IoTGateway", 4);
arregloNodos.push(nodosCloud);
arregloNodos.push(nodosFog);
arregloNodos.push(nodosIotGateway);
console.log('\nCreando Modelo de Objetos......................\n');

module.exports = {
    modeloJSON: json, // contiene todo el modelo JSON
    modeloOBJETO: arregloNodos // contiene los nodos CloudNode, FogNode, IoTGateway
}

orquestador(); // Llamamos al archivo Orquestador

function orquestador() {
  require("./Orquestador");
}
