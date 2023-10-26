const bd = require('../../Datos/BD'); 
let localConfig = require('../../../modelos/modeloObjeto.json')
bd.connectDB();


async function getMethod(dbTable, tableref) {
    let query = "SELECT * FROM ";
    query += dbTable.$.name;
    let results;
    try {
        let refe=tableref.split("|");

        // Realizo la consulta a la tabla de referencia, si el modelo local coincide 
        if(localConfig[0]['xsi:type']+"|"+localConfig[0].id+"|"+localConfig[0].name===refe[0]+"|"+refe[1]+"|"+refe[2]){
            results = await bd.client.query(query);
        }
        else{
            // Procedimiento para conectarme a una base externa
            let client2;
            var uri = refe[3];                
            const { Client }=require("pg");
            
            client2 = new Client({connectionString: uri});
            try{   
               client2.connect(err => {
                    if (err) {
                        console.log('No Conectado');
                    } 
                }); 
            }catch(error){
                console.log('Error de conexion');
            }
            results = await client2.query(query);
            client2.end();
        }  
        return results.rows;
    } catch (err) {
        return err;
    }
};

// Función que simplifica el proceso de llamada a saveData, permitiendo que se use de manera más conveniente al esperar la resolución de la promesa utilizando await
async function postMethod(tableInfo, values, tableref) {
    return await saveData(tableInfo, values, tableref);   
};

// Funcion que genera un query para realizar la insercion de la informacion en la Base de Datos
saveData = async (tableInfo, value, tableref) => {
    let result;
    let query = "INSERT INTO ";
    query += tableInfo.$.name + " (";
    
    let params = "";
    let data = [];
   
    //console.log(tableInfo.composedOfDataColumn);

    tableInfo.composedOfDataColumn && tableInfo.composedOfDataColumn.length > 0 && tableInfo.composedOfDataColumn.map((column, i) => {
        query += column.$.name + ((tableInfo.composedOfDataColumn.length - 1 !== i) ? "," : ")");
        /* console.log(value[column.$.name]); */

        data.push(value[column.$.name]);
        params += "$" + (i + 1) + ((tableInfo.composedOfDataColumn.length - 1 !== i) ? "," : ")");
    });
    query += " VALUES (" + params + " RETURNING *";
    try {
        
        //crear conexiones
        let refe=tableref.split("|");
        if(localConfig[0]['xsi:type']+"|"+localConfig[0].id+"|"+localConfig[0].name===refe[0]+"|"+refe[1]+"|"+refe[2]){
            //console.log("usar db");
            console.log('\n\x1b[32m%s\x1b[0m', `Informacion ingresada en la tabla ${tableInfo.$.name}`);
            /* console.log(query,"\n",data); */
            result = await bd.client.query(
                query,
                data
            );
        }
        else{
            
            //conectar a externa solo Postgres
            let client2;
            var uri = refe[3];
            
            /*var tipo=uri.split(":")[0];
            switch(tipo){ */
                //case 'postgres':
                const { Client }=require("pg");
                client2 = new Client({connectionString: uri});
                try{   
                    client2.connect(err => {
                        if (err) {
                            console.log('No Conectado');
                        }  
                    }); 
                }catch(error){
                    console.log('Error GestorManipulacionBD');
                }
               /*  break;
            default:
                console.log("No se encontro una base de datos soportada");
            }  */
            console.log('\n\x1b[32m%s\x1b[0m', `Informacion ingresada en la tabla ${tableInfo.$.name}`);
            result = await client2.query(query,data); 
            client2.end();
        }
        //     
        return result.rows;
    } catch (err) {
        return err;
    }
};

