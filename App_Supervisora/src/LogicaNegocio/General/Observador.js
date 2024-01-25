
const ck = require('chokidar')
let startApp = require('../../../StartApp.js')
let path = startApp.filePath

console.log('Aplicación supervisora observando nuevas versiones de modelos...\n');


cambiosModelo();

function cambiosModelo() // Funcion para observar si se crea o se modifica el modelo json, para implementar o reconfigurar los recursos de monitoreo
{
    var watcher = ck.watch(path, {ignored: /^\./, persistent: true, usePolling: true});

    watcher
    .on('add', function(path)
    {
        console.log('\x1b[31m%s\x1b[0m', 'Se ha detectado una nueva versión del archivo JSON: ' +  path);
        planificador();
    })
    .on('change', function(path)
    {
        console.log('File', path, 'Se ha detectado una modificación en el modelo.');
        //planificador();
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
    //require('./Planificador.js');
} 

