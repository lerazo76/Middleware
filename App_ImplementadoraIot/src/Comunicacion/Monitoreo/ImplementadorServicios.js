const request = require('request');
const express = require("express");
const router = express.Router();
const localConfig = require('../../../modelos/modeloObjeto.json');
const globalConfig = require('../../../modelos/modeloJSON.json');
const gestorManipulacion = require('../../LogicaNegocio/General/GestorManipulacionBD')
const protocolos = require('../../../src/LogicaNegocio/Monitoreo/ImplementadorApis')
const app = require('../../../src/LogicaNegocio/Monitoreo/ImplementadorAplicaciones')
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
middleware && middleware.containsService && middleware.containsService.length > 0 && middleware.containsService.forEach((api) => {
    
    console.log('\n\x1b[32m%s\x1b[0m', `Servicio web ${api.name} implementado (OK)`);
    // Obtengo todos los enlaces de conexion para almacenar la informacion en su respectiva tabla de la Base de Datos
    let hasLinkServiceToDataTable;

    if (api.hasLinkServiceToDataTable) {    
        // Busco el link para establecer el servicio con la base de datos
        hasLinkServiceToDataTable = api.hasLinkServiceToDataTable.split(" ");
        //let dataflow=globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[hasLinkServiceToDataTable[0].split(".")[1]].$.supports;
        //tipo=globalConfig["ArchitectureSelfAwarenessIoT"].containsDataFlow[dataflow.split(".")[1]].$.dataFlowType;
        
        // REVISAR ESTA PARTE DEL CODIGO ----> OJOOOOOOOOOOOO
        // Verificar si se puede tener mas de un link 
        // Revisar containsLink 22 y 23

        //let dataflow;
        /* hasLinkServiceToDataTable && hasLinkServiceToDataTable.forEach(linkService => {
            // Obtenemos Flujo de datos
            dataflow = globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[linkService.split(".")[1]].$.supports;   

            //console.log(dataflow);
            
            // Obtenemos el Tipo de flujo de datos
            tipo = globalConfig["ArchitectureSelfAwarenessIoT"].containsDataFlow[dataflow.split(".")[1]].$.dataFlowType;

            console.log(tipo);
        }) */
    }

    // eliminar esta linea una vez identifique de donde obtengo el tipo
    tipo='a';
    if(tipo){
        // Creamos un nuevo servicio web para intercambiar datos entre los nodos
        //router[api.$.method ? api.$.method.toLowerCase() : "get"]("/" + api.$.endPoint + "/3", async (req, res, next) => {
        router[api.method ? "get" : "get"]("/" + api.endPoint + "/3", async (req, res, next) => {

            let result;
            let tableInfo;
            let tableref;
            if (hasLinkServiceToDataTable.length > 0) {
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
                        
                        let data={};
                        for(var f=0;f<columna.length;f++){  
                           
                            // Verificamos que tipo de columna es, para crear el valor correspondiente para la columna   
                            if(columna[f].$.dataColumnType){
                               //metadata
                                if(columna[f].$.formulaExpression){        
                                   eval("function temp(){"+columna[f].$.formulaExpression+"}");
                                   let val=temp();
                                   data[columna[f].$.name] = val;  
                                }else{ // Revisar esta parte OJOOOOO, que valor se debe colocar
                                    data[columna[f].$.name] = 1;
                                }
                                
                            }
                            else{ // En caso de la columna no ser de tipo Metadata
                                
                                // hasRulePropertyToDataColumn
                                //let qr=columna[f].$.hasRuleAsDestination.split(" ");
                                let qr=columna[f].$.hasRulePropertyToDataColumn.split(" ");
                               
                                for(var qi=0;qi<qr.length;qi++){
                                    
                                    let qrr=qr[qi].split("/@")[1];
                                    if(df==="//@"+qrr){
                                        let r=qr[qi].split("/@");
                                        // REVISAR OJOOOOO
                                        //let rut=globalConfig["ArchitectureSelfAwarenessIoT"].containsDataFlow[r[1].split(".")[1]].containsDataMappingRule[r[2].split(".")[1]].$.relatesSourceColumn;
                                        // Obtiene la ruta del campo, para saber a que tabla y base de datos corresponde
                                        let rut=globalConfig["ArchitectureSelfAwarenessIoT"].containsDataFlow[r[1].split(".")[1]].containsDataMappingRule[r[2].split(".")[1]].$.relatesColumn;
                                        // 
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
                                        qi=qr.length;                               
                                    }
                                }
                                
                            }
                        }

                        result = gestorManipulacion.postMethod(tableInfo, data, tableref);
                        /* result.then( res => {
                            console.log(res);
                        }) */
                    }
                }
            }
        });
    }else{
        //1 servicio recibe data de una aplicacion y guarda en bd, por ahora debe ser solo post el servicio
        //3 servicio saca data de una bd y guarda en una bd

        // Descomentar cuando ya este todo creado OJOO*******
        //router[api.$.method ? api.$.method.toLowerCase() : "get"]("/" + api.$.endPoint + "/1", async (req, res, next) => {
           
        // Descomentar desde aqui ------------------------------------
        let result;
        let tableInfo;
        let tableref;

        if (hasLinkServiceToDataTable.length > 0) {
            for(var i=0;i<hasLinkServiceToDataTable.length;i++){
                const linkRef = hasLinkServiceToDataTable[i].split("/@");
                let index = linkRef[1].split(".")[1];
                let tipo = globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[index].$.type;
                
                // Funcion para obtener informacion sobre una tabla de la base de datos
                tableInfo = bd.getTableInfo(globalConfig, index);

                // Funcion para obtener informacion sobre el nodo al que hace referencia la tabla de la base de datos
                tableref = bd.getTablenodo(globalConfig, index);

                if(tipo){
                    console.log("******** Post Data ********");
                    let tapi=bd.getApis(globalConfig, req.body.link.split(".")[1]);
                    console.log(tapi);
                    let api=tapi[tapi.length-1];
                    let valoresnames =[];
                    api.containsReturnVariable.forEach((retorno)=>{
                        valoresnames.push(retorno.$.name);
                    });
                    let apiname=api.$.name;
                    let data={};
                    let j=0;
                    let i=0;
                    tableInfo.composedOfDataColumn.forEach((columna)=>{
                        if(columna.$.dataColumnType){
                            //metadata
                            if(columna.$.formulaExpression){ 
                                console.log(columna.$.formulaExpression)
                                eval("function temp(){"+columna.$.formulaExpression+"}");
                                let val=temp();
                                data[columna.$.name] = val;  
                            }
                            else{
                                let val;
                                let qr=columna.$.hasRulePropertyToDataColumn.split(" ");
                                let apiflow=globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[req.body.link.split(".")[1]].$.supports;
                                for(var qi=0;qi<qr.length;qi++){
                                    let qrr=qr[qi].split("/@")[1];   
                                    if(apiflow==="//@"+qrr){
                                        let r=qr[qi].split("/@");
                                        let rut=globalConfig["ArchitectureSelfAwarenessIoT"].containsDataFlow[r[1].split(".")[1]].containsDataMappingRule[r[2].split(".")[1]].$.relatesSpecificProperty;
                                        let rr=ProtRef.getReferencestrace(globalConfig,rut);
                                        val=rr[rr.length-1].$.value;
                                        qi=qr.length;
                                    }
                                }
                                data[columna.$.name] = val;                               
                            }
                        }
                        else{
                            let k=Object.keys(req.body.body[apiname]);
                            //console.log(req.body.body);
                            //console.log(k);
                            //console.log(valoresnames[i]);
                            data[valoresnames[i]] = req.body.body[apiname][k[i]];
                            i++;
                        }
                        j++;
                    });
                    result = postMethod(tableInfo, data, tableref);
                    result.then(r => {
                        console.log(r,' ddddd');
                    })
                }
            }
        }
        // Hasta aqui --------------
            
        //});
        
        // api.$.hasLinkServiceToAPI    Consultar no existe este parametro en el modelo JSON   OJOOOOOOOOO
        
        if(api.hasLinkAppToAPI){
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
