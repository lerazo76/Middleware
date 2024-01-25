let env_puerto = process.env.puerto;
let env_app = process.env.app;

// obtengo el puerto para ejecutar la Aplicacion Implementadora
if(env_puerto > -1){

  module.exports = {
    puerto: env_puerto,
    app: env_app
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

