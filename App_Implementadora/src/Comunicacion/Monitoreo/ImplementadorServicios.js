const request = require('request');
const express = require("express");
const router = express.Router();
const localConfig = require('../../../modelos/modeloObjeto.json'); //importando el modelo de arquitectura correspondiente al nodo
const globalConfig = require('../../../modelos/modeloJSON.json'); //importando el modelo de arquitectura completo
const gestorManipulacion = require('../../LogicaNegocio/General/GestorManipulacionBD'); //importan el componente que permite interactuar con la base de datos
const protocolos = require('../../../src/LogicaNegocio/Monitoreo/ImplementadorApis'); //importan el componente que permite obtener las apis
const app = require('../../../src/LogicaNegocio/Monitoreo/ImplementadorAplicaciones'); //importan el componente que permite obtener las aplicaciones
// const ejeTar = require('../../LogicaNegocio/General/EjecutorTareas');
const ejeTar = require("../../../Funciones");
const bd = require('../../Datos/BD');
const start = require('../../../StartApp'); // importar el componente start para obtener ciertas variables 
const tipoApp = start.app; // variable para visualizar los mensajes en el log Monitoreo/Autoconsciencia

if (tipoApp==1 || tipoApp==0){
    console.log('\x1b[32m%s\x1b[0m', 'Implementando los servicios web ...');
}

function aux(url){
    const headers = {
        'content-type':'application/json'
    };
    request({
        url: url+"/3",
        headers: headers,
        method: 'POST'
    },
    (error, response, body) => {
        if (!error && response.statusCode === 200) {
            console.log(body);
        }else {
            console.log(error);
        }
    });   
}

