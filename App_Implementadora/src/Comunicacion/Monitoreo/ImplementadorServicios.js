const request = require('request');
const express = require("express");
const router = express.Router();
const localConfig = require('../../../modelos/modeloObjeto.json');
const globalConfig = require('../../../modelos/modeloJSON.json');
const gestorManipulacion = require('../../LogicaNegocio/General/GestorManipulacionBD')
const protocolos = require('../../../src/LogicaNegocio/Monitoreo/ImplementadorApis')
const app = require('../../../src/LogicaNegocio/Monitoreo/ImplementadorAplicaciones')
const ejeTar = require('../../LogicaNegocio/General/EjecutorTareas')
const bd = require('../../Datos/BD');
const e = require('express');

console.log('\n\x1b[32m%s\x1b[0m', 'Implementando los servicios web ...');

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
    
    console.log('\n\x1b[32m%s\x1b[0m', `Servicio web ${api.name} implementado (OK)`);
    // Obtengo todos los enlaces de conexion para almacenar la informacion en su respectiva tabla de la Base de Datos
    let hasLinkServiceToDataTable;

    if (api.hasLinkServiceToDataTable) {    
        hasLinkServiceToDataTable = api.hasLinkServiceToDataTable.split(" ");
        
        const procesosenjson = ejeTar.buscarValor(globalConfig, api.name, 8); 
        // Obtenemos el link de enlace a la base de datos correspondiente al flujo de recoleccion de datos para los servicios
        ejeTar.cambiarValorPropiedad(procesosenjson, "hasLinkServiceToDataTable", globalConfig, "$");
        // Obtenemos el flujo de datos que soporta cada enlace de conexion
        ejeTar.cambiarValorPropiedad(procesosenjson, "supports", globalConfig, "$");
        // Este proceso es para los metodos de agregacion
        if(procesosenjson[0].hasLinkServiceToDataTable.length > 0){
       
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

                        // ------------------
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
                                    //console.log(procesosenjson[0].composedOfDataColumn[f].name);
                                }
                            }else{ // En caso de la columna no ser de tipo Metadata
                                //let propertyColumn=columna[f].$.hasRuleAsDestination.split(" ");  
                                //console.log(columna[f].$.hasRuleAsDestination);
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
            //console.log(procesosenjson[0].hasLinkServiceToDataTable.supports);
            if(procesosenjson[0].hasLinkServiceToDataTable.supports.dataFlowType){
                tipo = procesosenjson[0].hasLinkServiceToDataTable.supports.dataFlowType;
                console.log(tipo);
            }
        }catch(error){
        }
        if(api.hasLinkServiceToDataTable){
            hasLinkServiceToDataTable = api.hasLinkServiceToDataTable.split(" ");
        }

        // Busco las rutas con la que se va a establecer conexion a las distintas bases de datos para los servicios
        /* hasLinkServiceToDataTable = api.hasLinkServiceToDataTable.split(" ");
        let dataflow=globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[hasLinkServiceToDataTable[0].split(".")[1]].$.supports;
        tipo=globalConfig["ArchitectureSelfAwarenessIoT"].containsDataFlow[dataflow.split(".")[1]].$.dataFlowType; */
        // Descomentar
    }

    // eliminar esta linea una vez identifique de donde obtengo el tipo
    //tipo='a';
    if(tipo){
        // Creamos un nuevo servicio web para intercambiar datos entre los nodos
        //router[api.$.method ? api.method.toLowerCase() : "get"]("/" + api.$.endPoint + "/3", async (req, res, next) => {
        //router[api.method ? api.method.toLowerCase()  : "get"]("/" + api.endPoint + "/3", async (req, res, next) => {
        
            let result;
            let tableInfo;
            let tableref;
           

            if (hasLinkServiceToDataTable.length > 0) {
             
                for(var i=0;i<hasLinkServiceToDataTable.length;i++){
                    
                    const linkRef = hasLinkServiceToDataTable[i].split("/@");
                    console.log(linkRef);
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

                        // ------------------
                        const procesosenjsonc = ejeTar.buscarValor(globalConfig, tableInfo.$.name, 8); 
                        ejeTar.cambiarValorPropiedad(procesosenjsonc, "composedOfDataColumn", globalConfig, "$");
                        let data={};
                        for(var f = 0; f < procesosenjsonc[0].composedOfDataColumn.length; f++){
                           
                            if(procesosenjsonc[0].composedOfDataColumn[f].dataColumnType){
                                
                                if(procesosenjsonc[0].composedOfDataColumn[f].formulaExpression){
                                    // En este caso obtenemos el valor de acuerdo a la formula que se va a ejecutar
                                    eval("function temp(){"+procesosenjsonc[0].composedOfDataColumn[f].formulaExpression+"}");
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
                            }else{ // En caso de la columna no ser de tipo Metadata
                                //let propertyColumn=columna[f].$.hasRuleAsDestination.split(" ");       
                                let propertyColumn = [];     
                                if(columna[f].$.hasRulePropertyToDataColumn){                   
                                    propertyColumn = columna[f].$.hasRulePropertyToDataColumn.split(" ");                              
                                }
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

                                        if(!result){
                                            if(sourceColumn === "cargaCPU"){
                                                result = require('../../../src/LogicaNegocio/Monitoreo/ImplementadorApis').obtenerCargaCPU().cargaCPU;
                                            }else if(sourceColumn === "CO"){
                                                result = Math.random() * (1000 - 0) + 0;
                                                result = result.toFixed(2);
                                            }else if(sourceColumn === "temperatura"){ 
                                                result = Math.random() * (22 - 18) + 18;
                                                result = result.toFixed(2);
                                            }else if(sourceColumn === "humedad"){
                                                result = Math.random() * (60 - 40) + 40;
                                                result = result.toFixed(2);
                                            }
                                        }
                                        data[columna[f].$.name] = result;
                                        qi=propertyColumn.length;                           
                                    }
                                }

                            }
                        }
                        result = gestorManipulacion.postMethod(tableInfo, data, tableref);
                        result.then( res => {
                            console.log(res);
                        })
                    }
                }
            }
        //});
    }else{
        //1 servicio recibe data de una aplicacion y guarda en bd, por ahora debe ser solo post el servicio
        //3 servicio saca data de una bd y guarda en una bd

        // Descomentar cuando ya este todo creado OJOO*******
       
        router[api.method ? api.method.toLowerCase() : "get"]("/" + api.endPoint + "/1", async (req, res, next) => {
      
            // Descomentar desde aqui ------------------------------------
            let result;
            let tableInfo;
            let tableref;

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
                                //metadata
                                //console.log(columna.$.name);
                                if(columna.$.formulaExpression){ 
                                    eval("function temp(){"+columna.$.formulaExpression+"}");
                                    let val=temp();
                                    data[columna.$.name] = val;
                                }
                                else{
                                    let val;
                                    // Obtiene las propiedades y reglas de mapeo de las columnas de las bases de datos
                                    let propertyColumn=columna.$.hasRulePropertyToDataColumn.split(" ");
                                    
                                    // Contains Data Flow
                                    let apiflow=globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[req.body.link.split(".")[1]].$.supports;                              
                                    
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
                                    if(val==0){
                                        k=Object.keys(req.body.body[apiname]);
                                        let v = parseFloat(req.body.body[apiname][k[i]]);
                                        data[columna.$.name] = v;  
                                        i++;
                                    }else{
                                        data[columna.$.name] = val;  
                                    }
                                    /* console.log(valoresnames[i]);
                                    
                                    data[valoresnames[i]] = req.body.body[apiname][k[i]];   
                                                            */
                                }
                            }else{
                                let k=Object.keys(req.body.body[apiname]);
                                data[valoresnames[i]] = req.body.body[apiname][k[i]];
                                i++;
                            }
                            j++;
                        });
                        result = gestorManipulacion.postMethod(tableInfo, data, tableref);
                        
                        result.then(r => {
                            console.log(r);
                        })
                    }
                }
            }
            // Hasta aqui --------------
                
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
                var Codigoo = app.codigoenviarapp();
                function ejapi(i){
                    setInterval(() => {
                    ejapi2(i);
                    },time[i]);
                }
                function ejapi2(i){
                    eval(Codigoo);
                }
                for(var i=0;i<apis.length;i++){
                    console.log(i+"se supone 1");
                    ejapi(i);
                }
            } 
//
        }     
    }
    
});
module.exports = router;


// async. Se coloca antes de una expresión que retorna una promesa
// await, la ejecución de la función async se detiene hasta que la promesa se resuelva o rechace. 
