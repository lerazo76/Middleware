var Controller=require('./controlador.js');

module.exports=function(app)
{
    app.post('/get-datos', Controller.getData);
    app.post('/get-tree-structure', Controller.getTreeStructure);
    app.post('/get-id-and-name', Controller.getIdsAndNames);
};