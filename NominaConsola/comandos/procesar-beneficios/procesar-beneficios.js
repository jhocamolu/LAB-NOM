
"use strict";
var environment = require("../../environments/environment");
var axios = require('axios');
var ProcesarBeneficios = {
    start: function(JwtToken) {
        try {
            axios.defaults.headers.common['JwtToken'] = JwtToken
            axios.post(environment.environment.nomina + "/api/beneficios/TareaProgramadaProcesar", {
            }).then(async function(response) {
                console.log("Ejecutado con exito");
            }).catch(function(error) {
                console.log("Error al consumir el recurso");
            });   
            
        } catch (e) {
            console.log("Error al tratar de ejecutar el comando");
        }
        return;
    }
};
exports.ProcesarBeneficios = ProcesarBeneficios;
