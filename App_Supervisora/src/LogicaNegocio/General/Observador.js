// Este archivo observa si se crea o se modifica el modelo json, para implementar o reconfigurar
// los recursos de monitoreo

const ck = require('chokidar')

readChanges();

function readChanges()
{
    var watcher = ck.watch('./modelos', {ignored: /^\./, persistent: true, usePolling: true});

    watcher
    .on('add', function(path)
    {
        console.log('File', path, 'se ha detectado un nuevo modelo.');
        readFile();
    })
    .on('change', function(path)
    {
        console.log('File', path, 'se ha detectado un modificación en el modelo.');
        readFile();
    })
    .on('unlink', function(path)
    {
        console.log('File', path, 'has been removed');
    })
    .on('error', function(error)
    {
        console.error('Error happened', error);
    })
}

function readFile()
{
    require('./PlanificadorTareas.js');
} 

