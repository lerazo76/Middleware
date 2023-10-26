const EjecutorTareasAutoconsciencia = require("../Autoconsciencia/EjecutorTareasAutoconsciencia");
const ImplmentadorFunciones = require("../Autoconsciencia/ImplementadorFunciones");
const GestorBD = require("../General/GestorManipulacionBD")
let procesos = EjecutorTareasAutoconsciencia.prereflexivos;
let entidad = EjecutorTareasAutoconsciencia.entidad;
let modelo = EjecutorTareasAutoconsciencia.modelo;
let preReflexivosMap = [];

// mapearUnNivel();
// console.log("");
async function ejecutarDemoniosControlados(nodoComputacion) {
  await mapearUnNivel();
  await ImplementarFuncionDemonio(preReflexivosMap);
  console.log('\x1b[34m%s\x1b[0m',"Implementando/reconfigurando los demonios de los procesos de autonsciencia...");
  await ImplementarDemonio(preReflexivosMap);
  for (const element of preReflexivosMap) {
    if (typeof element["unidadTiempo"] !== "undefined" && typeof element["intervalo"] !== "undefined" && element["computingNode"] === nodoComputacion ) { //&& element["computingNode"] === nodoComputacion
      await ejecutarDemonio(element);
      console.log("Computing node ", element["computingNode"]);
    }
  }
}

//funcion para "implementar (imprimir por consola)" las funciones utilizadas por demonios reflexivos
async function ImplementarFuncionDemonio(procprereflex){
  procprereflex.forEach(element =>{
    if(element.hasOwnProperty("funcionName")){
      console.log('\x1b[34m%s\x1b[0m',"Función PRE" + element["funcionName"]+ " implementada (OK)")
    }
  });
}

//funcion para "implementar (imprimir por consola) los procesos como demonios"
async function ImplementarDemonio(procprereflex){
  procprereflex.forEach(element =>{
    if(element.hasOwnProperty("nombre")){
      console.log('\x1b[34m%s\x1b[0m',"Función asíncrona " + element["nombre"]+ " implementada (OK)")
    }
  });
}

