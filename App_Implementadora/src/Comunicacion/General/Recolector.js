// En este archivo se crea un servicio web RESTfull para establecer una comunicacion entre 
// las aplicaciones supervisora e implementadora.
// Este servicio web es consumido desde la app supervisora PAG 37


const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const port = process.env.port || 3000;
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
            data = req.body
            res.send(data)
        }catch(err){
            response = {
                error: true,
                code: 502,
                message: 'Error in config file'
            }
        }
        
    }
});

app.listen(port,()=>{
    console.log(`Servidor corriendo en el puerto: ${port}`);
});