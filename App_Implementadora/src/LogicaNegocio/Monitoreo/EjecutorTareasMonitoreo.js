let modelo = require('../../../modelos/modeloObjeto.json')

// Generamos el codigo para crear las nuevas APIS

modelo.forEach(element => {
    console.log(element);
});

/* exports.codigoapis= function(resource,index){
    let globalInst = "";
    globalInst += "exports."+(resource.$.name ? resource.$.name : ("getData" + index)) + "= function(";
    resource.containsParameter && resource.containsParameter.forEach((param, i) => {
        globalInst += param.$.name + ((i === resource.containsParameter.length - 1) ? "" : ",");
    });
    globalInst += "){\n";
    globalInst += resource.$.instructions + "\n}";
    console.log(globalInst+"\n");
    return globalInst;
}; */