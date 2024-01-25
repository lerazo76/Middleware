const request = require('request');
let globalConfig = require("../../../modelos/modeloJSON.json"); //importando el modelo de arquitectura completo
const localConfig = require('../../../modelos/modeloObjeto.json'); //importando el modelo de arquitectura correspondiente al nodo
const mqtt = require('mqtt'); // importa el protocolo mqtt para crear los topicos
let ProtRef = require('../../../src/LogicaNegocio/Monitoreo/ImplementadorApis'); // importa el componente de las apis a ser creadas
let device = require('../../LogicaNegocio/Monitoreo/device');
let client, topic;
let time=[]; // almacena informacion del tiempo a ejecutar cada api
let apinames=[]; // almacena informacion del nombre de las apis
let rutas=[]; // almacena informacion de las rutas para el flujo de datos 
let rutastipo=[]; // almacena informacion de las distintas rutas api, brokers
let topico=[]; // almacena informacion de los topicos
let app;
let apis=[];
let linkappserv;
let linkapptop;
let linkappservortop=[];
const start = require('../../../StartApp'); // importar el componente start para obtener ciertas variables 
const tipoApp = start.app; // variable para visualizar los mensajes en el log Monitoreo/Autoconsciencia

function codigoenviarapp(){
    var Codigoo="";
    Codigoo+="    const body = {} \n";
    Codigoo+="    let name = apinames[i] \n";
    //Codigoo+="    console.log(name)\n";
    //Codigoo+="    console.log(device[name]())\n";
    Codigoo+="    body[name] = device[name]();\n";
    //Insertar Parametros
    Codigoo+="    if(rutastipo[i]===1){\n";
    //Codigoo+="    console.log(\"******** Send Data Service: \", rutas[i], \" \" + JSON.stringify(body),\" ********\")\n";
    Codigoo+="    if (tipoApp==1 || tipoApp==0){console.log(\" Enviando Informacion al Servicio: \", rutas[i], \" \")}\n";
    Codigoo+="    request({\n";
    Codigoo+="            url: rutas[i],\n";
    Codigoo+="            headers: headers,\n";
    Codigoo+="            body: JSON.stringify({body,\"link\":linkappservortop[i]}),\n";   
    Codigoo+="            method: 'POST'\n";
    Codigoo+="        },\n";
    Codigoo+="        (error, response, body) => {\n";
    Codigoo+="            if (!error && response.statusCode == 200) {\n";
    //Codigoo+="                console.log(body);\n";
    Codigoo+="            } else {\n";
    Codigoo+="                console.log(error)\n";
    Codigoo+="            }\n";
    Codigoo+="        }\n";
    Codigoo+="    );           \n"       ;
    Codigoo+="    }\n";
    Codigoo+="    else{\n";
    Codigoo+="    rutas[i] && console.log(\"******** Send Data Topic: \", topico[i].$.name, \" \" + JSON.stringify(body), \" ********\")\n";
    Codigoo+="    rutas[i] && topico[i] && client.publish(topico[i].$.name, JSON.stringify({body,\"link\":linkappservortop[i]}))   \n";
    Codigoo+="    }\n";    
   
    return Codigoo;
};

const headers = {
    'content-type': 'application/json'
};
// Obtenemos las aplicaciones del modelo de arquitectura del nodo
localConfig && localConfig.forEach(resource => {
    resource.containsResource && resource.containsResource.forEach( propiedades => {
        if(propiedades["xsi:type"] == "MonitorIoT:Application"){
            app = propiedades;
            crear_app(app);
        }
    })
})
// Funcion para crear las aplicaciones con todos los flujos de datos respectivos
function crear_app(app){
    if(app){
        if(app.hasLinkAppToAPI){
                let apisbeta=app.hasLinkAppToAPI.split("//@");
                
                for (var i=1; i<apisbeta.length; i++){
                    var tapi=ProtRef.getApis(globalConfig,apisbeta[i].split(".")[1]);  
                    apis.push(tapi[tapi.length-1]);
                }

                if(apis.length>0){
                    var j=-1;
                    apis.forEach(api => {
                        j++;
                        
                        time[j]=ProtRef.getTiempo(globalConfig,api);
                        apinames[j]=api.$.name;
                        let urlService="", urlBroker=""; 
                        try {
                            let serviceRef = ""
                            if(app.hasLinkAppToService.split("//@")){
                                serviceRef = app.hasLinkAppToService.split("//@");
                            }else{
                                serviceRef = "containsLink.9";
                            }

                            if (serviceRef.length > 0) {
                                for (var i=1; i<serviceRef.length; i++){
                                    let previuslink=globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[serviceRef[i].split(".")[1]].$.previousLink;
                                    if(previuslink===api.$.hasLinkAppToAPI){
                                        linkappserv=api.$.hasLinkAppToAPI;
                                        let index = 0;
                                        index = serviceRef[i].split(".")[1];
                                        urlService = ProtRef.getServiceURI(globalConfig, index);
                                        urlService+="/1";
                                    }
                                }
                            }
                        } catch (error) {}
                        try {
                            const brokerRef = app.hasLinkAppToTopic.split("//@");
                            if (brokerRef.length > 0) {
                                for (var i=1; i<brokerRef.length; i++){
                                    let previuslink=globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[brokerRef[i].split(".")[1]].$.previousLink;
                                
                                    if(previuslink===api.$.hasLinkAppToAPI){
                                        linkapptop=api.$.hasLinkAppToAPI;
                                        let index = 0;
                                        index = brokerRef[i].split(".")[1];
                                        urlBroker = ProtRef.getBrokerURI(globalConfig, index);
                                        topic=ProtRef.getTopic(globalConfig, index);
                                    }
                                }
                                //client = mqtt.connect("mqtt://mqtt:1883");
                                client = mqtt.connect(urlBroker)
                            }
                        } catch (error) {}
                        if(urlService===""){
                            linkappservortop[j]=linkapptop;
                            rutas[j]=urlBroker;
                            rutastipo[j]=2;
                        }
                        else{
                            linkappservortop[j]=linkappserv;
                            rutas[j]=urlService;
                            rutastipo[j]=1;
                        }
                        
                        topico[j]=topic;
                    });
                    // Ejecuta la funcion para crear las aplicaciones con sus respectivos enlaces con las apis, servicios, topicos
                    var Codigoo = codigoenviarapp();       
                    // Ejecuta la funcion cada cierto tiempo establecido en el modelo
                    function ejapi(i){
                        time[i] = time[i] - 590000
                        setInterval(() => {
                            ejapi2(i);
                        },time[i]);
                    }
                    function ejapi2(i){
                        eval(Codigoo);
                    }
                    for(var i=0;i<apis.length;i++){
                        ejapi(i);
                    }
                }
        }
    }
}
