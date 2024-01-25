var myChart;
var myInterval;

function getIdsAndNames(sql)
{
    return new Promise(function (resolve) {
        const url = 'http://localhost:9914/get-id-and-name';
        const http = new XMLHttpRequest();
        http.open("POST", url);
        http.setRequestHeader('Content-type', 'application/json');
        http.onreadystatechange = function(){
            if(this.readyState === 4 && this.status === 200){
                var resultado = JSON.parse(this.responseText);
                resolve(resultado.sujeto);
            }
        };
        http.send(JSON.stringify({ "sql": sql}));  
    });
}

async function armarestructura(menu = "selectSujeto", subMenu = "option", id = "sid", name = "sidname", parentNode, parentValue)
{
    clearInterval(myInterval);
    if(menu != "seleccione")
    {
        let sql = "";
        let elemento = document.getElementById(menu);

        if(menu == "selectSujeto")
        {
            sql = "SELECT DISTINCT sid, sidname FROM metricas;";
        }
        else if (id == "pid")
        {
            sql = "SELECT DISTINCT "+id+", pidname FROM metricas WHERE "+parentNode+"="+parentValue+";";
        }
        else
        {
            sql = "SELECT DISTINCT "+id+","+name+", tipo FROM metricas WHERE "+parentNode+"="+parentValue+" order by "+id+";";
        }

        let datos = await getIdsAndNames(sql);

        datos.forEach(element => 
        {
            var subElemento = document.createElement(subMenu);
            subElemento.innerHTML = element[name];

            if(id == "pid")
            {
                subElemento.value = element[id];
                subElemento.innerHTML = "PID "+element[id]+" "+element['pidname'] + " (reflexivo)";
            }
            else if(subMenu == "option")
            {
                subElemento.value = element[id];
            }
            else if(id == "mid")
            {
                subElemento.innerHTML = element[id]+". "+element[name]+" ("+element['tipo']+")";
            }

            elemento.appendChild(subElemento);
        });
    }
}

function getTreeStructure(parentId)
{
    return new Promise(function (resolve) {
        const url = 'http://localhost:9914/get-tree-structure';
        const http = new XMLHttpRequest();
        http.open("POST", url);
        http.setRequestHeader('Content-type', 'application/json');
        http.onreadystatechange = function(){
            if(this.readyState === 4 && this.status === 200){
                var resultado = JSON.parse(this.responseText);
                resolve(resultado.treeStructure);
            }
        };
        http.send(JSON.stringify({ "parentId": parentId}));  
    });
}

async function armarArbol(menu2, parentValue)
{
    clearInterval(myInterval);
    if(menu2 != "seleccione")
    {
        let datos = await getTreeStructure(parentValue);
        let pos = 0;
        let text="";

        for(let j = 0; j < datos[0].length; j++)
        {
            if(datos[0][j] === pos)
            {
                text+="<li class=\"menu__item\"><a href=\"#\" class=\"menu__link\" id=\"lis"+j+"\">"+datos[1][j]+"</a></li>" ;           
            }
            else if(datos[0][j] > pos)
            {
                pos++;
                text+="<ul class=\"submenu"+pos+"\">";
                text+="<li class=\"menu__item\"><a href=\"#\" class=\"menu__link\" id=\"lis"+j+"\">"+datos[1][j]+"</a></li>"; 
            }
            else if(datos[0][j] < pos)
            {
                for(let k = datos[0][j]; k < pos; k++)
                {
                    text+="</ul>";
                }
                
                text+="<li class=\"menu__item\"><a href=\"#\" class=\"menu__link\" id=\"lis"+j+"\">"+datos[1][j]+"</a></li>";
                pos = datos[0][j];
            }
        }

        const menu=document.getElementById("objetos");
        menu.innerHTML=text;
        setAspects(datos);
    }
}

