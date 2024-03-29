// Este archivo crea nuevas suscripciones a topicos de broker
const mqtt = require('mqtt')
const request = require("request");
let modelo = require('../../../modelos/modeloObjeto.json') //importando el modelo de arquitectura correspondiente al nodo
let modeloJSON = require('../../../modelos/modeloJSON.json'); //importando el modelo de arquitectura completo
const topicos = require('../../../src/Comunicacion/Monitoreo/DistribuidorMensajesTopicos') // importa el componente donde se encuentran los topicos
let client
let broker, network;
const start = require('../../../StartApp'); // importar el componente start para obtener ciertas variables 
const tipoApp = start.app; // variable para visualizar los mensajes en el log Monitoreo/Autoconsciencia

if (tipoApp==1 || tipoApp==0){
    console.log('\x1b[32m%s\x1b[0m', 'Implementando las suscripciones a tópicos ...');
}
// Obtengo los parametros para crear los Brokers y las configuraciones de Red
modelo.forEach(resource => {
    resource.containsResource.forEach(properties => {
        if(properties['xsi:type'] === 'MonitorIoT:Broker'){ // obtiene los datos del broker del modelo de arquitectura
            broker = properties;
        }else if (properties['xsi:type'] === 'MonitorIoT:NetworkInterface'){ // obtiene los datos de la red
            network = properties;
        }
    })
})
// Verifico si existen datos para crear los nuevos topicos
if(network && broker){
    let protocol = {}
    // Obtenemos el protocolo que va a ser creado tanto el nombre como el puerto
    const protocolRef = broker.usesProtocol.split("/@")
    if (protocolRef.length > 0){
        let indexEntity = 0;
        const entityAux= protocolRef[1].split(".");
        indexEntity = entityAux[1];
        let indexProtocol = 0;
        const protocolAux = protocolRef[2].split(".");
        indexProtocol = protocolAux[1];
        protocol = topicos.getLocalProtocol(modeloJSON,indexEntity,indexProtocol);       
    }
    // Obtiene la direccion del broker
    //const uri = protocol ? protocol.name.toLowerCase() + "://" + network.networkAddress + ":" + protocol.port : "";
    let uri = "mqtt://mosquitto-nodo-fog-1:1883"
    // Crea un cliente MQTT y conéctate al broker
    client = protocol.name.toLowerCase() == "mqtt" && mqtt.connect(uri)
}

// Manejador de eventos para el cliente MQTT cuando se conecta al broker
broker && client && client.on('connect', () => {
    let topics = {}
    if (broker.containsTopic && broker.containsTopic.length > 0) {
        broker.containsTopic.forEach(topic => {
            topics[topic.name] = {
                "qos": 0 // nivel de QoS más bajo disponible Significa que los mensajes publicados con QoS 0 no se garantiza que sean entregados y no se realiza ningún intento de retransmisión si la entrega falla.
            }
        })
        // Suscripción a un tópico para recibir mensajes
        client.subscribe(topics, (err, topicos) => {
            if (err) console.log(err);
            else {
                const brokerURI = client.options.href;
                if (tipoApp==1 || tipoApp==0){
                    topicos.forEach(topic => { // Imprime todos los topicos creados
                        console.log('\x1b[32m%s\x1b[0m', `Tópico ${topic.topic} creado en ${brokerURI} (OK)`);
                    })
                }
            }
        })
    }
})
// Manejador de eventos para los mensajes recibidos en el tópico suscrito
client && client.on('message', (topic, message) => {
    // Obtiene el topico del broker donde se reciben los mensajes
    const auxTopic = broker.containsTopic.find(e => e.name == topic)
    let urlService;
    const serviceRef = auxTopic.hasLinkServiceToTopic.split("/@")
    // Si existe una relacion del topico con el servicio se realiza este procedimiento
    if (serviceRef.length > 0) {
        for(let i=1; i<serviceRef.length; i++)
        {
            let index = 0;
            const auxList = serviceRef[i].split(".")
            index = auxList[1]
            urlService = topicos.getServiceURI(modeloJSON, index)
        }
    }
    //Obtiene los tipos de datos de mensajes que se reciben
    const dataType = auxTopic.dataFormatType ? auxTopic.dataFormatType : "JSON"
    if (message.toString() != "1" && urlService != "") {
        //console.log("******** Broker Data Recibe ", topic, " *******")
        //console.log('\n\x1b[32m%s\x1b[0m', `Informacion obtenida por el Broker ${topic}...`);
        if (dataType == "JSON") {
            request.post({
                "headers": {
                    "content-type": "application/json"
                },
                "url": urlService,
                "body": message.toString()
            }, (error, response, body) => {
                if (error) {
                    return console.dir(error);
                }
            });
        }
    }
})