let modelo = require('./modelos/modeloObjeto.json')
let globalConfig = require('./modelos/modeloJSON.json')
let dataStore, network;
let client;

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

// Recorro el modelo creado, obteniendo los datos de la Base de Datos y de la Red
modelo.forEach(resource => {
    resource.containsResource.forEach(properties => {
        if (properties['xsi:type'] === 'MonitorIoT:DataBase') {
            dataStore = properties;
        } else if (properties["xsi:type"] === "MonitorIoT:NetworkInterface") {
            network = properties;
        }
    })
});

// En caso de existir datos para crear las Bases de Datos y Tablas
if (network && dataStore){
    // Obtengo el link de conexion 
    var uri = getlinkDataBase(network, dataStore);
    // Creo una instancia de POSTGRES
    const { Client } = require('pg');
    // Creo un nuevo client para realizar la conexion a la BD
    client = new Client({ connectionString: uri });

    try{
        client.connect(err=>{
            if(err){
                // En caso de tener algun error, modifico la URI ya sea por problemas de Sintaxis
                let x = uri.split("/");
                uri = "";
                for (var i = 0; i < x.length - 1; i++) {
                    if (i === 0) {
                        uri = uri + x[i];
                    } else {
                        uri = uri + "/" + x[i];
                    }
                }
                
                // Creo un nuevo cliente con la nueva uri
                client = new Client({ connectionString: uri });
                client.connect(err => {
                    if(err){
                        console.error('No mismo existe', err.stack);
                    }else{
                        // Creo una nueva base de datos
                        console.log('\n\x1b[32m%s\x1b[0m', 'Implementando la estructura de las bases de datos que almacenan los datos de monitoreo');
                        console.log('\n\x1b[32m%s\x1b[0m', `Base de datos ${x[x.length-1]} implementada (ok)`);
                        client.query('CREATE DATABASE '+x[x.length-1], (err, res) =>{
                            if(err) throw err;
                            // finalizo conexion
                            client.end(); 
                            uri = uri + "/" + x[x.length-1]
                            // Nueva conexion con la nueva URI modificada
                            client = new Client({ connectionString: uri });
                            client.connect(err => {
                                if(err){
                                    console.log('No se pudo conectar: ', err.stack);
                                }else{
                                    // Creamos las tablas
                                    dataStore.containsDataTable.forEach(async tabla => {
                                        await client.query(crearTbPostgres(tabla), err, res =>{
                                            if(err){
                                                throw err;
                                            }else{
                                                let nombreTabla = tabla.name
                                                console.log('\n\x1b[32m%s\x1b[0m', `Tabla ${nombreTabla} implementada (ok)`);
                                            }
                                        })
                                    })
                                }
                            })
                        })
                        
                    }
                })
            }else{
                console.log('\n\x1b[32m%s\x1b[0m', 'Implementando la estructura de las bases de datos que almacenan los datos de monitoreo');
                client.end();
            }
        })
    }catch(error){
        console.log('No se conecto...');
    }
}


// Funcion para crear las tablas correspondientes a las Bases de Datos
function crearTbPostgres(tabla){
    var nombre = tabla.name;    
    var consulta = "CREATE TABLE IF NOT EXISTS " + tabla.name + "(\n";
    consulta += "id serial PRIMARY KEY";

    tabla.composedOfDataColumn.forEach(column => {
        var tipodato;
        var longitud;
        switch(column.dataType){
            case "Byte":
                tipodato="bytea";
                longitud="";
                break;
            case "Integer":
                tipodato="Integer";
                longitud="";
                break;
            case "Long":
                tipodato="bigint";
                longitud="";
                break;
            case "Float":
                tipodato="real";
                longitud="";
                break;
            case "Double":
                tipodato="double precision";
                longitud="";
                break;
            case "String":
                tipodato="varchar";
                longitud="(250)";
                break;
            case "Date":
                tipodato="timestamp";
                longitud="";
                break;
            case "Boolean":
                tipodato="boolean";
                longitud="";
                break;                  
        }
        consulta += ",\n"+column.name+" "+tipodato+" "+longitud+" NOT NULL";
    });
    consulta+=");";
    return consulta;
};


// para que se usa esto
/* "containsProtocol": [
                    {
                        "$": {
                            "isUsedByMiddleware": "//@containsEntity.1/@containsComputingNode.0/@containsResource.2",
                            "id": "28",
                            "name": "MQTT",
                            "port": "1883"
                        }
                    }
                ] */
//const uri = dataStore.uri ? dataStore.uri : name + "://" + user + ":" + password + "@" + host + ":" + port + "/" + dbname;
//const uri = dataStore.uri ? dataStore.uri : "MQTT" + "://" + user + ":" + password + "@" + host + ":" + 1883 + "/" + dbname;

