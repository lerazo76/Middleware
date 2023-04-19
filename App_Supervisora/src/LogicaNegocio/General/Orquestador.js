const request = require("request");

url = "http://localhost:3000/"

// enviar la informacion
request({
    url: url,
    headers: headers,
    body: JSON.stringify({
        "modelo": modelo
    }),
    method: 'POST'
},
    (error, response, body)=>{
        if(!error && response.statusCode == 200){
            console.log(body);
        }else{
            console.log(error);
        }
    }
);
