//const importarmodelo = require("../../../../App_Supervisora/src/LogicaNegocio/General/PlanificadorTareas"); //revisar error de dependencias 
//circulares, el codigo de un archvio se ejecuta cuando solo quiero importar el modelo 
//const modelo = importarmodelo.modeloJSON;
const funciones = require("../General/EjecutorTareas");
// const fs = require("fs");
// const modelo = JSON.parse(fs.readFileSync("../../../modelos/modelotesisf.json", "utf-8"));
// const modelo = require("../../../modelos/modelotesisfcopyCOLECTIVO.json");
const modelo = require("../../../modelos/modeloJSON.json"); 

const modeloNodo = require("../../../modelos/modeloObjeto.json"); 
const nodoComputacion = modeloNodo[0]["xsi:type"];
// const BDnodo = buscarValor(modeloNodo, "")

// const BDnodoComputacion = modeloNodo[0]["containsResource"][0]["name"];
// console.log("Nodo desde modelo objeto ", nodoComputacion);


//extraer los procesos de autoconsciencia
const procesosenjson = funciones.buscarValor(modelo, "ControlAmbiental", 8); //corregir que la busqueda no sea 'Control Ambiental'
//cambiar paths por objetos necesarios para procesos pre-reflexivos y reflexivos
funciones.cambiarValorPropiedad(procesosenjson, "collectsProperty", modelo, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
// cambiarValorPropiedad(procesosenjson, "columns_paths", modelo, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$" //PREGUNTAR
//ACTUALIZACION NO CAMBIAR AQUI SI NO MAPEAR LA CONEXION DE BD, TABLA Y COLUMNA PARA CADA PROCESO
funciones.cambiarValorPropiedad(procesosenjson, "produces", modelo, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
// cambiarValorPropiedad(procesosenjson, "captures", modelo, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
//AQUI REALIZO CAMBIO AL MAPEO DE CAPTURES YA QUE EL ASPECTO SE RELACIONA AL OBJETO ES DECIR TOC DOBLE BUSQUEDA
procesosenjson.forEach((element) => {
  if (element.hasOwnProperty("containsSelfAwarenessProcess")) {
    element["containsSelfAwarenessProcess"].forEach((item) => {
      rutaaspecto = item["captures"];
      // console.log("ruta aspecto proceso", item['name'], "; ",rutaaspecto);
      rutaaspectomapeada = "ArchitectureSelfAwarenessIoT."+ funciones.transformaraRuta(rutaaspecto);
      // console.log("ruta aspecto mapeada ", rutaaspectomapeada);
      //verificar si tiene objeto relacionado o no (caso de ser colectivo no tiene objeto relacionado)
      try{
        rutaobjeto = funciones.buscarValorConRuta(modelo, rutaaspectomapeada, "belongsTo");
        if(rutaobjeto){
          rutaobjetomapeada = "ArchitectureSelfAwarenessIoT."+ funciones.transformaraRuta(rutaobjeto);
          // console.log("ruta objeto mapeada ", rutaobjetomapeada);
          objetoAutconsciencia = funciones.buscarValorConRuta(modelo, rutaobjetomapeada, "$");
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
funciones.cambiarValorPropiedad(procesosenjson, "captures", modelo);  //no se envia "$" ya que se necesita todo el objeto con sus propiedades
//FIN CAMBIO MAPEO CAPTURES
//mapeo isDerivedFrom de los aspectos colectivos para tener sus aspectos hijos
funciones.cambiarValorPropiedad(procesosenjson,"isDerivedFrom",modelo);
funciones.cambiarValorPropiedad(procesosenjson,"isCaptured",modelo);
//fin mapeo isDerivedFrom
funciones.cambiarValorPropiedad(procesosenjson, "isImplementedBy", modelo, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
funciones.cambiarValorPropiedad(procesosenjson, "uses", modelo, "containsThreshold"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "containsThreshold"
funciones.cambiarValorPropiedad(procesosenjson, "recommends", modelo, "$");
//adicionales
funciones.cambiarValorPropiedad(procesosenjson, "relatesParameter", modelo, "$");
funciones.cambiarValorPropiedad(procesosenjson, "relatesMetric", modelo, "$");
//obtener el nodo de comptuacion
funciones.cambiarValorPropiedad(procesosenjson,"computingNode", modelo, "$");
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

module.exports = {
  ejecutarTareasAutoconsciencia
};