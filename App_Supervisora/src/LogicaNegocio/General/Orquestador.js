const request = require("request");
let planificador = require('./PlanificadorTareas')
let json = planificador.mod_json

url = "http://localhost:3000/"

// for para recorrer todos los tipos de 
// obtener cada nodo para tener la ip el puerto
// 

// Metodo para enviar la informacion
/* funcion para el request */
/* 3 for  */
request({
    method: 'POST',
    url: url, /* se reemplaza la url obtenida de network interface */
    json: true,   
    body: json /* envio todo el json */
    /* parametro para ejecutar */

},(error, response, body)=>{
    if(!error && response.statusCode == 200){
        console.log(body);
    }else{
        console.log(error);
    }
});