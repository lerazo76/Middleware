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
        console.log("Last instruction " + lastInstruction);
        if (isNaN(evalResult)) {
            evalResult = 0;
        }
        res.json({
            evalResult
        });
    });
}

function startServer(url, instruction, port) {
    console.log('Levantando servidor.');
    app.use("/", putFunctionIntoServer(url, instruction));
    app.listen(port, () => {
        console.log("******** Servidor levantando en el puerto:" + port + " ********");
    });
}

module.exports = {
    startServer,
    putFunctionIntoServer,
};