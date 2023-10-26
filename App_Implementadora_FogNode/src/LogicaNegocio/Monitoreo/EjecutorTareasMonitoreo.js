

setTimeout(() => {
    SuscriptorTopicos()
}, 2000);

setTimeout(() => {
    ImplementadorApis();
}, 4000);

setTimeout(() => {
    ImplementadorServicios();
}, 2000);

setTimeout(() => {
  ImplementadorAplicaciones();
}, 2000);


function SuscriptorTopicos(){
    require('../../Comunicacion/Monitoreo/SuscriptorTopicos')
}

function ImplementadorApis(){
    require('../Monitoreo/ImplementadorApis')
}

function ImplementadorServicios(){
    require('../../Comunicacion/Monitoreo/ImplementadorServicios')
}

function ImplementadorAplicaciones(){
  require('../../LogicaNegocio/Monitoreo/ImplementadorAplicaciones')
}


/* function ImplementadorBD(){
    require('../General/ImplementadorBD')
} */
//ImplementadorBD()


/* const data = require("../../../modelos/modeloJSON.json");

//extraer los procesos de autconsciencia
const procesosenjson = buscarValor(data, "ControlAmbiental", 8); //corregir que la busqueda no sea 'Control Ambiental'
console.log(procesosenjson);  */
//cambiar paths por objetos necesarios para procesos pre-reflexivos y reflexivos
/* cambiarValorPropiedad(procesosenjson, "collectsProperty", data, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
cambiarValorPropiedad(procesosenjson, "columns_paths", data, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$" //PREGUNTAR
//PREGUNTAR BIEN LO DE LAS TABLAS DE LAS BASES DE DATOS Y SUS COLUMNAS RESPECTIVAS
cambiarValorPropiedad(procesosenjson, "produces", data, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
cambiarValorPropiedad(procesosenjson, "captures", data, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
cambiarValorPropiedad(procesosenjson, "isImplementedBy", data, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
cambiarValorPropiedad(procesosenjson, "uses", data, "containsThreshold"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "containsThreshold"
cambiarValorPropiedad(procesosenjson, "recommends", data, "$");
//adicionales
cambiarValorPropiedad(procesosenjson, "relatesParameter", data, "$");
cambiarValorPropiedad(procesosenjson, "relatesMetric", data, "$"); */

//dividir los procesos segun su identificacion (pre-reflexivos o reflexivos)
/* let arregloProcesosDiv = dividirProcesos(procesosenjson);
const prereflexivos = arregloProcesosDiv["pre-reflexive"];
const reflexivos = arregloProcesosDiv["reflexive"];
const entidad = arregloProcesosDiv["entity"];

module.exports = {
  pro_prereflexivos: prereflexivos,
  pro_reflexivos: reflexivos,
  entidad : entidad,
  
}; */

//llamar a las funciones/archivos correspondientes a cada tarea (implementardemoniospre, implementardemoniosre, implmentadorfunciones...)
/* ImplementadorDemoniosPrereflexivos(); */

/* function ImplementadorDemoniosPrereflexivos() {
  console.log(
    "Enviando demonios pre-reflexivos a ImplementadorDemoniosPreReflexivos.js"
  );
  require("../Autoconsciencia/ImplementadorDemoniosPreReflexivos");
} */

//FUNCION PARA CAMBIAR EL PATH DE UNA PROPIEDAD POR EL VALOR
function cambiarValorPropiedad(objeto, propiedad, objson, propiedadExtraer) {
  //FUNCION PARA CAMBIAR EL PATH DE UNA PROPIEDAD POR EL VALOR
  for (var key in objeto) {
    if (typeof objeto[key] === "object") {
      cambiarValorPropiedad(objeto[key], propiedad, objson, propiedadExtraer); // Llamada recursiva
    } else if (key === propiedad) {
      valorcambiar = objeto[key]; //obtener el valor de la propiedad para poder buscar en el json
      //   if (valorcambiar !== undefined) { //verificar en caso que el valor a cambiar este definido como undefined, no se cambia
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
      //   }
    }
  }
}

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

  valor = obtenerParesClaveValor(valor[`${propiedadExtraer}`]); // Obtener los pares clave-valor del objeto en la propiedad "$"
//   valor = obtenerParesClaveValor(valor, propiedadExtraer); //mejora en caso que no tenga la propiedad buscada deje igual
  // valor = obtenerParesClaveValor(valor["containsThreshold"]); //para el caso de obtener las recomendaciones
  return valor; //Devolver el valor buscado con la ruta
}

function obtenerParesClaveValor(objeto) {
  if (!objeto) {
    return objeto; // Si el objeto es nulo o undefined, devolverlo sin cambios
  }
  const resultado = {}; // Objeto vacío para almacenar los pares clave-valor resultantes
  for (let clave in objeto) {
    // Iterar sobre cada clave en el objeto de entrada
    resultado[clave] = objeto[clave]; // Asignar el valor correspondiente a la clave en el objeto de entrada al objeto resultado
  }
  return resultado; // Devolver el objeto resultado
}

//version mejorada
// function obtenerParesClaveValor(objeto, propiedadExtraer) {
//   if (!objeto || typeof objeto !== "object") {
//     return objeto; // Si el objeto es nulo, undefined o no es un objeto, devolverlo sin cambios
//   }

//   if (propiedadExtraer in objeto) {
//     // Verificar si la propiedadExtraer está presente en el objeto
//     const resultado = {}; // Objeto vacío para almacenar los pares clave-valor resultantes
//     for (let clave in objeto) {
//       // Iterar sobre cada clave en el objeto de entrada
//       resultado[clave] = objeto[clave]; // Asignar el valor correspondiente a la clave en el objeto de entrada al objeto resultado
//     }
//     return resultado; // Devolver el objeto resultado con las propiedades clonadas
//   } else {
//     return objeto; // Si propiedadExtraer no está presente, devolver el objeto sin cambios
//   }
// }
//fin version mejorada

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

//FUNCION PARA DIVIDIR LOS PROCESOS, SEPARARLOS EN REFLEXIVOS O PRE-REFLEXIVOS
function dividirProcesos(nodoprocesos) {
  let preReflexive = [];
  let reflexive = [];
  let sujeto = "";
  nodoprocesos.forEach((element) => {
    // console.log("element: ", element);
    // console.log(typeof element);
    if (element.hasOwnProperty("containsSelfAwarenessProcess")) {
      sujeto = element["id"] + "," + element["name"];
    //   sujeto = element["name"] + "," + element["id"];
      //   console.log("sujeto: ", sujeto);
      element["containsSelfAwarenessProcess"].forEach((item) => {
        let content = Object.entries(item);
        if (item["xsi:type"] === "pre-reflexive") {
          preReflexive.push(item);
        } else {
          reflexive.push(item);
        }
      });
    }
  });
  let process = {
    entity: sujeto,
    // // dataBaseConnection: [nodo[1]],
    "pre-reflexive": preReflexive,
    reflexive: reflexive,
  };
  return process;
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
