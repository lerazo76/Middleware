const bd = require('../../Datos/BD'); 
let localConfig = require('../../../modelos/modeloObjeto.json')
bd.connectDB();


module.exports.getMethod = async (dbTable, tableref) => {
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
            console.log(uri);
            client2 = new Client({connectionString: uri});
            try{   
               client2.connect(err => {
                    if (err) {
                        console.log('No Conectado');
                    } else {
                        console.log('Conectado');
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
module.exports.postMethod = async (tableInfo, values, tableref) => {
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
            console.log("usar db");
            /* console.log(query,"\n",data); */
            result = await bd.client.query(
                query,
                data
            );
        }
        else{
            
            //conectar a externa
            let client2;
            var uri = refe[3];
            var tipo=uri.split(":")[0];
            switch(tipo){
                case 'postgres':
                const { Client }=require("pg");
                console.log(uri);
                client2 = new Client({connectionString: uri});
                try{   
                    client2.connect(err => {
                        if (err) {
                            console.log('No Conectado');
                        }    
                        else {
                            console.log('Conectado');
                        }
                    }); 
                }catch(error){
                    console.log('nel');
                }
                break;
            default:
                console.log("No se encontro una base de datos soportada");
            } 
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
            console.log("usar db");
            results = await conexion.query(query);
        }
        else{
            //conectar a externa
            let client2;
            var uri = refe[3];
            var tipo=uri.split(":")[0];
            switch(tipo){
                case 'postgres':
                const { Client }=require("pg");
                console.log(uri);
                client2 = new Client({connectionString: uri});
                try{   
                    client2.connect(err => {
                        if (err) {
                            console.log('No Conectado');
                        } 
                        else {
                            console.log('Conectado');
                        }
                    }); 
                }
                catch(error){
                    console.log('nel');
                }
                break;
            default:
                console.log("No se encontro una base de datos soportada");
            }
            let results = await client2.query(query);
            client2.end();
        }  
        return results.rows;
        
    } catch (err) {
        return err;
    }
}

