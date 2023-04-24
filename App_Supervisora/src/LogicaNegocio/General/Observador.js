var fs = require('fs')
const ck = require('chokidar')
let startApp = require('../../../StartApp.js')
let path = startApp.filePath
let tipoEjecucion = startApp.tipoEjecucion

cambiosModelo();


function cambiosModelo() /* Funcion para observar si se crea o se modifica el modelo json, para implementar o reconfigurar los recursos de monitoreo */
{
    var watcher = ck.watch(path, {ignored: /^\./, persistent: true, usePolling: true});

    watcher
    .on('add', function(path)
    {
        console.log('File', path, 'Nuevo modelo detectado.');
        planificador();
    })
    .on('change', function(path)
    {
        console.log('File', path, 'Se ha detectado un modificación en el modelo.');
        planificador();
    })
    .on('unlink', function(path)
    {
        console.log('File', path, 'Archivo removido');
    })
    .on('error', function(error)
    {
        console.error('Ocurrio un error', error);
    })
}

function planificador()
{
    require('./PlanificadorTareas.js');
} 

