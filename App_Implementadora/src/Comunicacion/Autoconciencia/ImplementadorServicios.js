const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function putFunctionIntoServer(url, instruction) {
    return router.post("/" + url, async (req, res, next) => {
        let body = req.body;
        let keys = Object.keys(body);
        let lastInstruction = instruction;

        
        keys.forEach(element => {
            lastInstruction = lastInstruction.replace(element, body[element]);
        })
        let evalResult = eval('(function() {' + lastInstruction + '}())');
        if (isNaN(evalResult)) {
            evalResult = 0;
        }
        res.json({
            evalResult
        });
    });
}


let servicesPost = [];
const funciones = require("../../../Funciones");
const modelo = require("../../../modelos/modeloJSON.json");
const procesosenjson = funciones.buscarValor(modelo, "ControlAmbiental", 8); //corregir que la busqueda no sea 'Control Ambiental'c
funciones.cambiarValorPropiedad(procesosenjson, "isImplementedBy", modelo, "$"); //cambiar las rutas por los pares clave:valor del objeto relacionado en la propiedad "$"

procesosenjson.forEach((element) => {
    if (element.hasOwnProperty("containsSelfAwarenessProcess")) {
        element["containsSelfAwarenessProcess"].forEach((item) => {
            if (item.hasOwnProperty("usesCalculationMethod")) {
                if (item["usesCalculationMethod"][0]["implementationResourceType"].toLowerCase() === "servicio") {
                    let endPoint = item["usesCalculationMethod"][0]["isImplementedBy"]["endPoint"];
                    let funcionservicio = item["usesCalculationMethod"][0]["isImplementedBy"]["instructions"];
                    servicesPost.push({
                        url: endPoint,
                        funcion: funcionservicio
                    })
                }
            }//else if(element.hasOwnProperty("usesAnalysisModel")){ //caso en el que un pre-reflexivo utilice tamien servicio web... pendiente
            // }
        });
    }
});

module.exports = {
    putFunctionIntoServer,
    servicesPost
};




