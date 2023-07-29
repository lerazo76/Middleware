// Archivo para inicializar la aplicacion

let indexPath = process.argv.indexOf('--ruta'); // obtenemos el primer parametro, hace referencia a la ruta del modelo json
let indexTipoEjecucion = process.argv.indexOf('--tipoEjecucion'); // obtenemos el segundo parametro, hace referencia al tipo de ejecucion monitoreo y autoconsciencia
let indexPuerto = process.argv.indexOf('--puerto'); // puerto en el que se va a ejecutar la App de Monitoreo

if (indexPath > -1){
  let filePath = process.argv[indexPath+1]; 
  let tipoEjecucion = process.argv[indexTipoEjecucion+1]; 
  let puerto = process.argv[indexPuerto+1];
  console.log(puerto);
  // Exporto los parametros Ruta del Modelo y el Tipo de Ejecucion
  module.exports = {
    filePath : filePath,
    tipoEjecucion : tipoEjecucion
  }

  observador();

  function observador(){
    require('./src/LogicaNegocio/General/Observador');
  };

}else{
  console.log('\nError al iniciar el sistema. Verifique los parametros de envio..............\n');
}





