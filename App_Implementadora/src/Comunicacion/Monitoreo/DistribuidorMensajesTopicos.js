let globalConfig
try {
    globalConfig = require('../../../modelos/modeloJSON.json');
} catch (error) {}

// get the link object
var getReferences = exports.getReferences = (globalConfig, index) => {
    const references = []
    const link = globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[index]
    // //@containsEntity.0/@containsComputingNode.0/@containsResource.1/@containsService.0
    const refList = link.$.linksService.split("/@")
    let auxObjRef = globalConfig["ArchitectureSelfAwarenessIoT"]
    for (let i = 1; i < refList.length; i++) {
        let str = refList[i]
        auxObjRef = auxObjRef[str.split(".")[0]][str.split(".")[1]]
        references.push(auxObjRef);
    }
    return references
}

// Funcion para obtener los protocolos para crear los brokers
var getLocalProtocol = exports.getLocalProtocol = (globalConfig, indexEntity, indexProtocol) => {
    const entityList = globalConfig["ArchitectureSelfAwarenessIoT"].containsEntity
    if (entityList && entityList.length > 0) {
        const entity = entityList[indexEntity]
        if (entity) {
            const protocolList = entity.containsProtocol
            if (protocolList && protocolList.length > 0) {
                const protocol = protocolList[indexProtocol]
                if (protocol) {
                    return {
                        port: protocol.$.port,
                        name: protocol.$.name
                    }
                } else {
                    return ""
                }
            }
        } else {
            return ""
        }
    }
}

exports.getServiceURI = (globalConfig, index) => {
    const references = getReferences(globalConfig, index)
    let middleware, service, network, node;
    if (references && references.length > 2) {
        service = references[references.length - 1]
        middleware = references[references.length - 2]
        node = references[references.length - 3]
        node && node.containsResource.forEach(resource => {
            if (resource.$["xsi:type"] == "MonitorIoT:NetworkInterface") {
                network = resource;
            }
        })
        if (service && middleware && node && network) {
            let protocol = {};
            // //@containsProtocol.1
            const protocolRef = middleware.$.usesProtocol.split("/@")
            // ["/","containsProtocol.1"]
            /*if (protocolRef.length > 0) {
                let index = 0;
                const auxList = protocolRef[1].split(".")
                // ["containsProtocol","1"]
                index = auxList[1]
                protocol = getLocalProtocol(globalConfig, index)
            }*/
            if (protocolRef.length > 0) {
                let indexEntity = 0;
                const entityAux= protocolRef[1].split(".")
                // ["containsProtocol","1"]
                indexEntity = entityAux[1]
                let indexProtocol = 0;
                const protocolAux = protocolRef[2].split(".")
                // ["containsProtocol","1"]
                indexProtocol = protocolAux[1]
                protocol = getLocalProtocol(globalConfig, indexEntity, indexProtocol)
            }
            const url = "http://" + network.$.networkAddress + ":" + protocol.port + "/" + service.$.endPoint+"/1"
            return url
        } else {
            return ""
        }
    } else {
        return "";
    }
}
