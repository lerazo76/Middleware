// 1 STEP

// VARIABLES
const process = require('process')

/* obtenemos el primer parametro (DIRECTORIO DEL MODELO JSON) */
/* let indexPath = process.argv.indexOf('--ruta'); */
let indexPath = process.argv[2]; 
/* Obtenemos el segundo parametro (QUE APLICACION SE VA A EJECUTAR) */
/* let indexApp = process.argv.indexOf('--tipoejecucion'); */
let indexApp = process.argv[3];

readObservador();

// funcion para llamar al observador
function readObservador(){
  require('./src/LogicaNegocio/General/Observador');
};




