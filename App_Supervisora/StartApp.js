// Archivo para inicializar la aplicacion

//let indexPath = process.argv.indexOf('--rutamodelos'); // obtenemos el primer parametro, hace referencia a la ruta del modelo json
//let indexTipoEjecucion = process.argv.indexOf('--tipoejecucion'); // obtenemos el segundo parametro, hace referencia al tipo de ejecucion monitoreo y autoconsciencia
//let indexPuerto = process.argv.indexOf('--puerto'); // puerto en el que se va a ejecutar la App de Monitoreo

let indexTipoEjecucion = process.argv.indexOf('--tipoejecucion');
let indexPath = process.argv.indexOf('--rutamodelos');
let indextipoApp = process.argv.indexOf('--tipoapp');

if (indexPath > -1){
  let filePath = process.argv[indexPath+1]; 
  let tipoEjecucion = process.argv[indexTipoEjecucion+1]; 
  let tipoApp = process.argv[indextipoApp+1];


  if (filePath !== undefined && tipoEjecucion !== undefined){
    console.log('\nAplicacion supervisora inicializada.\n');
    let tipo = tipoEjecucion == 1 ? 'Modo Ejecución: Motor de sincronización de recursos de monitoreo.\n' : 'Modo Ejecución: Motor de sincronización de recursos de monitoreo y autoconsciencia.\n';
    console.log(tipo);

    // Exporto los parametros Ruta del Modelo y el Tipo de Ejecucion
    module.exports = {
      filePath : filePath,
      tipoEjecucion : tipoEjecucion,
      tipoApp : tipoApp
    }
 
    observador();

    function observador(){
      require('./src/LogicaNegocio/General/Observador');
    };
  } else{
    console.log('\nError al Iniciar Aplicacion Supervisora. Verifique los parametros de Ejecución.\n');
  }

}else{
  console.log('\nError al iniciar el sistema. Verifique los parametros de envio..............\n');
}





