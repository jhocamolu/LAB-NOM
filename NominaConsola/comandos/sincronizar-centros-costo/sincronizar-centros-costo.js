"use strict";
var axios = require('axios');
var environment = require("../../environments/environment");


var SincronizarCentroCosto = {

    start: function(JwtToken) {
        try {
            axios.defaults.headers.common['JwtToken'] = JwtToken
            axios.get(environment.environment.nomina + "/odata/tareaprogramadas?" + encodeURI("$filter=alias eq 'sincronizar-centros-costo'&$select=enEjecucion"))
                .then(async function(response) {
                    if (response.data.value && response.data.value.length) {
                       
                        const enEjecucion = response.data.value[0].enEjecucion;
                        if (enEjecucion === false) {

                            await axios.patch(environment.environment.nomina + "/api/tareaprogramadas/sincronizar-centros-costo", {
                                alias: "sincronizar-centros-costo",
                                enEjecucion: true
                            }).catch(function(error) {
                                console.log("error al actualizar el estado de la tarea");
                            });

                            //Realiza la petición de la cuenta contable.
                            var now = new Date();
                            await axios.get(environment.environment.nomina + "/api/CentroCostos/TareaProgramadaObtener" ,{
                                data: {
                                    fecha : now
                                }
                            }).catch(function(error) {
                                console.log("error al intentar ejecutar la tarea " + error);
                            });
                            
                            await axios.patch(environment.environment.nomina + "/api/tareaprogramadas/sincronizar-centros-costo", {
                                alias: "sincronizar-centros-costo",
                                enEjecucion: false
                            }).catch(function(error) {
                                console.log("error al actualizar el estado de la tarea");
                            });

                            await axios.post(environment.environment.nomina + "/api/tareaprogramadaLogs", {
                                tareaProgramadaAlias: "sincronizar-centros-costo",
                                estado: 'Exitoso',
                                resultado: "Ejecucion exitosa "
                            }).catch(function(error) {
                                console.log("error al actualizar el logs de la tarea");
                            });

                        } else {
                            console.log("tarea en ejecucion");
                        }
                    } else {
                        console.log("no se encontro tarea programada");
                    }
                })
                .catch(function(error) {
                    console.log("error al buscar la tarea");
                });
        } catch (e) {
            axios.patch(environment.environment.nomina + "/api/tareaprogramadas/sincronizar-centros-costo", {
                alias: "sincronizar-centros-costo",
                enEjecucion: false
            }).catch(function(error) {
                console.log("al actualizar el estado de la tarea");
            });
            axios.post(environment.environment.nomina + "/api/tareaprogramadaLogs", {
                tareaProgramadaAlias: "sincronizar-centros-costo",
                estado: 'Fallido',
                resultado: "Error " + e.m
            }).catch(function(error) {
                console.log("al actualizar el logs de la tarea");
            });

        }
        return;
    }
};
exports.SincronizarCentroCosto = SincronizarCentroCosto;