// Función para ejecutar un demonio preReflexivo
async function ejecutarDemonio(element) {
  if (element.hasOwnProperty("unidadTiempo")) {
    setInterval(async () => {
      try {
        //verificar si es el tipo de ejecucion es "funcion" o "servicio"
        if(element["tipoEjecucion"] === "funcion"){
        // Obtener el dato de la base de datos de monitoreo *preguntar bien lo de las conexiones a la bd ahorita esta quemado al sqlcloud pero
        // hay algunas que deben obtener del sqllocal
        // const metricaDirecta = await obtenerMetricaBDM("postgresqlcloud",element["tablabd"].toLowerCase(), element["columnabd"].toLowerCase());
        const metricaDirecta = await GestorBD.obtenerMetricaBDM(element["basedatos"],element["tablabd"].toLowerCase(), element["columnabd"].toLowerCase());
        // obtener el parametro a reemplazar en la funcion contenida en el modelo de analisis 
        const parametro = new RegExp(element['argumentoFuncion'].toLowerCase(), "g");
        //reemplazar en la funcion el parametro por el valor de la metricaDirecta
        const funcion = element['funcion'].toLowerCase().replace(parametro, metricaDirecta);
        // ejecutar la funcion contenida en el modelo de analisis para obtener el indicador
        const indicador = ImplmentadorFunciones.evalProcess(funcion,element["umbrales"],element,metricaDirecta);
        //guardar la metricaDirecta y el indicador en la tabla de autoconsciencia(metricas)
        // const guardarMetricaDirecta = await guardarenBDA("conexion",element["pid"],element["sid"],element["sidName"],element["oid"],
        // element["oidName"],element["aid"],element["aidName"],element["mid"], element["midName"],metricaDirecta, Date.now(),'directa','','','','','','',element["pidName"]);
        const guardarMetricaDirecta = await GestorBD.guardarenBDA(element["basedatos"],element["pid"],element["sid"],element["sidName"],element["oid"],
        element["oidName"],element["aid"],element["aidName"],element["mid"], element["midName"],metricaDirecta, Date.now(),'directa','','','','','','',element["pidName"]);
        
        // const guardarIndicador = await guardarenBDA("conexion",element["pid"],element["sid"],element["sidName"],element["oid"],element["oidName"],
        // element["aid"],element["aidName"],element["inid"], element["inidName"],indicador[0],Date.now(),'indicador',indicador[1],indicador[2],indicador[3],'','','',element["pidName"]);
        const guardarIndicador = await GestorBD.guardarenBDA(element["basedatos"],element["pid"],element["sid"],element["sidName"],element["oid"],element["oidName"],
        element["aid"],element["aidName"],element["inid"], element["inidName"],indicador[0],Date.now(),'indicador',indicador[1],indicador[2],indicador[3],'','','',element["pidName"]);
        if(metricaDirecta && guardarMetricaDirecta && guardarIndicador){
          // console.log("Ejecutado proceso PreReflexivo con nombre:",element["nombre"], "cada", element["intervalo"], element["unidadTiempo"]);
          let fecha = Date.now();
          let fechaformato = formatearFechaYHora(fecha);

          console.log('\x1b[34m%s\x1b[0m',element["nombre"] + " \tTipo: Pre-reflexivo - Estado " +"\tFecha: " + fechaformato);
          console.log("Descripción "+ element["pidName"]);
          console.log('\x1b[32m%s\x1b[0m',"Metrica directa " + element["midName"] + " \tValor: " + metricaDirecta);
          console.log('\x1b[32m%s\x1b[0m',"Indicador: " + element["inidName"] + " \tValor: " + indicador[0]);
          console.log('\x1b[36m%s\x1b[0m',"Umbral: " + indicador[1]);
          console.log('\x1b[36m%s\x1b[0m',"Interpretación: " + indicador[2]);
          console.log('\x1b[93m%s\x1b[0m',"Recomendación: "+ indicador[3]);
          // console.log("Fin demonio pre-reflexivo...");
          console.log("------------");
        }
        }else{ //codigo para consumir un servicio web, en este caso no tenemos procesos pre-reflexivos que utilicen servicio web, igual agregar codigo

        }
      } catch (error) {
        console.error("Error:", error);
      }
    },element["intervalo"] * getIntervale(element["unidadTiempo"]));
  }
}

