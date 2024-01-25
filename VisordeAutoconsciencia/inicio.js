function interface(){
    var express = require('express');
    var app = express();
    var bodyParser=require('body-parser');
    app.use(express.static('./VisorPasantias/')); 
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    var port = 9914;
    require('./FuncionesServidor/rutas.js')(app);
    app.listen(port);
    console.log('server on ' + port);
}

interface();