const { Client } = require("pg");
const ImplementadorLSP = require("../Autoconsciencia/ModeloLSP");
// const EjecutorTareasAutoconsciencia = require("../Autoconsciencia/EjecutorTareasAutoconsciencia");
const EstructuradorProcesos = require("../Autoconsciencia/EstructuradorProcesos");
const GestorBD = require("../General/GestorManipulacionBD");
const ImplmentadorFunciones = require("../Autoconsciencia/ImplementadorFunciones");
// let procesos = EjecutorTareasAutoconsciencia.reflexivos;
let procesos = EstructuradorProcesos.reflexivos;

// let entidad = EjecutorTareasAutoconsciencia.entidad;
let entidad = EstructuradorProcesos.entidad;

// const modelo = EjecutorTareasAutoconsciencia.modelo;
let modelo = EstructuradorProcesos.modelo;
const start = require('../../../StartApp');
const tipoApp = start.app;


let reflexivosMap = [];
const request = require("request");


async function ejecutarDemoniosControlados(nodoComputacion) {
  await mapearUnNivel();
  await ImplementarFuncionDemonio(reflexivosMap, nodoComputacion);
  await ImplementarDemonio(reflexivosMap, nodoComputacion);
  for (const element of reflexivosMap) {
    if (typeof element["unidadTiempo"] !== "undefined" && typeof element["intervalo"] !== "undefined" && element["computingNode"] === nodoComputacion) {
      await ejecutarDemonio(element);
    }
  }
}

//funcion para "implementar (imprimir por consola)" las funciones utilizadas por demonios reflexivos
async function ImplementarFuncionDemonio(procreflex, nodoComputacion) {
  procreflex.forEach(element => {
    if (element.hasOwnProperty("funcionName") && element["computingNode"] === nodoComputacion) {
      if (tipoApp==2 || tipoApp==0){
      console.log('\x1b[34m%s\x1b[0m', "Función " + element["funcionName"] + " implementada (OK)");
      }
    }
    else if (element.hasOwnProperty("funcionServicioName") && element["computingNode"] === nodoComputacion) {
      if (tipoApp==2 || tipoApp==0){
      console.log('\x1b[34m%s\x1b[0m', "Servicio web " + element["funcionServicioName"] + " implementado (OK)")
      }
    }
  });
}

//funcion para "implementar (imprimir por consola) los procesos como demonios"
async function ImplementarDemonio(procprereflex, nodoComputacion) {
  procprereflex.forEach(element => {
    if (element.hasOwnProperty("nombre") && element["computingNode"] === nodoComputacion) {
      if (tipoApp==2 || tipoApp==0){
      console.log('\x1b[34m%s\x1b[0m', "Función asíncrona " + element["nombre"] + " implementada (OK)")
      }
    }
  });
}

