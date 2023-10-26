const request = require('request');
let globalConfig = require("../../../modelos/modeloJSON.json");
const localConfig = require('../../../modelos/modeloObjeto.json');
const mqtt = require('mqtt');
let ProtRef = require('../../../src/LogicaNegocio/Monitoreo/ImplementadorApis');
let device = require('../../LogicaNegocio/Monitoreo/device');
let client, topic;
let time=[];
let apinames=[];
let rutas=[];
let rutastipo=[];
let topico=[];
let app;
let apis=[];
let linkappserv;
let linkapptop;
let linkappservortop=[];

function codigoenviarapp(){
    var Codigoo="";
    Codigoo+="    const body = {} \n";
    Codigoo+="    let name = apinames[i] \n";
    Codigoo+="    console.log(name)\n";
    Codigoo+="    console.log(device[name]())\n";
    Codigoo+="    body[name] = device[name]();\n";
    //Insertar Parametros
    Codigoo+="    if(rutastipo[i]===1){\n";
    Codigoo+="    console.log(\"******** Send Data Service: \", rutas[i], \" \" + JSON.stringify(body),\" ********\")\n";
    Codigoo+="    request({\n";
    Codigoo+="            url: rutas[i],\n";
    Codigoo+="            headers: headers,\n";
    Codigoo+="            body: JSON.stringify({body,\"link\":linkappservortop[i]}),\n";   
    Codigoo+="            method: 'POST'\n";
    Codigoo+="        },\n";
    Codigoo+="        (error, response, body) => {\n";
    Codigoo+="            if (!error && response.statusCode == 200) {\n";
    Codigoo+="                console.log(body);\n";
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

localConfig && localConfig.forEach(resource => {
    resource.containsResource && resource.containsResource.forEach( propiedades => {
        if(propiedades["xsi:type"] == "MonitorIoT:Application"){
            app = propiedades;
        }
    })
})

const headers = {
    'content-type': 'application/json'
};

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
                    const serviceRef = app.hasLinkAppToService.split("//@");
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
                        client = mqtt.connect("mqtt://mqtt:1883");
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
            var Codigoo = codigoenviarapp();       
            
            function ejapi(i){
                time[i] = time[i]-599000;
                setInterval(() => {
                    ejapi2(i);
                },time[i]);
            }
            
            function ejapi2(i){
                eval(Codigoo);
            }

            for(var i=0;i<apis.length;i++){
                //console.log(i+" se supone 2");
                ejapi(i);
            }
        }
    }
}

