const table = {
    D: {
      2: Infinity,
      3: Infinity,
      4: Infinity,
      5: Infinity,
    },
    "D++": {
      2: 20.63,
      3: 24.3,
      4: 27.11,
      5: 30.09,
    },
    "D+": {
      2: 9.521,
      3: 11.095,
      4: 12.27,
      5: 13.235,
    },
    "D+-": {
      2: 5.802,
      3: 6.675,
      4: 7.316,
      5: 7.819,
    },
    DA: {
      2: 3.929,
      3: 4.45,
      4: 4.825,
      5: 5.111,
    },
    "D-+": {
      2: 2.792,
      3: 3.101,
      4: 3.318,
      5: 3.479,
    },
    "D-": {
      2: 2.018,
      3: 2.187,
      4: 2.302,
      5: 2.384,
    },
    SQU: {
      2: 2,
      3: undefined,
      4: undefined,
      5: undefined,
    },
    "D--": {
      2: 1.449,
      3: 1.519,
      4: 2,
      5: 1.596,
    },
    A: {
      2: 1,
      3: 1,
      4: 1,
      5: 1,
    },
    "C--": {
      2: 0.619,
      3: 0.573,
      4: 0.546,
      5: 0.526,
    },
    "C-": {
      2: 0.261,
      3: 0.192,
      4: 0.153,
      5: 0.129,
    },
    GEO: {
      2: undefined,
      3: undefined,
      4: undefined,
      5: undefined,
    },
    "C-+": {
      2: -0.148,
      3: -0.208,
      4: -0.235,
      5: -0.251,
    },
    CA: {
      2: -0.72,
      3: -0.732,
      4: -0.721,
      5: -0.707,
    },
    HAR: {
      2: -1,
      3: undefined,
      4: undefined,
      5: undefined,
    },
    "C+-": {
      2: -1.655,
      3: -1.55,
      4: -1.455,
      5: -1.38,
    },
    "C+": {
      2: -3.51,
      3: -3.114,
      4: -2.823,
      5: -2.606,
    },
    "C++": {
      2: -9.06,
      3: -7.639,
      4: -6.689,
      5: -6.013,
    },
    C: {
      2: Infinity,
      3: Infinity,
      4: Infinity,
      5: Infinity,
    },
  };
  
  function modeloLSP(operacion, pesos, metricas, actions) {
    let lowerThreshold;
    let upperThreshold;
    let advisor = false;
    let evaluation = [];
    let resultado = 0;
    if (table.hasOwnProperty(operacion)) {
      const operacionTabla = table[operacion];
      const numPesos = pesos.length; // Determina el número de pesos
      if (operacionTabla.hasOwnProperty(numPesos)) {
        const valoroperacion = operacionTabla[numPesos];
        if(valoroperacion !== Infinity && valoroperacion !== undefined){
          
          for (let i = 0; i < numPesos; i++) {
            resultado += Math.pow(pesos[i] * metricas[i], valoroperacion);
          }
          resultado = Math.pow(resultado, 1/valoroperacion);
          // return  resultado;
        }
        if(Array.isArray(actions)){
          actions.forEach(element =>{
            lowerThreshold = element['lowerThreshold'] ?? 0; 
            // upperThreshold = element['upperThreshold'] ?? 0;
            upperThreshold = element['upperThreshold'];
  
            if(upperThreshold === null ){
              upperThreshold = 10000000; 
            }
            if(resultado >= lowerThreshold &&  resultado <= upperThreshold)
            {
              advisor = true;
              evaluation = [resultado, element['name'], element['interpretation'], (element['recommends'] ?? '')]; //name es umbral en la BDA 
            }
            else if(!advisor)
            {
              evaluation = [resultado, 'Out of limits!', 'Out of limits!', 'Out of limits!'];
            }
          });
        }
      }
    }else{
      evaluation = [res, '', '', ''];;
    }
    return evaluation;
    // return "Operación no encontrada en la tabla";
  }
  module.exports = {modeloLSP};
  
  
  
  
  
  
  