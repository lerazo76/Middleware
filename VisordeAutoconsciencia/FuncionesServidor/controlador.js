var fs = require('fs');
var base = require('./BDAuto');
let treeStructure = [[],[],[]];

async function getIdsAndNames(req, res)
{
    let pool = base.createPool();
    const query = await base.executeQuery(pool, req.body.sql);
    
    res.json({sujeto: query.rows});
}

async function getData(req, res)
{
    let pool = base.createPool();
    const query = await base.executeQuery(pool, req.body.sql);
    
    res.json({data: query.rows});
}

function getTreeStructure(req, res)
{
    treeStructure = [[],[],[]];
    let i = 0;
    try
    {
        fs.lstatSync('selfAwareModel/Modelo.json').isFile();
        var globalConfig = JSON.parse(fs.readFileSync('selfAwareModel/Modelo.json','utf8'));
        modelo = globalConfig;
        const containsEntityList = modelo["ArchitectureSelfAwarenessIoT"].containsEntity;
        for (let entity of containsEntityList) 
        {
            treeStructure[0].push(i);
            treeStructure[1].push(entity.$['xsi:type']+":"+entity.$.name);
            let entityKeys = Object.keys(entity);
            comp(entity, entityKeys, i);
        }
        console.log("Info al Visor");  
    }
    catch(error)
    {
        console.log(error);
    }

    res.json({treeStructure: treeStructure});
}

function comp(entity, entityKeys, i)
{
    i++;
    var globalConfig = JSON.parse(fs.readFileSync('selfAwareModel/Modelo.json','utf8'));
    if(entityKeys.includes("has"))
    {
        //poner los if 1
        let obj = [];
        let c = entity.has.split(" ");
        let y = [];
        
        for(let i = 0; i < c.length; i++)
        {
            let cc = c[i].split("/@");
            let columnas = globalConfig["ArchitectureSelfAwarenessIoT"].containsSelfAwarenessAspect[cc[1].split(".")[1]];
            let colau = columnas.$.id+". "+columnas.$.name;
            obj.push(colau);

            let g = {};
            g["k"] = {
                n:colau, 
                valor:"",
                t:[columnas.$.name],
                r:[""],
                c:[colau],
                s:0
            };
            y.push(g);
        }

        treeStructure[2].push(y);
    }
    else
    {
        treeStructure[2].push([]);    
    }

    for(let j = 1; j < entityKeys.length; j++)
    {    
        if(entityKeys[j] !== "hasProperty" && entityKeys[j] !== "containsParameter" && entityKeys[j] !== "containsReturnVariable" && entityKeys[j] !== "containsDataTable" && entityKeys[j] !== "has"){
           
			for(let subentity of entity[entityKeys[j]])
            {
                treeStructure[0].push(i);
                let aux;
                if(subentity.$['xsi:type']){
                    aux=subentity.$['xsi:type'];
                }
                else{
                    aux=entityKeys[j];
                }
                treeStructure[1].push(aux+":"+subentity.$.name);
                let kk=Object.keys(subentity);
                comp(subentity,kk,i);
            } 
        }
    }
}

module.exports = {
    getIdsAndNames,
    getData,
    getTreeStructure
};