function setAspects(datos)
{
    for(let i=0;i<datos[0].length;i++)
    {
        let valores="const el"+i+"=document.getElementById(\"lis"+i+"\")\n";
        valores+="el"+i+".addEventListener(\"click\", function(){\n";
        valores+="const menu=document.getElementById(\"aspectos\");\n";
        valores+="let text=\"\"\n";

        if(datos[2][i].length>0)
        {            
            valores+="let a=\"\"\n";
            for(let j=0;j<datos[2][i].length;j++)
            {
                let val="";
                if(datos[2][i][j].k.v)
                {
                    val=" : "+ datos[2][i][j].k.v;
                }
                valores+="a="+"\""+datos[2][i][j].k.n+val+"\"\n";
                valores+="text+=\"<li class='menu__item' > <a class='menu__link' id='pr"+j+"|"+i+"'>\"+a+\"</a></li>\"\n";  
            }         
        }
        else
        {
            valores+="text+=\"<li class='menu__item'> <a class='menu__link' id='pr'>Elemento no tiene aspectos</a></li>\"\n";
        }
        valores+="menu.innerHTML=text\n";
        valores+="text=\"\"\n";
        valores+="})";
        eval(valores);
    }
}

function getDatos(sql)
{
    return new Promise(function (resolve) {
        const url = 'http://localhost:9914/get-datos';
        const http = new XMLHttpRequest();
        http.open("POST", url);
        http.setRequestHeader('Content-type', 'application/json');
        http.onreadystatechange = function(){
            if(this.readyState === 4 && this.status === 200){
                var resultado = JSON.parse(this.responseText);
                resolve(resultado.data);
            }
        };
        http.send(JSON.stringify({"sql": sql}));  
    });
}

