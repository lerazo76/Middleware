let indexPuerto = process.argv.indexOf('--puerto');
//let indexPuerto = process.env.puerto;
console.log(indexPuerto);
// obtengo el puerto para ejecutar la Aplicacion Implementadora
if(indexPuerto > -1){
  let puerto = process.argv[indexPuerto+1];
  module.exports = {
    puerto: puerto
  }
  console.log(`\nIniciando servidor de aplicaciones en http://localhost:${puerto}`);
  recolector(); 

}else{
  console.log('\x1b[31m%s\x1b[0m','Ok Error al Iniciar Aplicacion Implementadora, no se especifico el puerto para ejecutar.');
}

// Funcion para llamar al Recolector
function recolector(){
  require('./src/Comunicacion/General/Recolector');
};

// Funcion para llamar al Ejecutor de Tareas 
function ejecutorTareas(){
  require('./src/LogicaNegocio/General/EjecutorTareas');
}

