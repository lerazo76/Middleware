let modelo = require('../../modelos/modeloObjeto.json');
let globalConfig = require('../../modelos/modeloJSON.json');

// Funcion para obtener los datos de la Base de Datos y de la Red
function obtenerDatosRedBd(modelo){
    let datosRedBd;
    let dataStore;
    modelo.forEach(resource => {
        resource.containsResource.forEach(properties => {
            if (properties['xsi:type'] === 'MonitorIoT:DataBase') {
                dataStore = properties;
            } else if (properties["xsi:type"] === "MonitorIoT:NetworkInterface") {
                network = properties;
            }
        })
    });
    datosRedBd = {
        dataStore: dataStore,
        network: network
    }
    return datosRedBd;
}

// Funcion para obtener los protocolos de la Base de Datos para poder realizar la conexion
function getLocalProtocol (globalConfig, index){
    const netList1 = globalConfig["ArchitectureSelfAwarenessIoT"].containsEntity[index[1].split(".")[1]];
    const protocol = netList1.containsProtocol[index[2].split(".")[1]];
    if (protocol) {
        return {
            port: protocol.$.port,
            name: protocol.$.name
        };
    } else {
      return "";
    }
};

// Funcion para obtener el link de enlace de conexion a la base de datos 
function getlinkDataBase(network, dataStore){
    if(dataStore){
        const dbname = dataStore.name;
        const user = dataStore.user ? dataStore.user : "user";
        const password = dataStore.password ? dataStore.password : "****";
        const host = network.networkAddress;
        const {port,name} = getLocalProtocol(globalConfig, dataStore.usesProtocol.split("/@"));
        //return dataStore.uri ? dataStore.uri : name + "://" + user + ":" + password + "@" + host + ":" + port + "/" + dbname;
        return "postgres://postgres:postgres@localhost:5432/postgresqllocal";
    }
}

// Llamo a la funcion obtenerDatos para obtener el link de la conexion a la BD 
let datos = obtenerDatosRedBd(modelo);
var uri = getlinkDataBase(datos.network, datos.dataStore);

const { Client } = require('pg');

const client = new Client({connectionString: uri});

async function connectDB() {
    try {
        await client.connect();
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
}

module.exports = {
    connectDB,
    client,// Exportamos la instancia del cliente para usarla en otros módulos
    getTableInfo,
    getTablenodo,
    getReferencestrace,
    getApis
};

// Funcion para obtener informacion del link a la tabla que se va a conectar
function getTableInfo(globalConfig, index){
    const link = globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[index];
    let auxObjRef;
    if (link.$.linksDataTable){
        const refList = link.$.linksDataTable.split("/@");
        auxObjRef = globalConfig["ArchitectureSelfAwarenessIoT"];
        for (let i = 1; i < refList.length; i++) {
            let str = refList[i];
            auxObjRef = auxObjRef[str.split(".")[0]][str.split(".")[1]];
        }
    }
    return auxObjRef;
};

function getApis(globalConfig, index){
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
 

// Funcion para obtener el nodo de la tabla
function getTablenodo(globalConfig, index){
    let link,refList;
    if(!isNaN(index-0)){
        link = globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[index];
        if(link.$.linksDataTable){
            refList = link.$.linksDataTable.split("/@");
        }
    }
    else{
        refList = index.split("/@");
    }

    let auxObjRef = globalConfig["ArchitectureSelfAwarenessIoT"];

    if(refList){
        for (let i = 1; i < refList.length; i++) {
            let str = refList[i];
            auxObjRef = auxObjRef[str.split(".")[0]][str.split(".")[1]];
            
            if (auxObjRef.$["xsi:type"] === "MonitorIoT:CloudNode" || auxObjRef.$["xsi:type"] === "MonitorIoT:FogNode" || auxObjRef.$["xsi:type"] === "MonitorIoT:IoTGateway"){
                var uri;
                let network;
                let dataStore;
                auxObjRef.containsResource.forEach(resource => {
                    //console.log('aaa');
                    if (resource.$["xsi:type"] === "MonitorIoT:NetworkInterface") {
                        network = resource;
                    } else if (resource.$["xsi:type"] === "MonitorIoT:DataBase") {
                        dataStore = resource;
                    }
                });
                uri = getURIDataBase(network, dataStore);
                // Eliminar la linea cuando suba a dockers OJOOOOOOO
                uri = "postgres://postgres:postgres@localhost:5432/postgresqllocal";
                return auxObjRef.$["xsi:type"]+"|"+auxObjRef.$.id+"|"+auxObjRef.$.name+"|"+uri;
            }
        }
    }
    return null;
};

var getURIDataBase = exports.getURIDataBase = function (network, dataStore){
    
    if (dataStore) {
        const dbname = dataStore.$.name;
        const user = dataStore.$.user ? dataStore.$.user : "user";
        const password = dataStore.$.password ? dataStore.$.password : "****";
        const host = network.$.networkAddress;
        const {port,name} = getLocalProtocol(globalConfig, dataStore.$.usesProtocol.split("/@"));
        return dataStore.$.uri ? dataStore.$.uri : name + "://" + user + ":" + password + "@" + host + ":" + port + "/" + dbname;
  }
};

function getReferencestrace(globalConfig,ruta){
    const references = [];
    let refList = [];
    refList=ruta.split("/@");
    let auxObjRef = globalConfig["ArchitectureSelfAwarenessIoT"];
    for (let i = 1; i < refList.length; i++) {
        let str = refList[i];
        auxObjRef = auxObjRef[str.split(".")[0]][str.split(".")[1]];
        references.push(auxObjRef);
    }
    return references;    
};