//funcion para mapear a un nivel los procesos entrantes, para extraer las propiedades que se utilizaran y un mejor manejo de las mismas
async function mapearUnNivel() {
  procesos.forEach((element) => {
    let collector = [];
    if (Object.keys(element).length > 1) {
      //obtener la BD, Tabla y Columna relacionada
      let ruta = element["usesCollectionMethod"][0]["columns_paths"];
      let BDrelacionada = GestorBD.mapearconexionBD(ruta, modelo);
      let conexbd = BDrelacionada[0]["name"];
      // conexbd = conexbd.toString();
      conexbd = conexbd.trim();
      console.log("Conexbd pre ", typeof conexbd);
      let conextabla = BDrelacionada[1]["name"];
      let conexcolum = BDrelacionada[2]["name"];
      collector = {
        nombre: element["name"],
        intervalo: element["executionTimeInterval"],
        unidadTiempo: element["unitOfTime"],
        propiedad: element["usesCollectionMethod"][0]["collectsProperty"]["name"],
        computingNode: element["computingNode"]["xsi:type"], //nodo de computacion al que pertenece el proceso
        //MAPEO DE LA CONEXION A LA BD Y SU RESPECTIVA TABLA Y COLUMNA
        basedatos: conexbd.toLowerCase(),
        tablabd: conextabla,
        columnabd: conexcolum,
        //FIN MAPEO DE LA CONEXION A LA BD DE CADA PROCESO
        nombrefuncion: element["usesAnalysisModel"][0]["isImplementedBy"]["name"],
        funcion: element["usesAnalysisModel"][0]["isImplementedBy"]["instructions"],
        funcionName: element["usesAnalysisModel"][0]["isImplementedBy"]["name"],
        umbrales: mapearUmbrales(element["usesAnalysisModel"][0]["uses"]),
        midRelacionAnalisis: element["usesAnalysisModel"][0]["containsArgumentToParameterMapping"][0]["relatesMetric"]["id"], //RELATES METRIC
        mNombreRelacionAnalisis: element["usesAnalysisModel"][0]["containsArgumentToParameterMapping"][0]["relatesMetric"]["name"],
        argumentoFuncion: element["usesAnalysisModel"][0]["containsArgumentToParameterMapping"][0]["relatesParameter"]["name"],
        pid: element["id"],
        pidName: element["description"],
        // pidTrueName: element["name"],
        sid: entidad.split(",")[0],
        sidName: entidad.split(",")[1],
        oid: element["objetoautoconsciencia"]["id"],
        oidName: element["objetoautoconsciencia"]["name"],
        // aid: element["captures"]["id"],
        aid: element["captures"]["$"]["id"], //cambio ya que paso todo el objeto y no solo el "$"
        // aidName: element["captures"]["name"],
        aidName: element["captures"]["$"]["name"],//cambio ya que paso todo el objeto y no solo el "$"
        mid: element["usesCollectionMethod"][0]["produces"]["id"],
        midName: element["usesCollectionMethod"][0]["produces"]["name"],
        inid: element["usesAnalysisModel"][0]["produces"]["id"],
        inidName: element["usesAnalysisModel"][0]["produces"]["name"],
        tipoProceso: element["xsi:type"],
        tipoEjecucion: element["usesAnalysisModel"][0]["implementationResourceType"].toLowerCase(),
      };
      preReflexivosMap.push(collector);
    }
  });
}

//version 2 de mapear umbrales para dejar el recommends al mismo nivel
function mapearUmbrales(umbrales) {
  const umbralesArreglo = [];
  for (const key in umbrales) {
    const elemento = umbrales[key]["$"];
    
    // Verificar si "recommends" está presente y mapearlo si es así
    if (umbrales[key]["recommends"]) {
      elemento["recommends"] = umbrales[key]["recommends"]["description"];
    }

    for (const propiedad in umbrales[key]) {
      if (propiedad !== "$" && propiedad !== "recommends") {
        elemento[propiedad] = umbrales[key][propiedad];
      }
    }
    umbralesArreglo.push(elemento);
  }
  return umbralesArreglo;
}

//funcion para obtener el intervalo de ejecucion
function getIntervale(intervale) {
  //console.log("Estructurando tiempos de ejecución.");
  let res;
  let seg = ["second", "seconds", "segundo", "segundos"];
  let min = ["minute", "minutes", "minuto", "minutos"];
  let hrs = ["hour", "hours", "hora", "horas"];
  let dys = ["day", "days", "dia", "dias"];

  if (seg.includes(intervale.toLowerCase())) {
    res = 1000;
  } else if (min.includes(intervale.toLowerCase())) {
    res = 60000;
  } else if (hrs.includes(intervale.toLowerCase())) {
    res = 3600000;
  } else if (dys.includes(intervale.toLowerCase())) {
    res = 3600000 * 24;
  } else {
    console.log("Especifique el tiempo manualmente en el codigo.");
  }
  return res;
}

//funcion para obtener la fecha y formatearla 
function formatearFechaYHora(timestamp) {
  const fecha = new Date(timestamp);
  const opciones = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3, // 3 dígitos para los milisegundos
  };
  const fechaFormateada = new Intl.DateTimeFormat('es-ES', opciones).format(fecha);
  return fechaFormateada;
}

module.exports = {
  ejecutarDemoniosControlados
};