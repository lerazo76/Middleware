//const importarmodelo = require("../../../../App_Supervisora/src/LogicaNegocio/General/PlanificadorTareas"); //revisar error de dependencias 
//circulares, el codigo de un archvio se ejecuta cuando solo quiero importar el modelo 
//const modelo = importarmodelo.modeloJSON;

// const fs = require("fs");
// const modelo = JSON.parse(fs.readFileSync("../../../modelos/modelotesisf.json", "utf-8"));
const modelo = require("../../../modelos/modelotesisfcopyCOLECTIVO.json"); 
const modeloNodo = require("../../../modelos/modeloObjeto.json"); 
const nodoComputacion = modeloNodo[0]["xsi:type"];
// const BDnodo = buscarValor(modeloNodo, "")

// const BDnodoComputacion = modeloNodo[0]["containsResource"][0]["name"];
// console.log("Nodo desde modelo objeto ", nodoComputacion);


//extraer los procesos de autoconsciencia
const procesosenjson = buscarValor(modelo, "ControlAmbiental", 8); //corregir que la busqueda no sea 'Control Ambiental'
//cambiar paths por objetos necesarios para procesos pre-reflexivos y reflexivos
cambiarValorPropiedad(procesosenjson, "collectsProperty", modelo, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
// cambiarValorPropiedad(procesosenjson, "columns_paths", modelo, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$" //PREGUNTAR
//ACTUALIZACION NO CAMBIAR AQUI SI NO MAPEAR LA CONEXION DE BD, TABLA Y COLUMNA PARA CADA PROCESO
cambiarValorPropiedad(procesosenjson, "produces", modelo, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
// cambiarValorPropiedad(procesosenjson, "captures", modelo, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
//AQUI REALIZO CAMBIO AL MAPEO DE CAPTURES YA QUE EL ASPECTO SE RELACIONA AL OBJETO ES DECIR TOC DOBLE BUSQUEDA
procesosenjson.forEach((element) => {
  if (element.hasOwnProperty("containsSelfAwarenessProcess")) {
    element["containsSelfAwarenessProcess"].forEach((item) => {
      rutaaspecto = item["captures"];
      // console.log("ruta aspecto proceso", item['name'], "; ",rutaaspecto);
      rutaaspectomapeada = "ArchitectureSelfAwarenessIoT."+ transformaraRuta(rutaaspecto);
      // console.log("ruta aspecto mapeada ", rutaaspectomapeada);
      //verificar si tiene objeto relacionado o no (caso de ser colectivo no tiene objeto relacionado)
      try{
        rutaobjeto = buscarValorConRuta(modelo, rutaaspectomapeada, "belongsTo");
        if(rutaobjeto){
          rutaobjetomapeada = "ArchitectureSelfAwarenessIoT."+ transformaraRuta(rutaobjeto);
          // console.log("ruta objeto mapeada ", rutaobjetomapeada);
          objetoAutconsciencia = buscarValorConRuta(modelo, rutaobjetomapeada, "$");
          // console.log("objeto autoconsciencia ", objetoAutconsciencia );
          item["objetoautoconsciencia"] = objetoAutconsciencia;
        }else{
          item["objetoautoconsciencia"] = null;
        }
      }catch(e){
        console.log("Error mapeo ", e)
      }
    });
  }
});
//luego de esto si mapeo el captures para obtener el aspecto de autoconsciencia
cambiarValorPropiedad(procesosenjson, "captures", modelo);  //no se envia "$" ya que se necesita todo el objeto con sus propiedades
//FIN CAMBIO MAPEO CAPTURES
//mapeo isDerivedFrom de los aspectos colectivos para tener sus aspectos hijos
cambiarValorPropiedad(procesosenjson,"isDerivedFrom",modelo);
cambiarValorPropiedad(procesosenjson,"isCaptured",modelo);
//fin mapeo isDerivedFrom
cambiarValorPropiedad(procesosenjson, "isImplementedBy", modelo, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
cambiarValorPropiedad(procesosenjson, "uses", modelo, "containsThreshold"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "containsThreshold"
cambiarValorPropiedad(procesosenjson, "recommends", modelo, "$");
//adicionales
cambiarValorPropiedad(procesosenjson, "relatesParameter", modelo, "$");
cambiarValorPropiedad(procesosenjson, "relatesMetric", modelo, "$");
//obtener el nodo de comptuacion
cambiarValorPropiedad(procesosenjson,"computingNode", modelo, "$");
// cambiarValorPropiedad(procesosenjson, "relatesMetaData", modelo, "$");
//dividir los procesos segun su identificacion (pre-reflexivos o reflexivos)
let arregloProcesosDiv = dividirProcesos(procesosenjson);
const prereflexivos = arregloProcesosDiv["pre-reflexive"];
const reflexivos = arregloProcesosDiv["reflexive"];
const entidad = arregloProcesosDiv["entity"];


module.exports = {
  prereflexivos,
  reflexivos,
  entidad,
  buscarValorConRuta,
  obtenerParesClaveValor,
  transformaraRuta,
  cambiarValorPropiedad,
  modelo,
};


ejecutarTareasAutoconsciencia(nodoComputacion);

function ejecutarTareasAutoconsciencia(nodoComputacion){

  console.log('\x1b[34m%s\x1b[0m',"Comparando la nueva versión del modelo de autoconsciencia con la versión actual en ejecución...");
  console.log('\x1b[34m%s\x1b[0m',"Planificando tareas de implentacion o reconfiguracion de artefactos de autoconsciencia...");
  console.log("Identificando los nodos de computacion (Edge, Fog y Cloud) especificados en el modelo y sus configuraciones de red...");
  console.log("Distribuyendo la nueva version de los modelos y los planes de implementacion de los recursos de autoconsciencia...");

  //llamar al implementadorBD

  console.log("Implementando/reconfigurando los recursos de operacionalizacion...");
  //llamar al implementadorfunciones
  //llamar a los servicios web
  //llamar a los procesos reflexivos y pre-reflexivos

  ImplementadorDemoniosPreReflexivos(nodoComputacion);
  ImplementadorDemoniosReflexivos();  
  
}


async function ImplementadorDemoniosPreReflexivos(nodoComputacion) {
  const execute = require("../Autoconsciencia/ImplementadorDemoniosPreReflexivos");
  await execute.ejecutarDemoniosControlados(nodoComputacion);
}

async function ImplementadorDemoniosReflexivos() {
  const execute = require("../Autoconsciencia/ImplementadorDemoniosReflexivos");
  await execute.ejecutarDemoniosControlados();
}

//funcion para cambiar un path por el valor de la propiedad, pasando como parametro que propiedad extraer
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
        //fin cambios
        objeto[key] = nuevoValor;
      }
      //   }
    }
  }
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

/*
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

*/

//subfuncion para cambiar el path de una propiedad por el valor y transformar el path a una ruta accesible
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

//Funcion para clasificar los procesos en reflexivos y pre-reflexivos
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
      // console.log("sujeto: ", sujeto);
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
    // // modeloBaseConnection: [nodo[1]],
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

module.exports = {
  ejecutarTareasAutoconsciencia
};