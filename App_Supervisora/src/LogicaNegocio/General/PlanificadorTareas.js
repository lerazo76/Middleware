/* Este componente se encarga de comparar la nueva version detectada del modelo
    arquitectura de monitoreo cn la configuracion de monitoreo en ejecucion 
    del sistema IoT
*/

const fs = require('fs');
let json = JSON.parse(fs.readFileSync('./modelos/modeloCO.json', 'utf8')); /* method to read the json  */
const request = require("request");

url = "http://localhost:3000/"

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

module.exports = json{
    json
}

/* 

const firstKey = Object.keys(json);
const contenido = Object.keys(json[firstKey]); 
let sujeto = '';
contenido.shift();
let ar_nodos = [];

add_json_array(contenido, ar_nodos, json);
read_property_element(ar_nodos);


function add_json_array(cont_json, array, json){
    cont_json.forEach(element => {
        array.push(getNodes(json, element));
    });
}
// function to return the elements of a json 
function getNodes(json, array){
    var boxes = Object.keys(json).map(key => json[key]);
    return boxes[0][array][0];
}
// function to read array elements 
function read_array(array){
    array.forEach(element=>{
        console.log(element);
    })    
}
// function to read monitoring properties 
function read_property_element(array){
    array.forEach(element =>{
        if(element['$']['xsi:type']){
            console.log(element['$']['xsi:type']);
        }
    })
} */