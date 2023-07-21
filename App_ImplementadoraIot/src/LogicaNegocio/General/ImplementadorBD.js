let modelo = require('../../../modelos/modeloObjeto.json')
let dataStore, network;

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


if (network && dataStore){
    const dbname = dataStore.name; // nombre de la base de datos
    const user = dataStore.user ? dataStore.user : "user"; 
    const password = dataStore.password ? dataStore.password : "****";
    const host = network.networkAddress;

    // Mientras no corresponda a la IP del modelo, mando quemado la ip y clave
    //var uri = dataStore.uri ? dataStore.$.uri : name + "://" + user + ":" + password + "@" + host + ":" + port + "/" + dbname;
    var uri = "postgres://postgres:postgres@localhost:5432/postgresqlcloud"

    // Creo una instancia de POSTGRES
    const { Client } = require('pg');

    // Creo un nuevo client para realizar la conexion a la BD
    client = new Client({ connectionString: uri });
    try{
        client.connect(err=>{
            if(err){
                console.log('Error de conexion');
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

                // Creo de nuevo un client
                client = new Client({ connectionString: uri });
                client.connect(err => {
                    if(err){
                        console.error('No mismo existe', err.stack);
                    }else{
                        console.log('Conectado...');
                        // Creo la BD
                        client.query('CREATE DATABASE '+x[x.length-1], (err, res) =>{
                            if(err) throw err;
                            client.end(); // finalizo conexion
                            uri = uri + "/" + x[x.length-1]
                            // Nueva conexion con la nueva URI modificada
                            client = new Client({ connectionString: uri });
                            client.connect(err => {
                                if(err){
                                    console.log('No se pudo conectar: ', err.stack);
                                }else{
                                    console.log('Conexion exitosa: ', uri);
                                    // Creamos las tablas
                                    dataStore.containsDataTable.forEach(tabla => {
                                        client.query(crearTbPostgres(tabla), err, res =>{
                                            if(err){
                                                throw err;
                                            }else{
                                                console.log("Tablas creadas...");

                                            }
                                        })
                                    })

                                }
                            })
                        })
                    }
                })
                
            }else{
                console.log('Conectado a la primera...');
                
                client.end();
            }
        })
    }catch(error){
        console.log('No se conecto...');
    }

}

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

/* console.log(uri); */

/* const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'admin',
  port: 5432, // Puerto por defecto de PostgreSQL
}); */

// Conectarse a la base de datos
/* client.connect()
  .then(() => {
    console.log('Conexión exitosa a la base de datos');

    // Ejecutar una consulta
    client.query('SELECT * FROM personas')
      .then(result => {
        // Manipular los datos obtenidos
        const rows = result.rows;
        console.log(rows); // Mostrar los datos en la consola

        // Realizar otras operaciones con los datos obtenidos
        // ...
      })
      .catch(err => console.error('Error al ejecutar la consulta', err))
      .finally(() => {
        // Cerrar la conexión cuando ya no sea necesaria
        client.end()
          .then(() => console.log('Conexión cerrada correctamente'))
          .catch(err => console.error('Error al cerrar la conexión', err));
      });
  })
  .catch(err => console.error('Error al conectar a la base de datos', err)); */

