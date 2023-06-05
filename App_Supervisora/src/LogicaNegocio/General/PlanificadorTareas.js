/* Este componente se encarga de comparar la nueva version detectada del modelo
    arquitectura de monitoreo con la configuracion de monitoreo en ejecucion 
    del sistema IoT
*/

const fs = require("fs");
const request = require("request");
let StartApp = require("../../../StartApp");
let filePath = StartApp.filePath;
let tipoEjecucion = StartApp.tipoEjecucion;
let json = JSON.parse(fs.readFileSync("./modelos/modeloCO.json", "utf8"));

/*CODIGO ALEX, FUNCION PARA BUSCAR EN EL JSON LOS NODOS Y CONVERTIRLOS A ARREGLOS DE OBJETOS INCLUYENDO EL NUMERO DE NIVELES DESEADO */

/* fs.readFile("./modelos/modeloCO.json", "utf-8", (error, data) => {
  //LECTURA DEL JSON, BRANDON CREO QUE ESTO NO IRIA ME AVISAS
  if (error) {
    console.log("error");
  } else {
    data = JSON.parse(data);
    const arregloNodos = [];
    const nodosCloud = buscarValor(data, "MonitorIoT:CloudNode", 4);
    const nodosFog = buscarValor(data, "MonitorIoT:FogNode", 4);
    const nodosIotGateway = buscarValor(data, "MonitorIoT:IoTGateway", 4);
    arregloNodos.push(nodosCloud);
    arregloNodos.push(nodosFog);
    arregloNodos.push(nodosIotGateway);

    console.log(arregloNodos);
    // console.log(JSON.stringify(nodosCloud, null, 2));
  }
}); */

function buscarValor(objeto, parametro, nivel) {
  const resultados = [];
  const arrayformat = [];
  const pila = [{ objeto, objetoPadre: null, keyPadre: null }];
  while (pila.length > 0) {
    const { objeto: obj, objetoPadre, keyPadre } = pila.pop();
    for (const key in obj) {
      if (obj[key] === parametro) {
        const resultado = {
          // tipo: obj[key],
          objetoPadre: Object.assign({}, objetoPadre, { [keyPadre]: obj }),
        };
        resultados.push(resultado);
      } else if (typeof obj[key] === "object") {
        pila.push({ objeto: obj[key], objetoPadre: obj, keyPadre: key });
      }
    }
  }
  for (let i = 0; i < resultados.length; i++) {
    //recorrer el arreglo resultados si se encontro mas de una coincidencia del parametro y trabajar con cada una
    objetoPadreActual = resultados[i].objetoPadre; //obtener la instancia de objeto padre
    //Separar objetoPadreActual en el numero de niveles indicado
    let objNivelesEstruct = estructurarObj(objetoPadreActual, nivel);
    arrayformat.push(objNivelesEstruct);
  }
  return arrayformat;
}

function estructurarObj(obj, nivelMax = Infinity) {
  function descomponer(obj, nivel = 1, clavePadre = "") {
    if (nivel > nivelMax) {
      return obj;
    }
    const atributos = obj["$"]; //obtener los atributos del objeto actual
    const clavesAnidadas = Object.keys(obj).filter((clave) => clave !== "$"); //obtener las subclaves excepto $
    const objetoAplanado = { ...atributos }; //instancia de objeto aplanado
    if (nivel < nivelMax && clavesAnidadas.length > 0) {
      //verificar el nivel y la existencia de claves anidadas
      for (const clave of clavesAnidadas) {
        //recorrer claves anidadas
        if (Array.isArray(obj[clave])) {
          //si clave es un array llamar recursivamente a descomponer
          objetoAplanado[clave] = []; //array que tendra los resultados de descomponer cada elemento del array
          obj[clave].forEach((item, indice) => {
            const objetoAnidado = descomponer(
              item,
              nivel + 1,
              `${clavePadre}.${clave}[${indice}]` //se actualiza la clave del nivel superior para que se refleje la jerarquia de niveles
            );
            objetoAplanado[clave].push(objetoAnidado); //se agrega los resultados al objeto vacio inicializado anteriormente
          });
        } else {
          //si no es un array
          const objetoAnidado = descomponer(
            //se llama a la función descomponer para el objeto anidado
            obj[clave],
            nivel + 1, //se incrementa el nivel
            `${clavePadre}.${clave}` //se actualiza la clave del nivel superior para que se refleje la jerarquia de niveles
          );
          objetoAplanado[clave] = objetoAnidado; // se agrega los resultados a objetoAplanado
        }
      }
    }
    return objetoAplanado;
  }
  return descomponer(obj);
}

/* FIN CODIGO ALEX, FUNCION PARA BUSCAR EN EL JSON LOS NODOS Y CONVERTIRLOS A ARREGLOS DE OBJETOS INCLUYENDO EL NUMERO DE NIVELES DESEADO */

/* CONVERTIR EL JSON EN UN ARREGLO DE OBJETOS */
/* 3 OBJETOS
    1. NODO CLOUD
    2. NODO F
    3. NODO IOT */

/*fs.readFile(filePath+"/modeloCO.json", "utf-8", (error, data) => { //lectura del json 
    if (error) {
      console.log("error");
    } else {
      data = JSON.parse(data);
      const nodosAPI = buscarValor(data, "MonitorIoT:API");
      const nodosDB = buscarValor(data, "MonitorIoT:DataBase");
      const nodosNI = buscarValor(data,"MonitorIoT:NetworkInterface")
    }
  });*/
  
//Funcion para buscar en el json el parametro que se envie (API's, BD's, BROKER's)
/* function buscarValor(objeto, parametro) {
  const resultados = [];
  const pila = [{ objeto, objetoPadre: null, keyPadre: null }];
  while (pila.length > 0) {
    const { objeto: obj, objetoPadre, keyPadre } = pila.pop();
    for (const key in obj) {
      if (obj[key] === parametro) {
        const resultado = {
          valor: obj[key],
          keyPadre,
          objetoPadre: Object.assign({}, objetoPadre, { [keyPadre]: obj }),
        };
      resultados.push(resultado);
      }else if (typeof obj[key] === "object") {
          pila.push({ objeto: obj[key], objetoPadre: obj, keyPadre: key });
      }
    }
  }
  return resultados;
} */


const arregloNodos = [];
const nodosCloud = buscarValor(json, "MonitorIoT:CloudNode", 4);
const nodosFog = buscarValor(json, "MonitorIoT:FogNode", 4);
const nodosIotGateway = buscarValor(json, "MonitorIoT:IoTGateway", 4);
arregloNodos.push(nodosCloud);
arregloNodos.push(nodosFog);
arregloNodos.push(nodosIotGateway);


//console.log(nodos[0].objetoPadre.$.selfAwareMiddlewarePort);

module.exports = {
    json: json,
    arreglo: arregloNodos
}

orquestador();

function orquestador() {
  require("./Orquestador");
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
