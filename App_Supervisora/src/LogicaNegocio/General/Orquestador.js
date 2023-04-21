const request = require("request");
let planificador = require('./PlanificadorTareas')
let json = planificador.mod_json

url = "http://localhost:3000/"

// enviar la informacion
// Metodo para enviar la informacion
request({
    method: 'POST',
    url: url, 
    json: true,   
    body: json

},(error, response, body)=>{
    if(!error && response.statusCode == 200){
        console.log(body);
    }else{
        console.log(error);
    }
});