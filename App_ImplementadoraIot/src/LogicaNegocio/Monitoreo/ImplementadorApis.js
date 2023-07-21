let modelo = require('../../../modelos/modeloObjeto')
let ejecutorTareasMonitoreo = require('../Monitoreo/EjecutorTareasMonitoreo');

try{
    setInterval(() =>{
        let apiTemHum = ejecutorTareasMonitoreo.obtenerTemperaturaHumedad();
        //let apiCo = ejecutorTareasMonitoreo.obtenerCO(4);
        console.log(apiTemHum);
        //console.log(apiCo);
    },2000)
}catch(error){}
