

setTimeout(() => {
    SuscriptorTopicos()
}, 2000);

setTimeout(() => {
    ImplementadorApis();
}, 4000);

setTimeout(() => {
    ImplementadorServicios();
}, 2000);

setTimeout(() => {
  ImplementadorAplicaciones();
}, 2000);


function SuscriptorTopicos(){
    require('../../Comunicacion/Monitoreo/SuscriptorTopicos')
}

function ImplementadorApis(){
    require('../Monitoreo/ImplementadorApis')
}

function ImplementadorServicios(){
    require('../../Comunicacion/Monitoreo/ImplementadorServicios')
}

function ImplementadorAplicaciones(){
  require('../../LogicaNegocio/Monitoreo/ImplementadorAplicaciones')
}