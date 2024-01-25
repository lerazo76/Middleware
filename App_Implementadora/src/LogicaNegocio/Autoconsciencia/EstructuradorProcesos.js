const funciones = require("../../../Funciones"); //importando las funciones para buscar un valor en json y cambiar el path por los pares clave-valor
const modelo = require("../../../modelos/modeloJSON.json"); // importando el modelo de arquitectura global
const modeloNodo = require("../../../modelos/modeloObjeto.json"); //importando el modelo de arquitectura correspondiente al nodo
const nodoComputacion = modeloNodo[0]["xsi:type"]; //se obtiene el nodo de computacion sobre el que se esta trabajando

//extraer los procesos de autoconsciencia
const procesosenjson = funciones.buscarValor(modelo, "ControlAmbiental", 8); //corregir que la busqueda no sea 'Control Ambiental'c
//cambiar paths por objetos necesarios para procesos pre-reflexivos y reflexivos
funciones.cambiarValorPropiedad(procesosenjson, "collectsProperty", modelo, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
// cambiarValorPropiedad(procesosenjson, "columns_paths", modelo, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$" //PREGUNTAR
//ACTUALIZACION NO CAMBIAR AQUI SI NO MAPEAR LA CONEXION DE BD, TABLA Y COLUMNA PARA CADA PROCESO
funciones.cambiarValorPropiedad(procesosenjson, "produces", modelo, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
// cambiarValorPropiedad(procesosenjson, "captures", modelo, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
//AQUI REALIZO CAMBIO AL MAPEO DE CAPTURES YA QUE EL ASPECTO SE RELACIONA AL OBJETO ES DECIR TOC DOBLE BUSQUEDA
procesosenjson.forEach((element) => {
    if (element.hasOwnProperty("containsSelfAwarenessProcess")) {
        element["containsSelfAwarenessProcess"].forEach((item) => {
            rutaaspecto = item["captures"];
            // console.log("ruta aspecto proceso", item['name'], "; ",rutaaspecto);
            rutaaspectomapeada = "ArchitectureSelfAwarenessIoT." + funciones.transformaraRuta(rutaaspecto);
            // console.log("ruta aspecto mapeada ", rutaaspectomapeada);
            //verificar si tiene objeto relacionado o no (caso de ser colectivo no tiene objeto relacionado)
            try {
                rutaobjeto = funciones.buscarValorConRuta(modelo, rutaaspectomapeada, "belongsTo");
                if (rutaobjeto) {
                    rutaobjetomapeada = "ArchitectureSelfAwarenessIoT." + funciones.transformaraRuta(rutaobjeto);
                    // console.log("ruta objeto mapeada ", rutaobjetomapeada);
                    objetoAutconsciencia = funciones.buscarValorConRuta(modelo, rutaobjetomapeada, "$");
                    // console.log("objeto autoconsciencia ", objetoAutconsciencia );
                    item["objetoautoconsciencia"] = objetoAutconsciencia;
                } else {
                    item["objetoautoconsciencia"] = null;
                }
            } catch (e) {
                console.log("Error mapeo ", e)
            }
        });
    }
});
//luego de esto si mapeo el captures para obtener el aspecto de autoconsciencia
funciones.cambiarValorPropiedad(procesosenjson, "captures", modelo);  //no se envia "$" ya que se necesita todo el objeto con sus propiedades
//FIN CAMBIO MAPEO CAPTURES
//mapeo isDerivedFrom de los aspectos colectivos para tener sus aspectos hijos
funciones.cambiarValorPropiedad(procesosenjson, "isDerivedFrom", modelo);
funciones.cambiarValorPropiedad(procesosenjson, "isCaptured", modelo);
//fin mapeo isDerivedFrom
funciones.cambiarValorPropiedad(procesosenjson, "isImplementedBy", modelo, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"
funciones.cambiarValorPropiedad(procesosenjson, "uses", modelo, "containsThreshold"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "containsThreshold"
funciones.cambiarValorPropiedad(procesosenjson, "recommends", modelo, "$");
//adicionales
funciones.cambiarValorPropiedad(procesosenjson, "relatesParameter", modelo, "$");
funciones.cambiarValorPropiedad(procesosenjson, "relatesMetric", modelo, "$");
//obtener el nodo de comptuacion
funciones.cambiarValorPropiedad(procesosenjson, "computingNode", modelo, "$");

//dividir los procesos segun su identificacion (pre-reflexivos o reflexivos)
let arregloProcesosDiv = dividirProcesos(procesosenjson);
const prereflexivos = arregloProcesosDiv["pre-reflexive"]; //variable que se exportara 
const reflexivos = arregloProcesosDiv["reflexive"]; //variable que se exportara
const entidad = arregloProcesosDiv["entity"]; //entidad sobre la que se esta trabajando 


//Funcion para clasificar los procesos en reflexivos y pre-reflexivos
function dividirProcesos(nodoprocesos) {
    let preReflexive = [];
    let reflexive = [];
    let sujeto = "";
    nodoprocesos.forEach((element) => {
        if (element.hasOwnProperty("containsSelfAwarenessProcess")) {
            sujeto = element["id"] + "," + element["name"];
            element["containsSelfAwarenessProcess"].forEach((item) => {
                let content = Object.entries(item);
                if (item["xsi:type"] === "pre-reflexive") {
                    preReflexive.push(item);
                } else {
                    reflexive.push(item);
                }
            });
        }
    });
    let process = {
        entity: sujeto,
        "pre-reflexive": preReflexive,
        reflexive: reflexive,
    };
    return process;
}

module.exports = {
    prereflexivos,
    reflexivos,
    entidad,
    modelo,
};
