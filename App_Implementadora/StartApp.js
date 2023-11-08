//let indexPuerto = process.argv.indexOf('--puerto');
let env_puerto = process.env.puerto;

// obtengo el puerto para ejecutar la Aplicacion Implementadora
if(env_puerto > -1){
  /*let puerto = process.argv[indexPuerto+1];
  module.exports = {
    puerto: puerto
  }*/

  module.exports = {
    puerto: env_puerto
  }
  console.log(`\nIniciando servidor de aplicaciones en http://localhost:${env_puerto}`);
  recolector(); 

}else{
  console.log('\x1b[31m%s\x1b[0m','Error al Iniciar Aplicacion Implementadora, no se especifico el puerto.');
}

// Funcion para llamar al Recolector
function recolector(){
  require('./src/Comunicacion/General/Recolector');
};

// Funcion para llamar al Ejecutor de Tareas 
function ejecutorTareas(){
  require('./src/LogicaNegocio/General/EjecutorTareas');
}

