module.exports = {evalProcess};

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
    
            if(res >= lowerThreshold &&  res <= upperThreshold)
            {
                advisor = true;
                evaluation = [res, element['name'], element['interpretation'], (element['recommends'] ?? '')];
                
                console.log('------------------------------------------------------------------------------');
                console.log(process['nombre']+'\t'+process['proceso']+
                '\nMetric Name: '+(process['mdidName'] ?? process['mindName'])+
                '\nMetric Value: '+metricValue+
                '\nIndicator Name: '+process['inidName']+
                '\nIndicator Value: '+res+
                '\nThreshold: '+element['name']+
                '\nInterpretation: '+element['interpretation']+
                '\nRecommendation: '+(element['recommends'] ?? ''));
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
        
    //     console.log('------------------------------------------------------------------------------');
    //     console.log(process['nombre']+'\t'+process['proceso']+
    //     '\nMetric Name: '+process['propiedad']+
    //     '\nMetric Value: '+metricValue+
    //     '\nIndicator Name: '+(process['argumentoFuncion'])+
    //     '\nIndicator Value: '+res+
    //     '\nThreshold: No definido',
    //     '\nInterpretation: No definido',
    //     '\nRecommendation: No definido');
    }

    return evaluation;
}