// Funcion que genera un query de consulta, para obtener informacion de cada tabla de la Base de Datos
module.exports.getRegistrosBD = async (dbTable, tableref)  => {
    let query = "SELECT * FROM ";

    query += dbTable;
    let results;

    try {
        let refe=tableref.split("|");
        if(localConfig.$["xsi:type"]+"|"+localConfig.$.id+"|"+localConfig.$.name===refe[0]+"|"+refe[1]+"|"+refe[2]){
            
            console.log('\n\x1b[32m%s\x1b[0m', `Informacion obtenida de la tabla ${dbTable}...`);
            results = await conexion.query(query);
        }
        else{
            //conectar a externa
            console.log('\n\x1b[32m%s\x1b[0m', `Informacion obtenida de la tabla ${dbTable}...`);
            let client2;
            var uri = refe[3];
           /*  var tipo=uri.split(":")[0];
            switch(tipo){
                case 'postgres': */
                const { Client }=require("pg");
                client2 = new Client({connectionString: uri});
                try{   
                    client2.connect(err => {
                        if (err) {
                            console.log('No Conectado');
                        } 
                    }); 
                }
                catch(error){
                    console.log('No se pudo realizar la operacion');
                }
               /*  break;
            default:
                console.log("No se encontro una base de datos soportada");
            } */
            let results = await client2.query(query);
            client2.end();
        }  
        return results.rows;
        
    } catch (err) {
        return err;
    }
}

//codigo Alex ver como unir
const { Client } = require("pg");

//funcion para obtener la BD, tabla y columna relacionadas con cada proceso pre-reflexivo (metrica directa)
function mapearconexionBD(ruta, modelo) {
  const arregloconexiones = [];
  ruta =
    "ArchitectureSelfAwarenessIoT." +
    EjecutorTareasAutoconsciencia.transformaraRuta(ruta);
  // let rutabd = ruta.replace(/(@containsResource\.\d+).*/, "$1");
  let rutabd = ruta.match(/^(.*?containsResource\.\d+)/)[1];
  let rutatabla = ruta.match(/^(.*?containsDataTable\.\d+)/)[1];
  let rutacolumna = ruta.match(/^(.*?composedOfDataColumn\.\d+)/)[1];
  let conexionbd = EjecutorTareasAutoconsciencia.buscarValorConRuta(
    modelo,
    rutabd,
    "$"
  );
  
  let conexiontb = EjecutorTareasAutoconsciencia.buscarValorConRuta(
    modelo,
    rutatabla,
    "$"
  );
  let conexioncol = EjecutorTareasAutoconsciencia.buscarValorConRuta(
    modelo,
    rutacolumna,
    "$"
  );
  arregloconexiones.push(conexionbd);
  arregloconexiones.push(conexiontb);
  arregloconexiones.push(conexioncol);
  return arregloconexiones;
}

//funcion para obtener la metrica directa de la BDM
async function obtenerMetricaBDM(bd, tabla, columna) {
    const client = new Client({
      user: "postgres",
      host: "localhost",
    //   database: 'postgresqlcloud',
      database: bd,
      password: "postgres",
      port: 5432,
    });
    try {
      await client.connect();
      const consulta = 'SELECT '+columna+' FROM '+tabla+' ORDER BY fechahora DESC LIMIT 1;';
      const resultado = await client.query(consulta);
      // Verificar si se obtuvieron resultados
      if (resultado.rows.length > 0) {
        // Devolver solo el valor de la columna especificada
        return resultado.rows[0][columna];
      } else {
        return null; //devolver null si no hay resultados
      }
    } finally {
      await client.end(); // Cierra la conexión a la base de datos
    }
}

