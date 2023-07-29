// En este archivo se crea un servicio web RESTfull para establecer una comunicacion entre 
// las aplicaciones supervisora e implementadora.
// Este servicio web es consumido desde la app supervisora PAG 37

const express = require("express");
const bodyParser = require('body-parser');
const app = express();
//const port = process.env.port || 9999; 
const port = process.env.port || 9998;
const fs = require('fs');
let routes;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
routes && app.use("/", routes);

app.get('/',(req,res) => {
    res.send('Prueba');
})

app.post('/',(req, res) =>{ 
    let data;
    if(req.body){
        try{
            fs.writeFile('./modelos/modeloJSON.json', JSON.stringify(req.body.modeloJSON, null, 4), 'utf-8', (err) =>{
                if(err){
                    response = {
                        error: true,
                        code: 502,
                        message: 'Error en la configuracion del Modelo JSON'
                    }
                }
                console.log('Nuevo Modelo JSON...................... ');
            });
            fs.writeFile('./modelos/modeloObjeto.json', JSON.stringify(req.body.modeloOBJETO, null, 4), 'utf-8', (err) =>{
                if(err){
                    response = {
                        error: true,
                        code: 502,
                        message: 'Error en la configuracion del Modelo de Objetos'
                    }
                }
                console.log('Nuevo Modelo de Objetos...................... ');
            })
            response = {
                error: false,
                code: 200,
                message: 'Modelos creados/actualizados'
            }

            /* tipoEjec = JSON.stringify(req.body.tipoEjecucion, null, 4)*/
         
        }catch(err){
            response = {
                error: true,
                code: 502,
                message: 'Error in config file'
            }
        }
    }
    res.send(express.response);
});

app.use((req, res, next) => {
    response = {
        error: true,
        code: 404,
        message: 'No funciona la URL'
    };
    res.status(404).send(response);
});

app.listen(port,()=>{
    console.log(`Servidor corriendo en el puerto: ${port}`);
});