let modelo = require('../../../modelos/modeloObjeto') // obtengo el modelo creado de cada nodo

// Codigo para crear APIS
function codigoApis(propiedades){
    let newAPI = "";
    //newAPI += "exports."+propiedades.name+" = function (par1, par2){\n";
    newAPI += "exports."+propiedades.name+" = function (){"; 
       
    /* propiedades.containsParameter.forEach((parameters, i) => {
        newAPI += parameters.name + ((i===propiedades.containsParameter.length-1) ? "" : ",");
    })
    
    newAPI += "){\n" + propiedades.instructions + "\n}"; */
    newAPI += propiedades.instructions + "\n}";
    return newAPI;
}
// Buscamos en el modelo todas las APIS para crear
modelo.forEach((resource, index) => {
    let nuevaAPI = "";
    resource.containsResource.forEach((propiedades)=>{
        if(propiedades['xsi:type'] == 'MonitorIoT:API'){
            nuevaAPI = codigoApis(propiedades);
            console.log(nuevaAPI);
            eval(nuevaAPI);
        }
    })
});
//
function ImplementadorApis(){
    console.log('Enviando APIS a ImplementadorApis.js......................');
    require('../Monitoreo/ImplementadorApis');
}
ImplementadorApis();

function ImplementadorBD(){
    require('../General/ImplementadorBD')
}
//ImplementadorBD()