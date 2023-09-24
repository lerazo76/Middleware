let modelo = require('../../../modelos/modeloObjeto')

console.log('\n\x1b[32m%s\x1b[0m', 'Implementando las funciones APIs ...');

// Buscamos en el modelo todas las APIS para crear
modelo.forEach((resource, index) => {
    let nuevaAPI = "";
    resource.containsResource.forEach((propiedades)=>{
        if(propiedades['xsi:type'] == 'MonitorIoT:API'){
            nuevaAPI = codigoApis(propiedades);
            eval(nuevaAPI);
            console.log('\n\x1b[32m%s\x1b[0m', `API ${propiedades.name} implementada (OK)`);
        }
    })
});

// Codigo para crear las APIS
function codigoApis(propiedades){
    let newAPI = "";
    newAPI += "exports."+propiedades.name+" = function ("; 
    // Agrego los parametros en caso la API tenga contains parameter
    propiedades && propiedades.containsParameter && propiedades.containsParameter.forEach((parameters, i) => {
        newAPI += parameters.name + ((i===propiedades.containsParameter.length-1) ? "" : ",");
    })
    newAPI += "){\n" + propiedades.instructions + "\n}"; 
    return newAPI;
}


// Funcion para obtener la api de acuerdo al link del servicio
exports.getApis = function(globalConfig, index){
    const references = [];
    const link = globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[index-0];
    let refList = [];
    if (link.$.linksAPI) refList = link.$.linksAPI.split("/@");
    let auxObjRef = globalConfig["ArchitectureSelfAwarenessIoT"];
    for (let i = 1; i < refList.length; i++) {
        let str = refList[i];
        auxObjRef = auxObjRef[str.split(".")[0]][str.split(".")[1]];
        references.push(auxObjRef);
    }
    return references;
};

// Intervalos de tiempo para la ejecucion de la api, durante que
exports.getTiempo = function(globalConfig,api){
    var linkdataf;
    if(api.$.hasLinkAPIToIoTDevice){
        linkdataf=globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[api.$.hasLinkAPIToIoTDevice.split(".")[1]].$.supports;
    }else{
        linkdataf=globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[api.$.hasLinkServiceToAPI.split(".")[1]].$.supports;
    }
    var dataf=globalConfig["ArchitectureSelfAwarenessIoT"].containsDataFlow[linkdataf.split(".")[1]];
    var unidad=dataf.$.unitOfTime;
    var inter=dataf.$.flowExecutionTimeInterval;
    var mult;
    switch (unidad){
        case "Second":
            mult=1000;
            break;
        case "Minute":
            mult=60000;
            break;
        default:
                mult=1;
            break;
    }
    return inter*mult;
    
};


function getReferences(globalConfig,index){
    const references = [];
    const link = globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[index];
    let refList = [];
    if (link.$.linksService) refList = link.$.linksService.split("/@");
    else if (link.$.linkService) refList = link.$.linkService.split("/@");
    else if (link.$.linksTopic) refList = link.$.linksTopic.split("/@");
    let auxObjRef = globalConfig["ArchitectureSelfAwarenessIoT"];
    for (let i = 1; i < refList.length; i++) {
        let str = refList[i];
        auxObjRef = auxObjRef[str.split(".")[0]][str.split(".")[1]];
        references.push(auxObjRef);
    }
    return references;
}

function getLocalProtocol (globalConfig, index, index2) {
    const protocolList = globalConfig["ArchitectureSelfAwarenessIoT"].containsEntity[index].containsProtocol;
    if (protocolList && protocolList.length > 0) {
        const protocol = protocolList[index2];
        if (protocol) {
            return {
                port: protocol.$.port,
                name: protocol.$.name
            };
        } else {
            return "";
        }
    }
}

exports.getServiceURI = function (globalConfig, index){
    const references = getReferences(globalConfig, index);
    let middleware, service, network, node;
    if (references && references.length > 2) {
        service = references[references.length - 1];
        middleware = references[references.length - 2];
        node = references[references.length - 3];
        node && node.containsResource.forEach(resource => {
            if (resource.$["xsi:type"] === "MonitorIoT:NetworkInterface") {
                network = resource;
            }
        });
        if (service && middleware && node && network) {
            let protocol = {};
            const protocolRef = middleware.$.usesProtocol.split("/@");
            if (protocolRef.length > 0) {
                let index = 0;
                const auxList = protocolRef[1].split(".");
                index = auxList[1];
                let index2= protocolRef[2].split(".")[1];
                protocol = getLocalProtocol(globalConfig, index, index2);
            }
            const url = "http://" + network.networkAddress + ":" + protocol.port + "/" + service.$.endPoint;             
            return url;
        } else {
            return "";
        }
    } else {
        return "";
    }
};