async function getDatosTiempoRealAndFechas(id, mid, f1, f2)
{
    //const prediccionNombre = document.getElementById("recom"); 
    const tabla = document.getElementById("tabla-informacion");
    tabla.innerHTML = "";
    let sql = "SELECT * FROM metricas WHERE pid="+id+" AND mid="+mid + " ORDER BY id DESC";
    let datosExtra = [];
    let fechas = [];
    var legendagrafico ="";

    if(id == "todos")
    {
        sql = "SELECT * FROM METRICAS WHERE PID IN (SELECT DISTINCT PID FROM METRICAS WHERE MID = "+mid+")";
    }

    if(f1 && f2)
    {
        console.log("f1 ", f1, " f2 ", f2);
        sql+= " AND fecha BETWEEN '"+f1+"' AND '"+f2+"'";
    }

    datos = await getDatos(sql);

    if(datos.length > 0)
    {
        //datos.reverse();
        let cabecera = Object.keys(datos[0]);

        var tableHead = document.createElement("thead");
        var filaTabla = document.createElement("tr");

        cabecera[cabecera.indexOf("fecha")] = "Fecha";
        cabecera[cabecera.indexOf("valor")] = "Valor";

        if ((datos[0]["tipo"] == "directa") || (datos[0]["tipo"] == "indirecta"))
        {
            delete(cabecera[cabecera.indexOf("umbral")]);
            delete(cabecera[cabecera.indexOf("interpretacion")]);
            delete(cabecera[cabecera.indexOf("recomendacion")]);
        }
        else if (datos[0]["tipo"] == "indicador")
        {
            cabecera[cabecera.indexOf("umbral")] = "Umbral";
            cabecera[cabecera.indexOf("interpretacion")] = "Interpretación";
            cabecera[cabecera.indexOf("recomendacion")] = "Recomedación";
        }

        if (datos[0]["valorsimulacion"] == "" || datos[0]["valorsimulacion"] == null || datos[0]["valorsimulacion"] == undefined)
        {
            delete(cabecera[cabecera.indexOf("nombresimulacion")]);
            delete(cabecera[cabecera.indexOf("descripcionsimulacion")]);
            delete(cabecera[cabecera.indexOf("valorsimulacion")]);
        }
        else if (datos[0]["valorsimulacion"] != "" || datos[0]["valorsimulacion"] != null || datos[0]["valorsimulacion"] != undefined)
        {
            cabecera[cabecera.indexOf("nombresimulacion")] = "Escenario Simulación";
            //cabecera[cabecera.indexOf("descripcionsimulacion")] = "Descripción Simulación";
            delete(cabecera[cabecera.indexOf("descripcionsimulacion")]);
            cabecera[cabecera.indexOf("valorsimulacion")] = "Valor Simulación";
        }
        
        delete(cabecera[cabecera.indexOf("sid")]);
        delete(cabecera[cabecera.indexOf("sidname")]);
        delete(cabecera[cabecera.indexOf("oid")]);
        delete(cabecera[cabecera.indexOf("oidname")]);
        delete(cabecera[cabecera.indexOf("aid")]);
        delete(cabecera[cabecera.indexOf("aidname")]);
        delete(cabecera[cabecera.indexOf("mid")]);
        delete(cabecera[cabecera.indexOf("midname")]);
        delete(cabecera[cabecera.indexOf("pid")]);
        delete(cabecera[cabecera.indexOf("pidname")]);
        delete(cabecera[cabecera.indexOf("id")]);
        delete(cabecera[cabecera.indexOf("tipo")]);

        cabecera.forEach(element => 
        {
            var tableHeadRow = document.createElement("th");
            tableHeadRow.innerHTML = element;
    
            filaTabla.appendChild(tableHeadRow);
        });
        tableHead.appendChild(filaTabla);

        var tableBody = document.createElement("tbody");

        datos.forEach((element, i) => 
        {
            var labelTipo = document.getElementById("tipovariable");
            legendagrafico = labelTipo.innerHTML = element["midname"]+ " ("+element["tipo"]+")";

            element["Fecha"] = new Date(element['fecha']).toLocaleString();

            element["Valor"] = parseFloat(element["valor"]).toFixed(2);
  
            if ((datos[0]["tipo"] == "directa") || (datos[0]["tipo"] == "indirecta"))
            {
                delete(element['umbral']);
                delete(element['interpretacion']);
                delete(element['recomendacion']);
            }
            else if (datos[0]["tipo"] == "indicador")
            {
                element["Umbral"] = element["umbral"];
                element["Interpretación"] = element["interpretacion"];
                element["Recomedación"] = element["recomendacion"];
            }

            if (datos[0]["valorsimulacion"] == "" || datos[0]["valorsimulacion"] == null || datos[0]["valorsimulacion"] == undefined)
            {
                delete(element["nombresimulacion"]);
                delete(element["descripcionsimulacion"]);
                delete(element["valorsimulacion"]);
                
                btnPrediccion.classList.remove("botonresaltado"); 
                btnPrediccion.classList.add("boton"); 
                btnTiempoReal.classList.remove("boton"); 
                btnTiempoReal.classList.add("botonresaltado"); 
            }
            else if (datos[0]["valorsimulacion"] != "" || datos[0]["valorsimulacion"] != null || datos[0]["valorsimulacion"] != undefined)
            {
                element["Escenario Simulación"] = element["nombresimulacion"];
                //element["Descripción Simulación"] = element["descripcionsimulacion"];
                delete(element["descripcionsimulacion"]);
                element["Valor Simulación"] = element["valorsimulacion"];

                btnTiempoReal.classList.remove("botonresaltado"); 
                btnTiempoReal.classList.add("boton"); 
                btnPrediccion.classList.remove("boton"); 
                btnPrediccion.classList.add("botonresaltado"); 
            }

            delete(element["pid"]);
            delete(element["pidname"]);
            delete(element["sid"]);
            delete(element["sidname"]);
            delete(element["oid"]);
            delete(element["oidname"]);
            delete(element["aid"]);
            delete(element["aidname"]);
            delete(element["mid"]);
            delete(element["midname"]);
            //delete(element["tipo"]);

            datosExtra.push(element['valor']);

            fechas.push(element['Fecha']);

            var filaTabla = document.createElement("tr");

            cabecera.forEach(item => 
            {
                var tableDataRow = document.createElement("td");
                if (item =="Fecha")
                {
                 tableDataRow.width = 130;
                }
                if (item =="Interpretación")
                {
                 tableDataRow.setAttribute ("width" ,300);
                }
                if (item =="Recomendación")
                {
                  tableDataRow.setAttribute ("width" ,500);
                  tableDataRow.setAttribute ("text-align", "justify");
                }
                tableDataRow.innerHTML = element[item];
                filaTabla.appendChild(tableDataRow);
            });
            tableBody.appendChild(filaTabla);
        });

        tabla.appendChild(tableHead);
        tabla.appendChild(tableBody);

        grafico(legendagrafico, datosExtra, fechas);
    }
}

async function getTimerForDataBase(id, mid, f1, f2)
{
    myInterval = setInterval(() => 
    {
        getDatosTiempoRealAndFechas(id, mid, f1, f2)
    }, 15000);
}

function grafico(nom, datos, labels)
{ 
    const data = 
    {
        labels: labels,
        datasets: 
        [{
            label: nom,
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: datos
        }]
    };

    const config = 
    {
        type: 'line',
        data,
        options: {}
    };         

    if (myChart)
    {
        myChart.destroy();
    }

    myChart = new Chart(
        document.getElementById('myChart'),
        config
    );  
}