
function evalProcess(evaluated, actions, process, metricValue)
{
    let lowerThreshold;
    let upperThreshold;
    let advisor = false;

    let evaluation = [];

    let res = eval('(function() {'+evaluated+'}())');
    if(Array.isArray(actions))
    {
        actions.forEach(element => 
        {
            lowerThreshold = element['lowerThreshold'] ?? 0; 
            upperThreshold = element['upperThreshold'] ?? 0;
            upperThreshold = element['upperThreshold'] ?? Infinity; 

    
            if(res >= lowerThreshold &&  res <= upperThreshold)
            {
                advisor = true;
                evaluation = [res, element['name'], element['interpretation'], (element['recommends'] ?? 'Ninguna')]; //name es umbral en la BDA 
                // console.log('------------------------------------------------------------------------------');
                // console.log(process['nombre']+'\t'+process['tipoProceso']+
                // '\nMetric Name: '+(process['mdidName'] ?? process['mindName'])+
                // '\nMetric Value: '+metricValue+
                // '\nIndicator Name: '+process['inidName']+
                // '\nIndicator Value: '+res+
                // '\nThreshold: '+element['name']+
                // '\nInterpretation: '+element['interpretation']+
                // '\nRecommendation: '+(element['recommends'] ?? ''));
                // if (element['recommends'] && element['recommends']['description'] !== undefined) {
                //     console.log('\nRecomendation: '+ element['recommends']['description']);
                // }
            }
            else if(!advisor)
            {
                evaluation = [res, 'Out of limits!', 'Out of limits!', 'Out of limits!'];
            }
        });
    }
    else
    {
        evaluation = [res, '', '', ''];
    }
    return evaluation;
}
module.exports = {evalProcess};