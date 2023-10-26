const EjecutorTareasAutoconsciencia = require("../Autoconsciencia/EjecutorTareasAutoconsciencia");
const ImplmentadorFunciones = require("../Autoconsciencia/ImplementadorFunciones");
let procesos = EjecutorTareasAutoconsciencia.pro_prereflexivos;
let entidad = EjecutorTareasAutoconsciencia.entidad;

let preReflexivosMap = [];
// console.log("Ejecutor importadondo procesos", EjecutorTareasAutoconsciencia.pro_prereflexivos );

mapearUnNivel();
preReflexivosMap.forEach(element => 
    {
        if(typeof element['unidadTiempo'] !== 'undefined' && typeof element['intervalo'] !== 'undefined')
        {
            setExecutionTime(element);
        }
    });

//funcion para obtener el intervalo de ejecucion
function getIntervale(intervale) {
    console.log("Estructurando tiempos de ejecución.");
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

function setExecutionTime(element)
{
    if(element.hasOwnProperty('unidadTiempo'))
    {
        setInterval(function()
        {
            
            console.log("Ejecutado proceso PreReflexivo con nombre: ", element["nombre"], "cada ", element["intervalo"], " ", element["unidadTiempo"]);
            console.log("Ejecutando ademas su funcion: ");
            console.log("Funcion: ", element["funcion"]);
            // let indicador = ImplmentadorFunciones.evalProcess((element['funcion'].toLowerCase()).replace(re, 20), element['umbrales'], element, 20);
            // console.log("Resultado cargado a indicador: ", indicador);

        }, element['intervalo'] * getIntervale(element["unidadTiempo"]));
    }
    // else
    // {
    //     setInterval(function()
    //     {
    //         console.log("Ejecute else");
    //     }, element['intervalo'] * getIntervale(element["unidadTiempo"]));
    // }
}

//funcion para mapear las propiedades utiles y a un solo nivel de los procesos
function mapearUnNivel() {
    procesos.forEach((element) => {
      let collector = [];
      if (Object.keys(element).length > 1) {
        // console.log("nombre: ", element["name"]);
        // console.log(
        //   "propiedad: ",
        //   element["usesCollectionMethod"][0]["collectsProperty"]["name"]
        // );
        // console.log(
        //   "funcion: ",
        //   element["usesAnalysisModel"][0]["isImplementedBy"]["instructions"]
        // );
        // console.log("umbrales: ", mapearUmbrales(element["usesAnalysisModel"][0]["uses"]));
        // console.log(
        //   "idRelacionAnalysis: ",
        //   element["usesAnalysisModel"][0][
        //     "containsArgumentToParameterMapping"
        //   ][0]["relatesMetric"]["id"]
        // );
        // console.log("argumento: ", element["usesAnalysisModel"][0]["containsArgumentToParameterMapping"][0]["relatesParameter"]["name"]);
        // console.log("pid: ", element["id"]);
        // console.log("pidName: ", element["description"]);
        // console.log("sid: ",  entidad.split(",")[0]);
        // console.log("sidName: ", entidad.split(",")[1]);
  
        // console.log("aid: ", element["captures"]["id"]);
        // console.log("aidName: ", element["captures"]["name"]);
        // console.log("mdid: ", element["usesCollectionMethod"][0]["produces"]["id"]);
        // console.log("mdidName: ", element["usesCollectionMethod"][0]["produces"]["name"]);
        // console.log("inid: ",element["usesAnalysisModel"][0]["produces"]["id"] );
        // console.log("inidName: ", element["usesAnalysisModel"][0]["produces"]["name"]);
        // console.log("tipo proceso: ", element["xsi:type"]);
        // console.log("---------------------------")
        collector = {
          nombre: element["name"],
          intervalo: element["executionTimeInterval"],
          unidadTiempo: element["unitOfTime"],
          propiedad: element["usesCollectionMethod"][0]["collectsProperty"]["name"],
          //tabla: PREGUNTAR
          funcion: element["usesAnalysisModel"][0]["isImplementedBy"]["instructions"],
          umbrales: mapearUmbrales(element["usesAnalysisModel"][0]["uses"]),
          midRelacionAnalisis: element["usesAnalysisModel"][0]["containsArgumentToParameterMapping"][0]["relatesMetric"]["id"], //RELATES METRIC
          mNombreRelacionAnalisis: element["usesAnalysisModel"][0]["containsArgumentToParameterMapping"][0]["relatesMetric"]["name"],
          argumentoFuncion: element["usesAnalysisModel"][0]["containsArgumentToParameterMapping"][0]["relatesParameter"]["name"],
          pid: element["id"],
          pidName: element["description"],
          sid: entidad.split(",")[0],
          sidName: entidad.split(",")[1],
          // oid: element["object"]["$"]["id"], //PREGUNTAR BIEN COMO SACAR EL OBJETO (MODELO CO -> COCINA)
          // oidName: 
          aid : element["captures"]["id"],
          aidName: element["captures"]["name"],
          mdid: element["usesCollectionMethod"][0]["produces"]["id"],
          mdidName: element["usesCollectionMethod"][0]["produces"]["name"],
          inid: element["usesAnalysisModel"][0]["produces"]["id"],
          inidName: element["usesAnalysisModel"][0]["produces"]["name"],
          tipoProceso: element["xsi:type"]
        };
        preReflexivosMap.push(collector);
        //   collector = {
        //     nombre: element["name"],
        //     intervalo: element["$"]["executionTimeInterval"],
        //     unidadTiempo: element["$"]["unitOfTime"],
        //     propiedad:
        //       element["usesCollectionMethod"][0]["collectsProperty"].split(",")[0],
        //     tabla:
        //       element["usesCollectionMethod"][0]["collectsProperty"].split(",")[1],
        //     funcion: element["usesAnalysisModel"][0]["isImplementedBy"],
        //     umbrales: element["usesAnalysisModel"][0]["uses"],
        //     midRelacionAnalysis:
        //       element["usesAnalysisModel"][0][
        //         "containsArgumentToParameterMapping"
        //       ][0]["relatesMetric"].split(",")[0],
        //     mNameRelacionAnalysis:
        //       element["usesAnalysisModel"][0][
        //         "containsArgumentToParameterMapping"
        //       ][0]["relatesMetric"].split(",")[1],
        //     argumentoFuncion:
        //       element["usesAnalysisModel"][0][
        //         "containsArgumentToParameterMapping"
        //       ][0]["relatesParameter"],
        //     pid: element["$"]["id"],
        //     pidName: element["$"]["description"],
        //     sid: element["entity"].split(",")[0],
        //     sidName: element["entity"].split(",")[1],
        //     oid: element["object"]["$"]["id"],
        //     oidName: element["object"]["$"]["name"],
        //     aid: element["captures"].split(",")[0],
        //     aidName: element["captures"].split(",")[1],
        //     mdid: element["usesCollectionMethod"][0]["produces"].split(",")[0],
        //     mdidName: element["usesCollectionMethod"][0]["produces"].split(",")[1],
        //     inid: element["usesAnalysisModel"][0]["produces"].split(",")[0],
        //     inidName: element["usesAnalysisModel"][0]["produces"].split(",")[1],
        //     proceso: "pre-reflexivo",
        //   };
  
        //   getInfoPre.push(collector);
      }
    });
}

function mapearUmbrales(umbrales) {
  const umbralesArreglo = [];
  for (const key in umbrales) {
    const elemento = umbrales[key]["$"];
    for (const propiedad in umbrales[key]) {
      if (propiedad !== "$") {
        elemento[propiedad] = umbrales[key][propiedad];
      }
    }
    umbralesArreglo.push(elemento);
  }
  return umbralesArreglo;
}