// Función para ejecutar un demonio Reflexivo
async function ejecutarDemonio(element) {
  if (element.hasOwnProperty("unidadTiempo")) {
    if (element["propiedad"] !== undefined && element["tabla"] !== undefined) {
      setInterval(async () => {
        try {
          //calcular desde que fecha hasta que fecha tomar los datos
          let fechas = calcularFechas(element);
          let fechaDesde = fechas.fechaDesde;
          let fechaHasta = fechas.fechaHasta;
          // console.log("fecha desde ", fechaDesde, " fecha hasta ", fechaHasta);
          //verificar si es un proceso (aspecto) colectivo o individual
          if (element['aidType'] === "individual") {
            //verificar si es un servicio o una funcion
            if (element["tipoMcalculo"] === "servicio") {
              //obtener datos historicos BDM
              if (tipoApp==2 || tipoApp==0){
              console.log("historicos de bdm obtengo ", element["propiedad"]);
              }
              const datosHistoBDM = await GestorBD.obtenerDatosHistoricosBDM(element["bd"], element["propiedad"], element["tabla"], [fechaDesde, fechaHasta]);
              //obtener datos historicos pero de la BDA
              if (tipoApp==2 || tipoApp==0){
              console.log("historicos bda ", element["midRelacionCalculation"]);
              }
              const datosHistoBDA = await GestorBD.obtenerMetricaHistoricaBDA(element["bd"], element['midRelacionCalculation'], [fechaDesde, fechaHasta]);
              if (datosHistoBDM && datosHistoBDA) {
                //comparar y en caso de ser necesario igualar el tamanio de los arreglos de datos historicos
                const body = {};
                let metaData = [];
                let dataSelfAwaraness = [];
                datosHistoBDM.forEach(element => {
                  metaData.push(element[0]);
                });
                datosHistoBDA.forEach(element => {
                  dataSelfAwaraness.push(element[0]);
                });
                //igualar el tamanio de los array en caso de ser necesario
                const arrayigualados = igualarLongitudDeArreglos(metaData, dataSelfAwaraness);
                metaData = arrayigualados[0]; //reasignar 
                dataSelfAwaraness = arrayigualados[1]; //reasignar
                if (metaData.length === dataSelfAwaraness.length && metaData.length !== 0 && dataSelfAwaraness !== 0) {
                  //crear el request al servicio web
                  const headers = {
                    'content-type': 'application/json'
                  };
                  body[element['variableIndependiente']] = "[" + metaData.join() + "]";
                  body[element['variableDependiente']] = "[" + dataSelfAwaraness.join() + "]";
                  body[element['variableSimulacion']] = element['valorVariableSimulacion'];
                  request(
                    {
                      url: "http://localhost:" + element["puertoServicio"] + "/" + element["endPoint"],
                      // url: "http://localhost:" + 9995 + "/" + element["endPoint"],
                      headers: headers,
                      body: JSON.stringify(body),
                      method: 'POST'
                    },
                    async (error, response, body) => {
                      if (!error && response.statusCode === 200) {
                        if (tipoApp==2 || tipoApp==0){
                        console.log("Servicio consumido...");
                        }
                        let indirecta = JSON.parse(body);
                        //obtener el parametro a reemplazar en la funcion del modelo de analisis
                        const parametro = new RegExp(element['argumentoFuncion'].toLowerCase(), "g");
                        //reemplazar en la funcion del modelo de analisis el parametro por el valor de la metrica indirecta
                        const funcionMA = element['funcion'].toLowerCase().replace(parametro, indirecta['evalResult']);
                        //obtener el indicador ejecutando la funcion con el implementador de funciones
                        const indicador = ImplmentadorFunciones.evalProcess(funcionMA, element['umbrales'], element, indirecta['evalResult']);
                        //guardar en la BD de autoconsciencia la metrica indirecta y el indicador
                        const guardarMetricaIndirecta = await GestorBD.guardarenBDA(element["bd"], element["pid"], element["sid"], element["sidName"], element["oid"], element["oidName"], element["aid"], element["aidName"], element["mind"], element["mindName"], indirecta['evalResult'], Date.now(), 'indirecta', '', '', '', element['nombreEscenarioSimulacion'], element['descripcionEscenarioSimulacion'], element['valorVariableSimulacion'], element["pidName"]);
                        const guardarIndicador = await GestorBD.guardarenBDA(element["bd"], element["pid"], element["sid"], element["sidName"], element["oid"], element["oidName"], element["aid"], element["aidName"], element["inid"], element["inidName"], indicador[0], Date.now(), 'indicador', indicador[1], indicador[2], indicador[3], '', '', '', element["pidName"]);
                        if (guardarMetricaIndirecta && guardarIndicador) {
                          // console.log("Ejecutado proceso Reflexivo con nombre:",element["nombre"], "cada", element["intervalo"], element["unidadTiempo"]);
                          // console.log("metrica indirecta servicio web", indirecta['evalResult']);
                          // console.log("indicador ", indicador[0]);
                          // console.log("Fin demonio reflexivo...");
                          // console.log("------------");

                          let fecha = Date.now();
                          let fechaformato = formatearFechaYHora(fecha);
                          if (tipoApp==2 || tipoApp==0){
                          console.log('\x1b[34m%s\x1b[0m', element["nombre"] + " \tTipo: Reflexivo - " + element["aidTypeconsole"] + " \tFecha: " + fechaformato);
                          console.log("Descripción: " + element["pidName"]);
                          console.log('\x1b[32m%s\x1b[0m', "Metrica indirecta: " + element["mindName"] + " \tValor: " + indirecta['evalResult']);
                          console.log('\x1b[32m%s\x1b[0m', "Indicador: " + element["inidName"] + " \tValor: " + indicador[0]);
                          console.log('\x1b[36m%s\x1b[0m', "Umbral: " + indicador[1]);
                          console.log('\x1b[36m%s\x1b[0m', "Interpretación: " + indicador[2]);
                          console.log('\x1b[93m%s\x1b[0m', "Recomendación: " + indicador[3]);
                          console.log("------------");
                          }
                        } else {
                          console.log("Error en el demonio ", element['pidName'], "...")
                        }
                      }
                    }
                  );
                }
              }
            } else { //cuando es funcion
              //recuperar los datos de la BDA pero de manera historica
              const metricaHistorica = await GestorBD.obtenerMetricaHistoricaBDA(element["bd"], element["midRelacionCalculation"], [fechaDesde, fechaHasta]);
              // obtener el parametro a reemplazar en la funcion contenida en el modelo de analisis 
              const parametroMcalculo = new RegExp(element["argumentoFuncionCalcultaionMethod"].toLowerCase(), "g");
              // console.log("param mcal ", parametroMcalculo);
              //reemplazar en la funcion del metodo de calculo el parametro por el valor de la metricaHistorica
              const funcionMcalculo = element['funcionCalculationMethod'].toLowerCase().replace(parametroMcalculo, metricaHistorica);
              // console.log("funcion mcal ", funcionMcalculo);
              //con la metricaHistoricaRecuperada realizar la funcion o calculo correspondiente del metodo de Calculo
              const metricaIndirecta = ImplmentadorFunciones.evalProcess(funcionMcalculo, element["umbralesCalculationMethod"], element, metricaHistorica);
              //console.log("Metrica indirecta obtenida ", metricaIndirecta);
              //una vez se tiene la metrica indirecta, se realiza la funcion o calculo del modelo de analisis para obtener el indicador
              const parametroManalisis = new RegExp(element["argumentoFuncion"].toLowerCase(), "g");
              //console.log("param mana ", parametroManalisis);
              //reemplazar en la funcion del modelo de analisis el parametro por el valor de la metricaIndirecta
              const funcionManalisis = element['funcion'].toLowerCase().replace(parametroManalisis, metricaIndirecta[0]);
              //console.log("funcion mcal ", funcionManalisis);
              // ejecutar la funcion contenida en el modelo de analisis para obtener el indicador
              const indicador = ImplmentadorFunciones.evalProcess(funcionManalisis, element["umbrales"], element, metricaIndirecta);
              //guardar la metricaIndirecta y el indicador en la BDA
              const guardarMetricaIndirecta = await GestorBD.guardarenBDA(element["bd"], element["pid"], element["sid"], element["sidName"], element["oid"], element["oidName"], element["aid"], element["aidName"], element["mind"], element["mindName"], metricaIndirecta[0], Date.now(), 'indirecta', metricaIndirecta[1], metricaIndirecta[2], metricaIndirecta[3], '', '', '', element["pidName"]);
              const guardarIndicador = await GestorBD.guardarenBDA(element["bd"], element["pid"], element["sid"], element["sidName"], element["oid"], element["oidName"], element["aid"], element["aidName"], element["inid"], element["inidName"], indicador[0], Date.now(), 'indicador', indicador[1], indicador[2], indicador[3], '', '', '', element["pidName"]);
              if (metricaHistorica && guardarMetricaIndirecta && guardarIndicador) {
                // console.log("Ejecutado proceso Reflexivo con nombre:",element["nombre"], "cada", element["intervalo"], element["unidadTiempo"]);
                // console.log("metrica indirecta ", metricaIndirecta[0]);
                // console.log("indicador ", indicador[0]);
                // console.log("Fin demonio reflexivo...")
                // console.log("------------");
                let fecha = Date.now();
                let fechaformato = formatearFechaYHora(fecha);
                if (tipoApp==2 || tipoApp==0){
                console.log('\x1b[34m%s\x1b[0m', element["nombre"] + " \tTipo: Reflexivo - " + element["aidTypeconsole"] + " \tFecha: " + fechaformato);
                console.log("Descripción: " + element["pidName"]);
                console.log('\x1b[32m%s\x1b[0m', "Metrica indirecta: " + element["mindName"] + " \tValor: " + metricaIndirecta[0]);
                console.log('\x1b[32m%s\x1b[0m', "Indicador: " + element["inidName"] + " \tValor: " + indicador[0]);
                console.log('\x1b[36m%s\x1b[0m', "Umbral: " + indicador[1]);
                console.log('\x1b[36m%s\x1b[0m', "Interpretación: " + indicador[2]);
                console.log('\x1b[93m%s\x1b[0m', "Recomendación: " + indicador[3]);
                // console.log("Fin demonio pre-reflexivo...");
                console.log("------------");
                }
              }
            }
          } else { //es un proceso (aspecto) colectivo y se aplica el modelo LSP
            let arraypesos = []; //arreglo de pesos que se usara luego como parametro para el modelo LSP
            let arraymetricas = []; //arreglo de metricas que se usara luego como parametro para el modelo LSP // CAMBIAR NOMBRE PASO INDICADORES NO METRICAS
            const operadoragregacion = element["operadorAgregacion"]; //operador de agregacion que se usara luego como parametro para el modelo LSP
            if (element["PesosTablas"] && element["operadorAgregacion"]) {
              //funcion para obtener los pesos y las metricas de la BD
              pesosTablas = element["PesosTablas"];
              async function obtenerPesoMetrica(item) {
                const peso = item.peso;
                const id = item.idhijo;
                // console.log("Id pasa: " + id); //REVISAR SI PASA BIEN EL ID, ENTONCES ES PROBLEMA DE LA CONSULTA
                const bd = item.bd;
                // const tabla = item.tabla;
                // const column = item.column;
                // const indicador = await GestorBD.obtenerMetricaBDM(bd,tabla,column); //obtener la ultima metrica guardada de los procesos hijos
                const indicador = await GestorBD.obtenerIndicadorBDA(bd, id); //obtener el ultimo indicador guardado de los procesos hijos
                arraypesos.push(peso);
                arraymetricas.push(indicador);
              }
              (async () => {
                for (const item of pesosTablas) {
                  await obtenerPesoMetrica(item);
                }
                // arraymetricas[0] = 100;
                // arraymetricas[1] = 92.265
                const resultadolsp = ImplementadorLSP.modeloLSP(operadoragregacion, arraypesos, arraymetricas, element["umbrales"]);
                //me falta lo de guardar en la BD el indicador o la metrica que se obtiene
                const guardarIndicador = await GestorBD.guardarenBDA(element["bd"], element["pid"], element["sid"], element["sidName"], null, '',
                  element["aid"], element["aidName"], element["inid"], element["inidName"], resultadolsp[0], Date.now(), 'indicador', resultadolsp[1], resultadolsp[2], resultadolsp[3], '', '', '', element["pidName"]);
                if (guardarIndicador) {
                  let fecha = Date.now();
                  let fechaformato = formatearFechaYHora(fecha);
                  if (tipoApp==2 || tipoApp==0){
                  console.log('\x1b[34m%s\x1b[0m', element["nombre"] + " \tTipo: Reflexivo Colectivo - " + element["aidTypeconsole"] + " \tFecha: " + fechaformato);
                  console.log("Descripción " + element["pidName"]);
                  // console.log("Ejecutado proceso Reflexivo con nombre:",element["nombre"], "cada", element["intervalo"], element["unidadTiempo"]);
                  console.log("----------Procesos individuales utilizados----------");
                  console.log("PID1: Valor indicador: ", arraymetricas[0], " - ", "Valor peso: ", arraypesos[0]);
                  console.log("PID2: Valor indicador: ", arraymetricas[1], " - ", "Valor peso: ", arraypesos[1]);
                  console.log("----------------------------------------------------");
                  console.log('\x1b[32m%s\x1b[0m', "Indicador: " + element["inidName"] + " \tValor: " + resultadolsp[0]);
                  console.log('\x1b[36m%s\x1b[0m', "Umbral: " + resultadolsp[1]);
                  console.log('\x1b[36m%s\x1b[0m', "Interpretación: " + resultadolsp[2]);
                  console.log('\x1b[93m%s\x1b[0m', "Recomendación: " + resultadolsp[3]);
                  // console.log("Resultado modelo LSP ", resultadolsp);
                  // console.log("Fin demonio reflexivo colectivo...");
                  console.log("------------");
                  }
                }

              })();
            }
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }, element["intervalo"] * getIntervale(element["unidadTiempo"]));
    }
  }
}

//funcion para mapear las propiedades utiles y a un solo nivel de los procesos
async function mapearUnNivel() {
  procesos.forEach((element) => {
    let collector = [];
    if (Object.keys(element).length > 1 && element["captures"]["$"]["xsi:type"] === "individual") {
      //obtener la BD, Tabla y Columna relacionada
      collector = {
        bd: "postgresqllocal", //la base de datos si puede cambiar ya que puede estar en otro nodo (postresqlcloud o postresqllocal)
        tabla: "metricas", //para los tipo funcion siempre va a tomar de la tabla metricas
        fechaDesde: element["executionPeriodStart"],
        fechaHasta: element["executionPeriodEnd"],
        nombre: element["name"],
        intervalo: element["executionTimeInterval"],
        unidadTiempo: element["unitOfTime"],
        propiedad: element["usesCalculationMethod"][0]["containsArgumentToParameterMapping"][0]["relatesParameter"]["name"],
        computingNode: element["computingNode"]["xsi:type"], //nodo de computacion al que pertenece el proceso
        umbrales: mapearUmbrales(element["usesAnalysisModel"][0]["uses"]),
        umbralesCalculationMethod: element["usesCalculationMethod"][0]["uses"], //da undefined en todos preguntar !!!!!
        funcion: element["usesAnalysisModel"][0]["isImplementedBy"]["instructions"],
        funcionName: element["usesAnalysisModel"][0]["isImplementedBy"]["name"],
        funcionCalculationMethod: element["usesCalculationMethod"][0]["isImplementedBy"]["instructions"],
        midRelacionAnalysis: element["usesAnalysisModel"][0]["containsArgumentToParameterMapping"][0]["relatesMetric"]["id"],
        mNameRelacionAnalysis: element["usesAnalysisModel"][0]["containsArgumentToParameterMapping"][0]["relatesMetric"]["name"],
        midRelacionCalculation: element["usesCalculationMethod"][0]["containsArgumentToParameterMapping"][0]["relatesMetric"]["id"],
        mNameRelacionCalculation: element["usesCalculationMethod"][0]["containsArgumentToParameterMapping"][0]["relatesMetric"]["name"],
        argumentoFuncion: element["usesAnalysisModel"][0]["containsArgumentToParameterMapping"][0]["relatesParameter"]["name"],
        argumentoFuncionCalcultaionMethod: element["usesCalculationMethod"][0]["containsArgumentToParameterMapping"][0]["relatesParameter"]["name"],
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
        aidName: element["captures"]["$"]["name"], //cambio ya que paso todo el objeto y no solo el "$"
        aidType: element["captures"]["$"]["xsi:type"], // obtener el tipo de aspecto, individual o colectivo
        aidTypeconsole: element["captures"]["$"]["type"], //si es ESTADO O PREDCCION en el caso del modelo utilizado
        mind: element["usesCalculationMethod"][0]["produces"]["id"], //metrica indirecta id 
        mindName: element["usesCalculationMethod"][0]["produces"]["name"],
        inid: element["usesAnalysisModel"][0]["produces"]["id"], //indicador 
        inidName: element["usesAnalysisModel"][0]["produces"]["name"],
        tipoProceso: element["xsi:type"],
        periodoCalculoInicio: element["usesCalculationMethod"][0]["calculationPeriodStart"],
        periodoCalculoFin: element["usesCalculationMethod"][0]["calculationPeriodEnd"],
        intervaloCalculo: element["usesCalculationMethod"][0]["dataRange"],
        unidadTiempoIntervalo: element["usesCalculationMethod"][0]["unitDataPeriod"],
        tipoMcalculo: element["usesCalculationMethod"][0]["implementationResourceType"].toLowerCase(),
      };
      //en el caso que sea un servicio se deben pasar otros parametros
      if (element["usesCalculationMethod"][0]["implementationResourceType"].toLowerCase() === "servicio") {
        let ruta = element["usesCalculationMethod"][0]["containsArgumentToParameterMapping"][1]["relatesMetaData"];
        let BDrelacionada = GestorBD.mapearconexionBD(ruta, modelo);
        let conexbd = BDrelacionada[0]["name"];
        conexbd = conexbd.trim();
        let conextabla = BDrelacionada[1]["name"];
        let conexcolum = BDrelacionada[2]["name"];
        //mapeando la BD usando la ruta de Relates Metadata del Metodo de Calculo
        collector['bd'] = conexbd.toLowerCase();
        collector['tabla'] = conextabla;
        collector['columna'] = conexcolum;
        //collector['propiedad'] = element["usesCalculationMethod"][0]["containsArgumentToParameterMapping"][1]["relatesMetaData"]["name"].toLowerCase();
        collector['propiedad'] = conexcolum.toLowerCase(); // si hacemos la funcion cambiarValor, igual nos da este resultado, paso a minusculas por la estructura de BDM
        collector['tipoSimulacion'] = element['usesCalculationMethod'][0]['containsSimulationVariable'][0]['name'];
        collector["nombreEscenarioSimulacion"] = element["usesCalculationMethod"][0]["containsSimulationScenario"][0]["name"];
        collector["descripcionEscenarioSimulacion"] = element["usesCalculationMethod"][0]["containsSimulationScenario"][0]["description"];
        collector["variableDependiente"] = element["usesCalculationMethod"][0]["containsArgumentToParameterMapping"][0]["relatesParameter"]["name"];
        collector["variableIndependiente"] = element["usesCalculationMethod"][0]["containsArgumentToParameterMapping"][1]["relatesParameter"]["name"];
        collector["variableSimulacion"] = element["usesCalculationMethod"][0]["containsArgumentToParameterMapping"][2]["relatesParameter"]["name"];
        collector["valorVariableSimulacion"] = element["usesCalculationMethod"][0]["containsSimulationVariable"][0]["containsSimulationValue"][0]["value"];
        collector["endPoint"] = element["usesCalculationMethod"][0]["isImplementedBy"]["endPoint"];
        collector["funcionServicio"] = element["usesCalculationMethod"][0]["isImplementedBy"]["instructions"];
        collector["funcionServicioName"] = element["usesCalculationMethod"][0]["isImplementedBy"]["name"];
        delete collector["funcionName"];
        collector["puertoServicio"] = element["computingNode"]["selfAwareMiddlewarePort"];
      }
    } else { // caso en el que el proceso (aspecto) sea colectivo (se puede mejorar para no repetir codigo) 
      collector = {
        bd: "postgresqllocal", //la base de datos si puede cambiar ya que puede estar en otro nodo (postresqlcloud o postresqllocal)
        tabla: "metricas", //para los tipo funcion siempre va a tomar de la tabla metricas
        propiedad: '',
        computingNode: element["computingNode"]["xsi:type"], //nodo de computacion al que pertenece el proceso
        fechaDesde: element["executionPeriodStart"],
        fechaHasta: element["executionPeriodEnd"],
        nombre: element["name"],
        intervalo: element["executionTimeInterval"],
        unidadTiempo: element["unitOfTime"],
        umbrales: mapearUmbrales(element["usesAnalysisModel"][0]["uses"]),
        pid: element["id"],
        pidName: element["description"],
        // pidTrueName: element["name"],
        sid: entidad.split(",")[0],
        sidName: entidad.split(",")[1],
        aid: element["captures"]["$"]["id"], //cambio ya que paso todo el objeto y no solo el "$"
        aidName: element["captures"]["$"]["name"], //cambio ya que paso todo el objeto y no solo el "$"
        aidType: element["captures"]["$"]["xsi:type"], // obtener el tipo de aspecto, individual o colectivo
        aidTypeconsole: element["captures"]["$"]["type"], //si es ESTADO O PREDCCION en el caso del modelo utilizado
        inid: element["usesAnalysisModel"][0]["produces"]["id"], //indicador 
        inidName: element["usesAnalysisModel"][0]["produces"]["name"],
        tipoProceso: element["xsi:type"],
        operadorAgregacion: element["captures"]["$"]["aggregationOperator"]
      }
      //mapear las rutas de las bd de los procesos y sus pesos (aspectos hijos)
      let arrayrutasbds = [];
      if (element["captures"]['isDerivedFrom']) {
        element["captures"]['isDerivedFrom'].forEach((item => {
          let objetorutasbds = {};
          //mapeo de pesos
          let bd = "postgresqllocal";
          // let tabla = "metricas";
          let peso = item["$"]["weight"];
          let idhijo = item["isCaptured"]["$"]["id"];
          objetorutasbds.peso = peso;
          objetorutasbds.idhijo = idhijo;
          objetorutasbds.bd = bd;
          arrayrutasbds.push(objetorutasbds);
        }));
      }
      collector["PesosTablas"] = arrayrutasbds; //cambiar nombre a algo mas correcto no paso las tablas si no los id de los procesos y los pesos
    }
    reflexivosMap.push(collector);
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

//funcion para obtener el intervalo de ejecucion del proceso
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

//funcion para calcular los rangos de fechas para extraer de las BD
function calcularFechas(element) {
  let fechaDesde = element["fechaDesde"];
  let fechaHasta = element["fechaHasta"];

  if (element["intervaloCalculo"]) {
    fechaHasta = new Date().toISOString();
    const fechaActual = new Date();
    switch (element["unidadTiempoIntervalo"]) {
      case "DIA":
        fechaDesde = new Date(
          fechaActual.setDate(
            fechaActual.getDate() - element["intervaloCalculo"]
          )
        ).toISOString();
        break;
      case "SEMANA":
        fechaDesde = new Date(
          fechaActual.setDate(
            fechaActual.getDate() - 7 * element["intervaloCalculo"]
          )
        ).toISOString();
        break;
      case "MES":
        fechaDesde = new Date(
          fechaActual.setMonth(
            fechaActual.getMonth() - element["intervaloCalculo"]
          )
        ).toISOString();
        break;
      case "AÑO":
        fechaDesde = new Date(
          fechaActual.setFullYear(
            fechaActual.getFullYear() - element["intervaloCalculo"]
          )
        ).toISOString();
        break;
    }
  } else if (element["periodoCalculoInicio"] && element["periodoCalculoFin"]) {
    fechaDesde = element["periodoCalculoInicio"];
    fechaHasta = element["periodoCalculoFin"];
  } else if (element["periodoCalculoInicio"]) {
    fechaDesde = element["periodoCalculoInicio"];
  } else if (element["periodoCalculoFin"]) {
    fechaHasta = element["periodoCalculoFin"];
  }

  return { fechaDesde, fechaHasta };
}

//funcion para igualar longitud de dos arreglos
function igualarLongitudDeArreglos(arr1, arr2) {
  const num1 = arr1.length;
  const num2 = arr2.length;

  if (num1 > num2) {
    return [arr1.slice(0, num2), arr2];
  } else if (num2 > num1) {
    return [arr1, arr2.slice(0, num1)];
  } else {
    return [arr1, arr2];
  }
}


module.exports = {
  ejecutarDemoniosControlados,
};