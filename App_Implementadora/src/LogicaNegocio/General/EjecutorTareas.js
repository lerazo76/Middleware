// Empieza aqui 
// Verifica el tipo de ejecucion
// Si es uno solo realizo monitoreo/Ejecutor Tareas Monitoreo
// Si es dos ejecuto tanto monitoreo como autoconsciencia

let recolector = require('../../Comunicacion/General/Recolector');
let tipoEjecucion = recolector.tipoEjecucion;
tipoEjecucion = 1; // Revisar OJOOOOOOOO

if (tipoEjecucion === 1){
    console.log('\n\x1b[32m%s\x1b[0m', 'MOTOR DE SINCRONIZACION DE RECURSOS DE MONITOREO');
    
    setTimeout(() => {
        ImplementadorBD()
    }, 2000);

    setTimeout(() => {
        ejecutorTareasMonitoreo()   
    }, 4000)
     
}else{
    // Codigo para ejecutar tanto monitoreo como autoconsciencia 
}

function ejecutorTareasMonitoreo(){
    require('../Monitoreo/EjecutorTareasMonitoreo')
}

function ImplementadorBD(){
    require('../General/ImplementadorBD')
}


/*
 const data = require("../../../modelos/modeloJSON.json");
 const procesosenjson = buscarValor(data, "ControlAmbiental", 8); 
cambiarValorPropiedad(procesosenjson, "collectsProperty", data, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
cambiarValorPropiedad(procesosenjson, "columns_paths", data, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$" //PREGUNTAR
//PREGUNTAR BIEN LO DE LAS TABLAS DE LAS BASES DE DATOS Y SUS COLUMNAS RESPECTIVAS
cambiarValorPropiedad(procesosenjson, "produces", data, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
cambiarValorPropiedad(procesosenjson, "captures", data, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
cambiarValorPropiedad(procesosenjson, "isImplementedBy", data, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
cambiarValorPropiedad(procesosenjson, "uses", data, "containsThreshold"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "containsThreshold"
cambiarValorPropiedad(procesosenjson, "recommends", data, "$");
//adicionales
cambiarValorPropiedad(procesosenjson, "relatesParameter", data, "$");
cambiarValorPropiedad(procesosenjson, "relatesMetric", data, "$");
console.log(procesosenjson[0]); */

/* FUNCIONES */

function cambiarValorPropiedad(objeto, propiedad, objson, propiedadExtraer) {
    //FUNCION PARA CAMBIAR EL PATH DE UNA PROPIEDAD POR EL VALOR
    for (var key in objeto) {
      if (typeof objeto[key] === "object") {
        cambiarValorPropiedad(objeto[key], propiedad, objson, propiedadExtraer); // Llamada recursiva
      } else if (key === propiedad) {
        valorcambiar = objeto[key]; //obtener el valor de la propiedad para poder buscar en el json
        //   if (valorcambiar !== undefined) { //verificar en caso que el valor a cambiar este definido como undefined, no se cambia
        if(valorcambiar){
            numrutas = valorcambiar.split(" "); //verificar si tiene uno o dos path
            if (numrutas.length > 1) {
            //caso dos rutas o mas
            let arraynuevRutas = [];
            numrutas.forEach((element) => {
                ruta = transformaraRuta(element); //conseguir la ruta del elemento
                ruta = "ArchitectureSelfAwarenessIoT." + ruta; //se agrega la key inicial a la ruta para poder acceder
            //   console.log("ruta 2 mas: ", ruta);
                nuevoValor = buscarValorConRuta(objson, ruta, propiedadExtraer); //llamado a la funcion para buscar el valor con la ruta armada
                arraynuevRutas.push(nuevoValor); //almacenar en un array los valores
            });
            objeto[key] = arraynuevRutas; //como una propiedad tiene dos o mas valores se agrega el array
            } else {
            ruta = transformaraRuta(valorcambiar);
            ruta = "ArchitectureSelfAwarenessIoT." + ruta;
            // console.log("ruta 1 sola: ", ruta);
            nuevoValor = buscarValorConRuta(objson, ruta, propiedadExtraer);
            objeto[key] = nuevoValor;
            }
        }
        //   }
      }
    }
  }


function transformaraRuta(cadena) {
    const sinBarras = cadena.replace(/\//g, ""); // Eliminar todas las barras diagonales ('/') de la cadena
    let sinBarrasYarroba = sinBarras.replace(
     /@/g,
      (coincidencia, desplazamiento) => {
        // Reemplazar todas las apariciones del carácter '@' y cambiarlos por punto
        return desplazamiento === 0 ? coincidencia : "."; //
      }
    );
    sinBarrasYarroba = sinBarrasYarroba.slice(1);
    return sinBarrasYarroba; // Devolver el valor final de que es la ruta
}

//subfuncion para cambiar el path de una propiedad por el valor
function buscarValorConRuta(objeto, ruta, propiedadExtraer) {
  const propiedades = ruta.split("."); // Dividir la ruta en propiedades separadas por puntos
  //   console.log("propiedades: ", propiedades);
  let valor = objeto; // Inicializar "valor" con el objeto de entrada
  //   console.log(".......................");
  for (let prop of propiedades) {
    // Iterar sobre cada propiedad en el arreglo "propiedades"
    valor = valor[prop]; // Acceder a la propiedad actual en el objeto "valor"
    if (valor === undefined) {
      // Si el valor es indefinido,la ruta no es válida
      console.log("Entro a undefined");
      return undefined;
    }
  }
  if(propiedadExtraer != null){ //verifica si se envio la propiedad a extraer y obtiene los pares clave valor de esa propiedad
    valor = obtenerParesClaveValor(valor[`${propiedadExtraer}`]); 
  }
  return valor; //Devolver el valor buscado con la ruta
}

//subfuncion para cambiar el path de una propiedad por el valor y obtener los pares clave
function obtenerParesClaveValor(objeto) {
  if (!objeto) {
    return objeto; // Si el objeto es nulo o undefined, devolverlo sin cambios
  }
  if (!Array.isArray(objeto)) {
    return objeto; // Si el objeto no es un array, devolverlo sin cambios
  }
  const resultado = {}; // Objeto vacío para almacenar los pares clave-valor resultantes
  for (let clave in objeto) {
    // Iterar sobre cada clave en el objeto de entrada
    resultado[clave] = objeto[clave]; // Asignar el valor correspondiente a la clave en el objeto de entrada al objeto resultado
  }
  return resultado; // Devolver el objeto resultado
}

//VER BIEN COMO IMPORTAR ESTAS FUNCIONES
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
  
module.exports = {
    buscarValor,
    cambiarValorPropiedad,
    transformaraRuta,
    buscarValorConRuta
}