//funcion generica para guardar la metrica directa o indirecta y el indicador en la BDA
async function guardarenBDA(bd, pid, sid, sidname, oid, oidname, aid, aidname, mid, midname, valor, fecha, tipo, umbral, interpretacion, recomendacion, nombresimulacion, descripcionsimulacion, valorsimulacion, pidname){
    const client = new Client({
      user: "postgres",
      host: "localhost",
    //   database: 'postgresqlcloud',
      database: bd,
      password: "postgres",
      port: 5432,
    });
    try {
      await client.connect();
      let consulta = "";
      //verificar si vienen valores de simulacion, en ese caso el sql toma todos las columnas 
      if(nombresimulacion !== "" && descripcionsimulacion !== "" && valorsimulacion !== ""){
        consulta = "INSERT INTO metricas (pid, sid, sidname, oid, oidname, aid, aidname, mid, midname, valor, fecha, tipo, umbral, interpretacion, recomendacion, nombresimulacion, descripcionsimulacion, valorsimulacion, pidname)" +
        "VALUES ("+pid+","+sid+",'"+sidname+"',"+oid+",'"+oidname+"',"+aid+",'"+aidname+"',"+mid+",'"+midname+"',"+valor+", current_timestamp,'"+tipo+"','"+(umbral ?? '')+"','"+(interpretacion ?? '')+"','"+(recomendacion ?? '')+"','"+nombresimulacion+"','"+descripcionsimulacion+"',"+valorsimulacion+",'"+pidname+"');";
      }else{ //caso contrario se esta guardado una metrica directa o indirecta
        consulta = "INSERT INTO metricas (pid, sid, sidname, oid, oidname, aid, aidname, mid, midname, valor, fecha, tipo, umbral, interpretacion, recomendacion,pidname)" +
        " VALUES ("+pid+","+sid+",'"+sidname+"',"+oid+",'"+oidname+"',"+aid+",'"+aidname+"',"+mid+",'"+midname+"',"+valor+", current_timestamp,'"+tipo+"','"+(umbral ?? '')+"','"+(interpretacion ?? '')+"','"+(recomendacion ?? '')+"','"+pidname+"');";
        //let sql = "INSERT INTO metricas (pid, sid, sidname, oid, oidname, aid, aidname, mid, midname, valor, fecha, tipo, umbral, interpretacion, recomendacion,pidname) VALUES ("+pid+","+sid+",'"+sidName+"',"+oid+",'"+oidName+"',"+aid+",'"+aidName+"',"+mid+",'"+midName+"',"+valor+", current_timestamp,'"+tipo+"','"+(nombre ?? '')+"','"+(interpret ?? '')+"','"+(recomendacion ?? '')+"','"+pidName+"');";
      }
      const resultado = await client.query(consulta);
      return resultado.rowCount;
    }catch(error){
      console.log("Error al insertar en la tabla metricas", error);
    }
      finally {
      await client.end(); // Cierra la conexión a la base de datos
    }
  
}

//funcion para obtener la metricaDirecta de la BDA de manera Historica de acuerdo a fechas
async function obtenerMetricaHistoricaBDA(bd, metricaid, rango){ //ver si conexion utilizo una declarada global o asi esta bien
    //agregar tambien la conexion o client como parametro
    const client = new Client({
      user: "postgres",
      host: "localhost",
      database: bd, 
      password: "postgres",
      port: 5432,
    });
    try {
      await client.connect();
      let consulta;
      let results;
      if (rango[0] && rango[1]) {
        consulta = "SELECT valor FROM metricas WHERE mid="+metricaid+"AND fecha BETWEEN'"+rango[0] +"'and'"+rango[1]+"';";
      } else if (rango[0]) {
        consulta = "SELECT valor FROM metricas WHERE mid =" +metricaid+"AND fecha >= '"+rango[0]+"';";
      } else {
        consulta = "SELECT valor FROM metricas WHERE mid = " +metricaid+" AND fecha <= '"+rango[1]+"';";
      }
      //console.log("sql ejecutado es: ", consulta);
      results = await client.query({
        rowMode: "array",
        text: consulta,
      });
      return results.rows;
    } finally {
      await client.end(); // Cierra la conexión a la base de datos
    }
  }

  async function obtenerDatosHistoricosBDM(bd, columna, tabla, rango){
    const client = new Client({
      user: "postgres",
      host: "localhost",
      database: bd, // aqui debe ir el parametro bd
      password: "postgres",
      port: 5432,
    });
    try{
      await client.connect();
      let consulta;
      let results;
      if (rango[0] && rango[1]) {
        consulta = "SELECT " + columna + " FROM " + tabla + " WHERE fechahora BETWEEN '" + rango[0] + "' and '" + rango[1] + "' ORDER BY fechahora ASC;";
      } else if (rango[0]) {
        consulta = "SELECT " + columna + " FROM " + tabla + " WHERE fechahora >= '" + rango[0] + "' ORDER BY fechahora ASC;";
      } else {
        consulta = "SELECT " + columna + " FROM " + tabla +  " WHERE fechahora <= '" + rango[1] + "' ORDER BY fechahora ASC;";
      }
      results = await client.query({
        rowMode: "array",
        text: consulta,
      });
      return results.rows
    }catch(error){
      console.log("Error al recuperar datos historicos de BDM ", error);
    }finally{
      await client.end();
    }
}


module.exports = {
    mapearconexionBD,
    obtenerMetricaBDM,
    guardarenBDA,
    obtenerDatosHistoricosBDM,
    obtenerMetricaHistoricaBDA,
    getMethod,
    postMethod
};
