let globalConfig;
let localConfig;
try {
    localConfig = require('../../../modelos/modeloObjeto.json');
    globalConfig = require('../../../modelos/modeloJSON.json');
} catch (error) {}

localConfig && localConfig.forEach((resource, index) => {
    resource.containsResource && resource.containsResource.forEach( propiedades => {
        let globalInst = "";
        if (propiedades["xsi:type"] === "MonitorIoT:API") {
            globalInst=getApis(propiedades,index);
            eval(globalInst);
        }
    })
})

function getApis(resource,index){
    let globalInst = "";
    globalInst += "exports."+(resource.name ? resource.name : ("getData" + index)) + "= function(";
    resource.containsParameter && resource.containsParameter.forEach((param, i) => {
        globalInst += param.name + ((i === resource.containsParameter.length - 1) ? "" : ",");
    });
    globalInst += "){\n";
    globalInst += resource.instructions + "\n}";    
    return globalInst;
};