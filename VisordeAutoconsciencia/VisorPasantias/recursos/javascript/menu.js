const select = document.getElementById("selectSujeto");
const object = document.getElementById("objetos");
const aspect = document.getElementById("aspectos");
const metric = document.getElementById("metricas");
const divSelectPids = document.getElementById("pids");
const selectPids = document.getElementById("selectpids");
const tipoVariable = document.getElementById("tipoVariable");
const tablaDatos = document.getElementById("miTablaDatos");
const graficoDatos = document.getElementById("miGrafico");

const fecha = document.getElementById("fechas");
const btnFechas = document.getElementById("btn-fechas");
const recomendacion = document.getElementById("recomendacion");
const btnRecomendacion = document.getElementById("btn-recomendacion");
const btnTiempoReal = document.getElementById("btn-tiempo");
const btnHistorico = document.getElementById("btn-fechas");
const btnPrediccion = document.getElementById("btn-recomendacion");
const btnFormFechas = document.getElementById("btn-formfechas");

var midPid;

//FUNCIONES DEL MENU
select.addEventListener("change", function()
{
    object.innerHTML = "";
    aspect.innerHTML = "";
    metric.innerHTML = "";
    selectPids.innerHTML = "";
    divSelectPids.classList.remove("container-pids");
    divSelectPids.classList.remove("desple");
    divSelectPids.classList.add("ocultar");
    tipoVariable.classList.remove("container-tipoVariable");
    tipoVariable.classList.remove("desple");
    tipoVariable.classList.add("ocultar");
    // var item = select.options[select.selectedIndex].value;
    // armarestructura("objetos", "li", "oid", "oidname", "sid", item);
    armarArbol("objetos", "sid");
    clearInterval(myInterval);
});

object.addEventListener("click", function(event)
{
    metric.innerHTML = "";
    selectPids.innerHTML = "";
    divSelectPids.classList.remove("container-pids");
    divSelectPids.classList.remove("desple");
    divSelectPids.classList.add("ocultar");
    tipoVariable.classList.remove("container-tipoVariable");
    tipoVariable.classList.remove("desple");
    tipoVariable.classList.add("ocultar");

    var oldActive = document.getElementsByClassName("selected-object");
    if(oldActive.length > 0)
    {
        oldActive[0].classList.remove("selected-object");
    }

    // var item = event.target.innerHTML;
    event.target.classList.add("selected-object");

    // var item = event.target.innerHTML;
    // armarestructura("aspectos", "li", "aid", "aidname", "oid", item.split(".")[0]);
    clearInterval(myInterval);
});

aspect.addEventListener("click", function(event)
{
    metric.innerHTML = "";
    selectPids.innerHTML = "";
    divSelectPids.classList.remove("container-pids");
    divSelectPids.classList.remove("desple");
    divSelectPids.classList.add("ocultar");
    tipoVariable.classList.remove("container-tipoVariable");
    tipoVariable.classList.remove("desple");
    tipoVariable.classList.add("ocultar");

    var oldActive = document.getElementsByClassName("selected-aspect");
    if(oldActive.length > 0)
    {
        oldActive[0].classList.remove("selected-aspect");
    }

    var item = event.target.innerHTML;
    event.target.classList.add("selected-aspect");

    var item = event.target.innerHTML;
    armarestructura("metricas", "li", "mid", "midname", "aid", item.split(".")[0]);
    clearInterval(myInterval);
});

metric.addEventListener("click", function(event)
{
    selectPids.innerHTML = "";
    divSelectPids.classList.remove("ocultar");
    divSelectPids.classList.add("desple");
    divSelectPids.classList.add("container-pids");

    var opt = document.createElement("option");
    opt.value = "seleccione";
    opt.innerHTML = "Seleccione";
    selectPids.appendChild(opt);

    var opt = document.createElement("option");
    opt.value = "todos";
    opt.innerHTML = "Seleccionar Todos";
    selectPids.appendChild(opt);

    var oldActive = document.getElementsByClassName("selected-metric");
    if(oldActive.length > 0)
    {
        oldActive[0].classList.remove("selected-metric");
    }

    var item = event.target.innerHTML;
    event.target.classList.add("selected-metric");

    midPid = item.split(".")[0];
    armarestructura("selectpids", "option", "pid", "", "mid", midPid);
    clearInterval(myInterval);
});

selectPids.addEventListener("change", function()
{
    tipoVariable.classList.remove("ocultar");
    tipoVariable.classList.add("desple");
    tipoVariable.classList.add("container-tipoVariable");
    var item = selectPids.options[selectPids.selectedIndex].value;
    getDatosTiempoRealAndFechas(item, midPid);
    //getTimerForDataBase(item, midPid);
    tablaDatos.classList.remove("ocultar");
    tablaDatos.classList.add("desple");
    graficoDatos.classList.remove("ocultar");
    graficoDatos.classList.add("desple");
});

//BOTONES DE LA INTERFAZ
btnRecomendacion.addEventListener("click", function(){
    if(recomendacion.classList.contains("desple"))
    {
    }
    else
    {
        fecha.classList.add("ocultar");
        fecha.classList.remove("container-fechas");
        fecha.classList.remove("desple");
        recomendacion.classList.add("desple");
        recomendacion.classList.remove("ocultar");
        recomendacion.classList.add("container-recomendacion");
    }
});

btnFechas.addEventListener("click", function(){
    if(fecha.classList.contains("desple"))
    {
    }
    else
    {
        recomendacion.classList.add("ocultar");
        recomendacion.classList.remove("container-recomendacion");
        recomendacion.classList.remove("desple");
        fecha.classList.add("desple");
        fecha.classList.remove("ocultar");
        fecha.classList.add("container-fechas");
    }
});

btnTiempoReal.addEventListener("click", function(){
    if(fecha.classList.contains("desple")){
        fecha.classList.add("ocultar");
        fecha.classList.remove("container-fechas");
        fecha.classList.remove("desple");
    }
    else if(recomendacion.classList.contains("desple"))
    {
        recomendacion.classList.add("ocultar");
        recomendacion.classList.remove("container-recomendacion");
        recomendacion.classList.remove("desple");
    }
});

btnFormFechas.addEventListener("click", function()
{
    clearInterval(myInterval);
    let fecha1=document.getElementById("desde").value;
    let fecha2=document.getElementById("hasta").value;

    var item = selectPids.options[selectPids.selectedIndex].value;
    getDatosTiempoRealAndFechas(item, midPid, fecha1, fecha2);
    // getTimerForDataBase(item, midPid, fecha1, fecha2);
});