// Buscamos el servidor de aplicaciones web que pública los servicios RESTful para el intercambio, agregación y almacenamiento de datos
let middleware;
localConfig && localConfig.forEach(resource => {
    resource.containsResource && resource.containsResource.forEach( propiedades => {
        if(propiedades["xsi:type"] == "MonitorIoT:Middleware"){
             middleware = propiedades;
        }
    })
})
let tipo;
// Obtenemos el Servidor de aplicaciones web que pública los servicios RESTful para el intercambio, agregación y almacenamiento de datos.
middleware && middleware.containsService && middleware.containsService.length > 0 && middleware.containsService.forEach((api) => {
    if (tipoApp==1 || tipoApp==0){
        console.log('\x1b[32m%s\x1b[0m', `Servicio web ${api.name} implementado (OK)`);
    }
    // Obtengo todos los enlaces de conexion para almacenar la informacion en su respectiva tabla de la Base de Datos
    let hasLinkServiceToDataTable;
    if (api.hasLinkServiceToDataTable) {     
        hasLinkServiceToDataTable = api.hasLinkServiceToDataTable.split(" ");
        // Obtenemos el nombre de la API
        const procesosenjson = ejeTar.buscarValor(globalConfig, api.name, 8); 
        // Obtenemos el link de enlace a la base de datos correspondiente al flujo de recoleccion de datos para los servicios
        ejeTar.cambiarValorPropiedad(procesosenjson, "hasLinkServiceToDataTable", globalConfig, "$");
        // Obtenemos el flujo de datos que soporta cada enlace de conexion
        ejeTar.cambiarValorPropiedad(procesosenjson, "supports", globalConfig, "$");
        // Este proceso es para los metodos de agregacion
        if(procesosenjson[0].hasLinkServiceToDataTable.length > 0){
            // Creamos un nuevo servicio para interactuar con la aplicacion
            router[api.method ? api.method.toLowerCase()  : "get"]("/" + api.endPoint + "/3", async (req, res, next) => {
                let result;
                let tableInfo;
                let tableref;
                for(var i=0;i<hasLinkServiceToDataTable.length;i++){
                    const linkRef = hasLinkServiceToDataTable[i].split("/@");
                    let index = linkRef[1].split(".")[1];
                    let tipo=globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[index].$.type;
                    let df=globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[index].$.supports;
                    // Obtiene informacion de la tabla de la base de datos
                    tableInfo = bd.getTableInfo(globalConfig, index);
                    // Obtiene informacion del nodo al que se tiene que conectar para operar
                    tableref = bd.getTablenodo(globalConfig, index);
                    if(tipo){
                        // Obtiene informacion de cada columna de cada tabla de la Base de Datos
                        let columna=tableInfo.composedOfDataColumn;
                        //const procesosenjsonc = ejeTar.buscarValor(globalConfig, tableInfo.$.name, 8); 
                        //ejeTar.cambiarValorPropiedad(procesosenjsonc, "composedOfDataColumn", globalConfig, "$");
                        let data={};
                        for(var f = 0; f < columna.length; f++){
                            if(columna[f].$.dataColumnType){
                                if(columna[f].$.formulaExpression){
                                    // En este caso obtenemos el valor de acuerdo a la formula que se va a ejecutar
                                    eval("function temp(){"+columna[f].$.formulaExpression+"}");
                                    let val=temp();
                                    data[columna[f].$.name] = val;                                     
                                }else{
                                    // En este caso obtenemos el valor en caso de ser un tipo de MetaData correspondiente a la regla de asignacion de datos
                                    const procesosenjsonrul = ejeTar.buscarValor(globalConfig, columna.hasRulePropertyToDataColumn, 5); 
                                    let valorMetaData;
                                    if(procesosenjsonrul[1]){
                                        valorMetaData = ejeTar.buscarValor(globalConfig, procesosenjsonrul[1].hasRulePropertyToDataColumn, 8);
                                    }
                                    // En el primer caso puede hacer referencia a ContainsComputingNode y el segundo caso es a ContainsSubPhysicalEntity
                                    if(valorMetaData){
                                        data[columna[f].name] = valorMetaData[0].value != undefined ? valorMetaData[0].value : valorMetaData[1].value;
                                    }else{
                                        data[columna[f].name] = 0;
                                    }
                                }
                            }else{ // En caso de la columna no ser de tipo Metadata
                                let propertyColumn = [];     
                                if(columna[f].$.hasRuleAsDestination){               
                                    propertyColumn = columna[f].$.hasRuleAsDestination.split(" ");                              
                                }
                                for(var qi=0;qi<propertyColumn.length;qi++){
                                    let propertyColumnr=propertyColumn[qi].split("/@")[1];
                                    if(df==="//@"+propertyColumnr){
                                        let r=propertyColumn[qi].split("/@");
                                        //let rut=globalConfig["ArchitectureSelfAwarenessIoT"].containsDataFlow[r[1].split(".")[1]].containsDataMappingRule[r[2].split(".")[1]].$.relatesSourceColumn;
                                        // Obtiene la ruta del campo, para saber a que tabla y base de datos corresponde
                                        let rut=globalConfig["ArchitectureSelfAwarenessIoT"].containsDataFlow[r[1].split(".")[1]].containsDataMappingRule[r[2].split(".")[1]].$.relatesSourceColumn;
                                        // Obtiene la regla de mapeo o el campo de la base de datos donde se va almacenar el dato
                                        let mappingRule=globalConfig["ArchitectureSelfAwarenessIoT"].containsDataFlow[r[1].split(".")[1]].containsDataMappingRule[r[2].split(".")[1]]; 
                                        // Obtiene las Bases de Datos y el nodo al que hace referencia cada una
                                        let rr= bd.getReferencestrace(globalConfig,rut);
                                        // Informacion de cada Tabla de la Base de Datos 
                                        let sourceDataTable=rr[rr.length-2];
                                        // Informacion de cada Campo de cada Tabla de la Base de Datos
                                        let sourceColumn=rr[rr.length-1].$.name;  
                                        // Obtiene la direccion para conectarse a la Base de Datos
                                        tableref2 = bd.getTablenodo(globalConfig,sourceDataTable.$.hasLinkServiceToDatable.split(".")[sourceDataTable.$.hasLinkServiceToDatable.split(".").length-1]);
                                        
                                        // Obtenemos informacion de la Base de Datos
                                        let data2 = gestorManipulacion.getMethod(sourceDataTable,tableref2);
                                        let result = 0;
                                        let cont = 0;
                                        sourceColumn = sourceColumn.toLowerCase();
                                        let nameCol = columna[f].$.name;
                                        data2.then( res => {
                                            if (mappingRule.$.aggregationOperation === "Mean") {    
                                                res.forEach(e => {
                                                    if(sourceColumn){
                                                        result += parseInt(e[sourceColumn]);
                                                    }
                                                    cont += 1;
                                                });
                                                result = result / cont; 
                                                
                                                data[nameCol] = result.toString(); 
                                            } else if (mappingRule.$.aggregationOperation === "Sum") {
                                                res.forEach(e => {
                                                    result += parseInt(e[sourceColumn]);
                                                });
                                            } 
                                        }).catch(e => {
                                            console.log(e);
                                        })
                                        //data[columna[f].$.name] = result;
                                        qi=propertyColumn.length;    
                                    }
                                }
                            }
                        }
                        /* result = gestorManipulacion.postMethod(tableInfo, data, tableref);
                       
                        result.then( res => {
                            console.log(res);
                        }) */
                    }
                }
            });
        }
        try{
            if(procesosenjson[0].hasLinkServiceToDataTable.supports.dataFlowType){
                tipo = procesosenjson[0].hasLinkServiceToDataTable.supports.dataFlowType;
            }
        }catch(error){
        }
        if(api.hasLinkServiceToDataTable){
            hasLinkServiceToDataTable = api.hasLinkServiceToDataTable.split(" ");
        }
    }

    if(tipo){
        // Creamos un nuevo servicio web para intercambiar datos entre los nodos
        router[api.method ? api.method.toLowerCase()  : "get"]("/" + api.endPoint + "/3", async (req, res, next) => {
            let result;
            let tableInfo;
            let tableref;
            if (hasLinkServiceToDataTable.length > 0) {
                for(var i=0;i<hasLinkServiceToDataTable.length;i++){
                    // Obtenemos el link de enlace a la tabla de la base de datos
                    const linkRef = hasLinkServiceToDataTable[i].split("/@");
                    let index = linkRef[1].split(".")[1];
                    let tipo=globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[index].$.type;
                    let df=globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[index].$.supports;
                    // Obtiene informacion de la tabla de la base de datos
                    tableInfo = bd.getTableInfo(globalConfig, index);
                    // Obtiene informacion del nodo al que se tiene que conectar para operar
                    tableref = bd.getTablenodo(globalConfig, index);
                    if(tipo){
                        // Obtiene informacion de cada columna de cada tabla de la Base de Datos
                        let columna=tableInfo.composedOfDataColumn;
                        // Obtenemos la informacion de la tabla de la base de datos
                        const procesosenjsonc = ejeTar.buscarValor(globalConfig, tableInfo.$.name, 8); 
                        ejeTar.cambiarValorPropiedad(procesosenjsonc, "composedOfDataColumn", globalConfig, "$");
                        let data={};
                        for(var f = 0; f < procesosenjsonc[0].composedOfDataColumn.length; f++){
                            if(procesosenjsonc[0].composedOfDataColumn[f].dataColumnType){
                                if(procesosenjsonc[0].composedOfDataColumn[f].formulaExpression){
                                    // En este caso obtenemos el valor de acuerdo a la formula que se va a ejecutar
                                    eval("function temp(){"+procesosenjsonc[0].composedOfDataColumn[f].formulaExpression+"}");
                                    // Ejecutamos las funciones
                                    let val=temp();
                                    data[procesosenjsonc[0].composedOfDataColumn[f].name] = val; 
                                }else{
                                    // En este caso obtenemos el valor en caso de ser un tipo de MetaData correspondiente a la regla de asignacion de datos
                                    const procesosenjsonrul = ejeTar.buscarValor(globalConfig, procesosenjsonc[0].composedOfDataColumn[f].hasRulePropertyToDataColumn, 5); 
                                    let valorMetaData;
                                    if(procesosenjsonrul[1]){
                                        valorMetaData = ejeTar.buscarValor(globalConfig, procesosenjsonrul[1].hasRulePropertyToDataColumn, 8);
                                    }
                                    // En el primer caso puede hacer referencia a ContainsComputingNode y el segundo caso es a ContainsSubPhysicalEntity
                                    if(valorMetaData){
                                        data[procesosenjsonc[0].composedOfDataColumn[f].name] = valorMetaData[0].value != undefined ? valorMetaData[0].value : valorMetaData[1].value;
                                    }else{
                                        data[procesosenjsonc[0].composedOfDataColumn[f].name] = 0;
                                    }
                                }
                            }else{ // En caso de que la columna no sea Metadata  
                                let propertyColumn = [];     
                                if(columna[f].$.hasRulePropertyToDataColumn){                   
                                    propertyColumn = columna[f].$.hasRulePropertyToDataColumn.split(" ");                              
                                }
                                // Recorremos todas las propiedades de las columnas para obtener las reglas de mapeo
                                for(var qi=0;qi<propertyColumn.length;qi++){
                                    let propertyColumnr=propertyColumn[qi].split("/@")[1];
                                    if(df==="//@"+propertyColumnr){
                                        let r=propertyColumn[qi].split("/@");
                                        //let rut=globalConfig["ArchitectureSelfAwarenessIoT"].containsDataFlow[r[1].split(".")[1]].containsDataMappingRule[r[2].split(".")[1]].$.relatesSourceColumn;
                                        // Obtiene la ruta del campo, para saber a que tabla y base de datos corresponde
                                        let rut=globalConfig["ArchitectureSelfAwarenessIoT"].containsDataFlow[r[1].split(".")[1]].containsDataMappingRule[r[2].split(".")[1]].$.relatesColumn;
                                        // Obtiene la regla de mapeo o el campo de la base de datos donde se va almacenar el dato
                                        let mappingRule=globalConfig["ArchitectureSelfAwarenessIoT"].containsDataFlow[r[1].split(".")[1]].containsDataMappingRule[r[2].split(".")[1]]; 
                                        // Obtiene las Bases de Datos y el nodo al que hace referencia cada una
                                        let rr= bd.getReferencestrace(globalConfig,rut);
                                        // Informacion de cada Tabla de la Base de Datos 
                                        let sourceDataTable=rr[rr.length-2];
                                        // Informacion de cada Campo de cada Tabla de la Base de Datos
                                        let sourceColumn=rr[rr.length-1].$.name;  
                                        // Obtiene la direccion para conectarse a la Base de Datos
                                        tableref2 = bd.getTablenodo(globalConfig,sourceDataTable.$.hasLinkServiceToDatable.split(".")[sourceDataTable.$.hasLinkServiceToDatable.split(".").length-1]);
                                        // Obtenemos informacion de la Base de Datos
                                        let data2 = gestorManipulacion.getMethod(sourceDataTable,tableref2);
                                        let result = 0;
                                        data2.then( res => {
                                            if (mappingRule.$.aggregationOperation === "Mean") {    
                                                res.forEach(e => {
                                                    result += parseInt(e[sourceColumn]);
                                                });
                                                result = result / data2.length;
                                            } else if (mappingRule.$.aggregationOperation === "Sum") {
                                                res.forEach(e => {
                                                    result += parseInt(e[sourceColumn]);
                                                });
                                            } 
                                        }).catch(e => {
                                            console.log('Error');
                                        })
                                        data[columna[f].$.name] = result;
                                        qi=propertyColumn.length;                           
                                    }
                                }

                            }
                        }
                        // Utilizamos el metodo post para publicar datos en la base de datos de monitoreo
                        result = gestorManipulacion.postMethod(tableInfo, data, tableref);
                        if (tipoApp==1 || tipoApp==0){
                            result.then( res => {
                                console.log(res);
                            })
                        }
                    }
                }
            }
        });
    }else{
        //1 servicio recibe data de una aplicacion y guarda en bd, por ahora debe ser solo post el servicio
        //3 servicio saca data de una bd y guarda en una bd       
        router[api.method ? api.method.toLowerCase() : "get"]("/" + api.endPoint + "/1", async (req, res, next) => {
            let result;
            let tableInfo;
            let tableref;
            // Verificamos que exista una relacion entre el servicio y la base de datos
            if (hasLinkServiceToDataTable.length > 0) {
                for(var i=0;i<hasLinkServiceToDataTable.length;i++){
                    // Obtiene los links de servicio con la tabla de la base de datos
                    const linkRef = hasLinkServiceToDataTable[i].split("/@");
                    let index = linkRef[1].split(".")[1];   
                    // Obtiene el tipo de procedimiento que se va a realizar como INSERT/UPDATE/DELETE
                    let tipo = globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[index].$.type;
                    // Funcion para obtener informacion sobre una tabla de la base de datos
                    tableInfo = bd.getTableInfo(globalConfig, index);
                    // Funcion para obtener informacion sobre el nodo al que hace referencia la tabla de la base de datos
                    tableref = bd.getTablenodo(globalConfig, index);
                    if(tipo){
                        // Obtiene todas las apis de acuerdo a lo recivido en el cuerpo de la peticion
                        let tapi=protocolos.getApis(globalConfig, req.body.link.split(".")[1]);
                        // Obtiene la informacion de la API como el nombre, descripcion, instrunccion
                        let api=tapi[tapi.length-1];                    
                        // Obtenemos los nombres de campos de la base de datos con los cuales se va a operar (cargaCPU)
                        let valoresnames =[];
                        api.containsReturnVariable.forEach((retorno)=>{
                            valoresnames.push(retorno.$.name);
                        });
                        // Obtiene el nombre de la API
                        let apiname=api.$.name;
                        let data={};
                        let j=0;
                        let i=0;
                        tableInfo.composedOfDataColumn.forEach((columna)=>{
                            if(columna.$.dataType){
                                // Procedimiento para cuando una columna sea metadata
                                if(columna.$.formulaExpression){ 
                                    eval("function temp(){"+columna.$.formulaExpression+"}");
                                    let val=temp();
                                    data[columna.$.name] = val;
                                }else{ // Procedimiento en caso de no ser una columna metadata
                                    let val;
                                    // Obtiene las propiedades y reglas de mapeo de las columnas de las bases de datos
                                    let propertyColumn=columna.$.hasRulePropertyToDataColumn.split(" ");
                                    // Obtiene los flujos de datos
                                    let apiflow=globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[req.body.link.split(".")[1]].$.supports;                              
                                    // Recorrido de las propiedades de las columnas para obtener el valor a ser ingresado
                                    for(var qi=0;qi<propertyColumn.length;qi++){
                                        let propertyColumnr=propertyColumn[qi].split("/@")[1];   
                                        if(apiflow==="//@"+propertyColumnr){
                                            let r=propertyColumn[qi].split("/@");
                                            let rut=globalConfig["ArchitectureSelfAwarenessIoT"].containsDataFlow[r[1].split(".")[1]].containsDataMappingRule[r[2].split(".")[1]].$.relatesSpecificProperty;
                                            let rr=protocolos.getReferencestrace(globalConfig,rut);
                                            val = rr[rr.length-1].$.value != undefined ? rr[rr.length-1].$.value : 0.0;
                                            qi=propertyColumn.length;
                                        }
                                    }
                                    let k;
                                    if(val==0){ // En caso de ser el valor 0 verificamos si tiene relacion con alguna API
                                        k=Object.keys(req.body.body[apiname]);
                                        let v = parseFloat(req.body.body[apiname][k[i]]);
                                        data[columna.$.name] = v;  
                                        i++;
                                    }else{ // Caso contrario ingresamos el valor obtenido
                                        data[columna.$.name] = val;  
                                    }
                                }
                            }else{ // Obtenemos el valor a ser ingresado en la base de datos cuando se hace un llamado de la api
                                let k=Object.keys(req.body.body[apiname]);
                                data[valoresnames[i]] = req.body.body[apiname][k[i]];
                                i++;
                            }
                            j++;
                        });
                        // Publicamos los datos obtenidos en la base de datos
                        result = gestorManipulacion.postMethod(tableInfo, data, tableref);
                        if (tipoApp==1 || tipoApp==0){
                            result.then(r => {
                                console.log(r);
                            })
                        }
                    }
                }
            }
        });

        // Consultado 07/10/2023 Actualmente no se utiliza no hay problema, queda para otras cosas del futuro
        
        if(api.hasLinkServiceToAPI){
            let apis=[];
            let apinames=[];
            let rutas=[];
            let rutastipo=[];
            let linkappserv;
            let linkappservortop=[];
            let time=[];
            let apisbeta=api.$.hasLinkServiceToAPI.split("//@");
            for (var i=1; i<apisbeta.length; i++){
                var tapi=protocolos.getApis(globalConfig,apisbeta[i].split(".")[1]);
                apis.push(tapi[tapi.length-1]);
            }
            if(apis.length>0){
                var j=-1;
                apis.forEach(api2 => {
                    j++;
                    time[j]=protocolos.getTiempo(globalConfig,api2);
                    apinames[j]=api2.$.name;
                    let urlService=""; 
                    try {
                        const serviceRef = api.$.hasLinkServiceToAPI.split("//@");
                        if (serviceRef.length > 0) {
                            for (var i=1; i<serviceRef.length; i++){
                                linkappserv=api2.$.hasLinkServiceToAPI;
                                let index = 0;
                                index = serviceRef[i].split(".")[1];
                                urlService = protocolos.getServiceURI(globalConfig, index);
                                urlService+="/1";
                            }
                        }
                    } catch (error) {}
                    linkappservortop[j]=linkappserv;
                    rutas[j]=urlService;
                    rutastipo[j]=1;
                });
                const headers = {
                    'content-type': 'application/json'
                };
                /*var Codigoo = app.codigoenviarapp();
                function ejapi(i){
                    setInterval(() => {
                    ejapi2(i);
                    },time[i]);
                }
                function ejapi2(i){
                    eval(Codigoo);
                }
                for(var i=0;i<apis.length;i++){
                    ejapi(i);
                }*/
            } 
        }     
    }
    
});
module.exports = router;