/*try {
    client.connect(err => {
        if (err) {
            console.error('Error de conexion: ', err.stack);
            let x = uri.split("/");
            uri = "";
            for (var i = 0; i < x.length - 1; i++) {
                if (i === 0) {
                    uri = uri + x[i];
                }
                else {
                    uri = uri + "/" + x[i];
                }
            }
            client = new Client({ connectionString: uri });
            client.connect(err => {
                if (err) {
                    console.error('No mismo existe', err.stack);
                }
                else {
                    console.log('Conectado');
                    client.query('CREATE DATABASE ' + x[x.length - 1], (err, res) => {
                        if (err) throw err;
                        console.log(res);
                        uri = uri + "/" + x[x.length - 1];
                        client.end();
                        client = new Client({ connectionString: uri });
                        client.connect(err => {
                            if (err) {
                                console.error('pendejo', err.stack);
                            } else {
                                console.log('si funco: ' + uri);
                                //crear tablas
                                dataStore.containsDataTable.forEach(tabla => {
                                    client.query(base.crearTbPostgres(tabla), (err, res) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            console.log("tablas creada");
                                            fs.writeFile('./baseAnterior/basean.json', JSON.stringify(dataStore), 'utf8', (err) => { });
                                        }
                                    });
                                });
                            }
                        });
                    });
                }
            });
        }
        else {
            console.log('Conectado');
            //crear tablas
            let bandera = 0;

            try {
                fs.lstatSync('./baseAnterior/basean.json').isFile();
                const xml = fs.readFileSync('baseAnterior/basean.json', 'utf8');
                if (JSON.stringify(dataStore) === xml) {
                    bandera = 1;
                }
            } catch (error) {
                bandera = 2
            }

            //OBTENER BASE DE DATOS VIEJA


            if (bandera == 2) {
                fs.writeFile('./baseAnterior/basean.json', JSON.stringify(dataStore), 'utf8', (err) => { console.log(err) });
                base.respaldarBdPostgres(uri);
                let cs = fs.readFileSync('baseAnterior/base.sql', 'utf8').toString();
                let destino = "http://localhost:9912/FF";//deberia sacarse del modelo
                let nombres = "_postgress_" + uri.split("/")[uri.split("/").length - 1];
                base.enviarArchivo(destino, cs, nombres);
                dataStore.containsDataTable.forEach(tabla => {
                    client.query("drop table if exists " + tabla.$.name, (err, res) => {
                        if (err) {
                            console.log("err: ", err);
                            console.log("res: ", res);
                            throw err;
                        }
                        else {
                            console.log("tablas borrada: " + tabla.$.name);
                            client.query(base.crearTbPostgres(tabla), (err, res) => {
                                if (err) {
                                    throw err;
                                }
                                else {
                                    console.log("tablas creada: " + tabla.$.name);
                                }
                            });
                        }
                    });
                });
            }

            if (bandera === 0) {
                console.log("entraaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
                let cs = fs.readFileSync('baseAnterior/basean.json', 'utf8');
                let oldBase = JSON.parse(cs);
                console.log("dataStore:", dataStore);
                fs.writeFile('./baseAnterior/basean.json', JSON.stringify(dataStore), 'utf8', (err) => { });
                base.respaldarBdPostgres(uri);
                let sqlAux = fs.readFileSync('baseAnterior/base.sql').toString();
                let destino = "http://localhost:9912/FF";//deberia sacarse del modelo
                let nombres = "_postgress_" + uri.split("/")[uri.split("/").length - 1];
                base.enviarArchivo(destino, sqlAux, nombres);

                let aleteredTables = [];


                ///Obtener eliminación de campos
                for (let i = 0; i < oldBase.containsDataTable.length; i++) {
                    let oldTable = oldBase.containsDataTable[i].$.name;;
                    let tableFlag = true;
                    for (let j = 0; j < dataStore.containsDataTable.length; j++) {
                        let newTableName = dataStore.containsDataTable[j].$.name;

                        if (newTableName == oldTable) {
                            tableFlag = false;
                            for (let m = 0; m < oldBase.containsDataTable[i].composedOfDataColumn.length; m++) {
                                let columnFlag = true;
                                let oldColumn = oldBase.containsDataTable[i].composedOfDataColumn[m].$.name

                                for (let n = 0; n < dataStore.containsDataTable[j].composedOfDataColumn.length; n++) {
                                    let newColumn = dataStore.containsDataTable[j].composedOfDataColumn[n].$.name

                                    if (oldColumn == newColumn) {
                                        columnFlag = false;
                                    }
                                }

                                if (columnFlag) {
                                    aleteredTables.push(newTableName);
                                    console.log("Se borra la tabla 1q: " + "drop table " + oldTable)
                                    client.query("drop table if exists " + oldTable, (err, res) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            console.log("tablas borrada: " + oldTable);
                                            client.query(base.crearTbPostgres(dataStore.containsDataTable[j]), (err, res) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    console.log("tabla creada: " + oldTable);
                                                }
                                            });

                                        }
                                    });
                                }

                            }
                        }
                    }

                    if (tableFlag) {
                        console.log("cayo");
                        console.log("Se borra la tabla: " + "drop table " + oldTable)
                        client.query("drop table if exists " + oldTable, (err, res) => {
                            if (err) {
                                console.log("pendejada");
                                throw err;
                            }
                            else {
                                console.log("tablas borrada: " + oldTable);
                            }
                        });
                    }
                }

                ///Obtener alteración a campos
                ///Obtener agregación de campos
                for (let i = 0; i < dataStore.containsDataTable.length; i++) {
                    let newTable = dataStore.containsDataTable[i].$.name;
                    let tableFlag = true;
                    for (let j = 0; j < oldBase.containsDataTable.length; j++) {
                        let oldTable = oldBase.containsDataTable[j].$.name;
                        let alteredTableFlag = true;

                        for (let k = 0; k < aleteredTables.length; k++) {
                            if (newTable == aleteredTables[k]) {
                                alteredTableFlag = false;
                            }
                        }

                        if (newTable == oldTable && alteredTableFlag) {
                            tableFlag = false;
                            for (let m = 0; m < dataStore.containsDataTable[i].composedOfDataColumn.length; m++) {
                                let columnFlag = true;
                                let newColumn = dataStore.containsDataTable[i].composedOfDataColumn[m].$.name

                                for (let n = 0; n < oldBase.containsDataTable[j].composedOfDataColumn.length; n++) {
                                    let oldColumn = oldBase.containsDataTable[i].composedOfDataColumn[n].$.name

                                    if (oldColumn == newColumn) {
                                        columnFlag = false;
                                        if (oldBase.containsDataTable[i].composedOfDataColumn[n].$.dataType != dataStore.containsDataTable[i].composedOfDataColumn[m].$.dataType) {
                                            let type = base.correctorDataType(dataStore.containsDataTable[i].composedOfDataColumn[m].$.dataType);
                                            console.log("Cambio de tipo de dato de columna: " + "alter table " + newTable + " alter column " + newColumn + " type " + type[0] + " " + type[1]);
                                            client.query("alter table " + newTable + " alter column " + newColumn + " type " + type[0] + " " + type[1], (err, res) => {
                                                if (err) {
                                                    console.log("eliminar tabla: " + "drop table if exists " + newTable);
                                                    client.query("drop table if exists " + newTable, (err, res) => {
                                                        if (err) {
                                                            throw err;
                                                        }
                                                        else {
                                                            console.log("tabla borrada: " + base.crearTbPostgres(dataStore.containsDataTable[i]));
                                                            client.query(base.crearTbPostgres(dataStore.containsDataTable[i]), (err, res) => {
                                                                if (err) {
                                                                    throw err;
                                                                }
                                                                else {
                                                                    console.log("tabla creada ff: " + newTable);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                                else {
                                                    console.log("tabla alterada: " + newTable);
                                                    console.log("columna alterada: " + newColumn);
                                                    console.log("tipo alterado: " + type[0] + " " + type[1]);
                                                }
                                            });
                                        }
                                    }
                                }

                                if (columnFlag) {
                                    let type = base.correctorDataType(dataStore.containsDataTable[i].composedOfDataColumn[m].$.dataType);
                                    console.log("Agregar columna: " + "alter table " + newTable + " add column " + newColumn + " " + type[0] + " " + type[1]);
                                    client.query("alter table " + newTable + " add column " + newColumn + " " + type[0] + " " + type[1], (err, res) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            console.log("tabla alterada: " + newTable);
                                            console.log("columna creada: " + newColumn);
                                        }
                                    });
                                    break;
                                }

                            }
                        }
                    }


                    if (tableFlag) {
                        console.log("Crear la tabla: " + base.crearTbPostgres(dataStore.containsDataTable[i]));
                        client.query(base.crearTbPostgres(dataStore.containsDataTable[i]), (err, res) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                console.log("tablas creada: " + newTable);
                            }
                        });
                    }
                }

                //OBTENER BASE DE DATOS VIEJA

            }
        }
    }); 
}
catch (error) {
    console.log('nel');
}*/