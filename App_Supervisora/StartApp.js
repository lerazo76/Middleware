// Archivo para inicializar la aplicacion

// VARIABLES
let indexPath = process.argv.indexOf('--ruta'); /* obtenemos el primer parametro, hace referencia a la ruta del modelo json */
let indexTipoEjecucion = process.argv.indexOf('--tipoEjecucion'); /* obtenemos el segundo parametro, hace referencia al tipo de ejecucion monitoreo y autoconsciencia */
/* if (indexPath > -1){
  let filePath = process.argv[2]; 
  let tipoEjecucion = process.argv[3]; 
  console.log('ruta');
}else{
  console.log('no');
}
 */

let filePath = process.argv[2]; 
let tipoEjecucion = process.argv[3]; 

/* Exporto las variables */
module.exports = {
  filePath : filePath,
  tipoEjecucion : tipoEjecucion
}

observador();

// funcion para llamar al observador
function observador(){
  require('./src/LogicaNegocio/General/Observador');
};




