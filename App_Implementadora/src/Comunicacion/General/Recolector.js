// En este archivo se crea un servicio web RESTfull para establecer una comunicacion entre 
// las aplicaciones supervisora e implementadora.
// Este servicio web es consumido desde la app supervisora PAG 37 - Capitulo 5

const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
let startApp = require('../../../StartApp');
let puerto = startApp.puerto;

const port = process.env.port || puerto;

let routes;
let tipoEjecucion;


const { servicesPost, putFunctionIntoServer } = require("../../Comunicacion/Autoconciencia/ImplementadorServicios"); //importar los servicios y la funcion para publicar los servicios 
//de autoconsciencia



try {
    fs.statSync('./modelos/modeloObjeto.json'); // lee el  modelo de arquitectura en caso de existir, sino espera el posible modelo a ser implementado
    console.log('\nAPI RESTful recolector publicada (OK)');
    delete require.cache[require.resolve("../../Comunicacion/Monitoreo/ImplementadorServicios")]; // Elimina de la cache todos los servicios existentes
    routes = require("../../Comunicacion/Monitoreo/ImplementadorServicios"); // Obtiene todos los nuevos servicios a ser implementados en el middleware
    ejecutorTareas(); // Ejecuta las tareas tanto de monitoreo como de autoconsciencia
} catch (err) {
    if (err.code === 'ENOENT') {
        console.log('*** Esperando configuracion ***');
    } 
} 

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
routes && app.use("/", routes); // publica todos los servicios creados

//cod alex 
servicesPost.forEach(({url,funcion}) => { //para cada elemento del arreglo de servicios, se publica con su respectivo url y funcion
    app.use("/", putFunctionIntoServer(url,funcion));
});

app.get('/', (req, res) => {
    response = {
        error: true,
        code: 200,
        message: 'Start Point'
    };
    res.send(response);
});

app.post('/',(req, res) =>{ 
    let data;
    if(req.body){
        try{
            // Recepta todo el modelo de arquitectura a ser empleado para la creacion de todos los recursos
            fs.writeFile('./modelos/modeloJSON.json', JSON.stringify(req.body.modeloJSON, null, 4), 'utf-8', (err) =>{
                if(err){
                    response = {
                        error: true,
                        code: 502,
                        message: 'Error en la configuracion del Modelo JSON'
                    }
                }
            });
            // Recepta el modelo de arquitectura respecto al nodo
            fs.writeFile('./modelos/modeloObjeto.json', JSON.stringify(req.body.modeloOBJETO, null, 4), 'utf-8', (err) =>{
                if(err){
                    response = {
                        error: true,
                        code: 502,
                        message: 'Error en la configuracion del Modelo de Objetos'
                    }
                }
                console.log('\x1b[31m%s\x1b[0m', 'Receptando una nueva versión de los modelos y los planes de implementación de los recursos de monitoreo y autoconsciencia desde el nodo supervisor...');
            })
            response = {
                error: false,
                code: 200,
                message: 'Modelos creados/actualizados'
            }

            // Recupera la variable Tipo Ejecucion
            tipoEjecucion  = req.body.tipoEjecucion
            module.exports.tipoEjecucion = tipoEjecucion;
         
        }catch(err){
            response = {
                error: true,
                code: 502,
                message: 'Error en la configuración del archivo'
            }
        }
    }
    res.send(response);
    if(response.code == 200){
        ejecutorTareas();
    }
});

app.use((req, res, next) => {
    response = {
        error: true,
        code: 404,
        message: 'URL not found'
    };
    res.status(404).send(response);
});
// Pone en ejecucion el middleware
app.listen(port,()=>{
    console.log(`\nAplicacion implementadora inicializada en http://localhost:${port}`);
});
// Funcion para llamar al Ejecutor de Tareas 
function ejecutorTareas(){
    require('../../LogicaNegocio/General/EjecutorTareas');
}








// // En este archivo se crea un servicio web RESTfull para establecer una comunicacion entre 
// // las aplicaciones supervisora e implementadora.
// // Este servicio web es consumido desde la app supervisora PAG 37 - Capitulo 5

// const express = require("express");
// const bodyParser = require('body-parser');
// const app = express();
// const fs = require('fs');
// let startApp = require('../../../StartApp');
// let puerto = startApp.puerto;

// const port = process.env.port || puerto;

// let routes;
// let tipoEjecucion;

// try {
//     fs.statSync('./modelos/modeloObjeto.json');
//     console.log('\nAPI RESTful recolector publicada (OK)');
//     routes = require("../../Comunicacion/Monitoreo/ImplementadorServicios");
// } catch (err) {
//     if (err.code === 'ENOENT') {
//         console.log('******** Esperando configuracion Here ********');
//     } 
// } 

// app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json());
// routes && app.use("/", routes);

// app.get('/', (req, res) => {
//     response = {
//         error: true,
//         code: 200,
//         message: 'Start Point'
//     };
//     res.send(response);
// });

// app.post('/',(req, res) =>{ 
//     let data;
//     if(req.body){
//         try{
//             fs.writeFile('./modelos/modeloJSON.json', JSON.stringify(req.body.modeloJSON, null, 4), 'utf-8', (err) =>{
//                 if(err){
//                     response = {
//                         error: true,
//                         code: 502,
//                         message: 'Error en la configuracion del Modelo JSON'
//                     }
//                 }
//                 //console.log('\x1b[31m%s\x1b[0m', 'Receptando una nueva versión de los modelos y los planes de implementación de los recursos de monitoreo y autoconsciencia desde el nodo supervisor...');
//             });
//             fs.writeFile('./modelos/modeloObjeto.json', JSON.stringify(req.body.modeloOBJETO, null, 4), 'utf-8', (err) =>{
//                 if(err){
//                     response = {
//                         error: true,
//                         code: 502,
//                         message: 'Error en la configuracion del Modelo de Objetos'
//                     }
//                 }
//                 console.log('\x1b[31m%s\x1b[0m', 'Receptando una nueva versión de los modelos y los planes de implementación de los recursos de monitoreo y autoconsciencia desde el nodo supervisor...');
//             })
//             response = {
//                 error: false,
//                 code: 200,
//                 message: 'Modelos creados/actualizados'
//             }

//             // Recupera la variable Tipo Ejecucion
//             tipoEjecucion  = req.body.tipoEjecucion
//             module.exports.tipoEjecucion = tipoEjecucion;
         
//         }catch(err){
//             response = {
//                 error: true,
//                 code: 502,
//                 message: 'Error en la configuración del archivo'
//             }
//         }
//     }
//     res.send(express.response);
// });

// app.use((req, res, next) => {
//     response = {
//         error: true,
//         code: 404,
//         message: 'URL not found'
//     };
//     res.status(404).send(response);
// });

// app.listen(port,()=>{
//     console.log(`\nAplicacion implementadora inicializada en http://localhost:${port}`);
//     ejecutorTareas();
// });


// // Funcion para llamar al Ejecutor de Tareas 
// function ejecutorTareas(){
//     require('../../LogicaNegocio/General/EjecutorTareas');
// }
  



