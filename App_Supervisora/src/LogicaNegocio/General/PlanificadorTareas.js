/* Este componente se encarga de comparar la nueva version detectada del modelo
    arquitectura de monitoreo con la configuracion de monitoreo en ejecucion 
    del sistema IoT
*/

const fs = require('fs'); 
let StartApp = require('../../../StartApp')
let filePath = StartApp.filePath
let json = JSON.parse(fs.readFileSync(filePath+'/modeloCO.json', 'utf8'));

/* CONVERTIR EL JSON EN UN ARREGLO DE OBJETOS 
   3 OBJETOS
    1. NODO CLOUD
    2. NODO F
    3. NODO IOT */

/* colocar aqui el codigo de alex */

/* lee el archivo llama a la funcion
convierte el json en objeto */

module.exports = {
    json: json
}

orquestador();

function orquestador(){
    require('./Orquestador');
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