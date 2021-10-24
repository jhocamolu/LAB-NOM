"use strict";
var environment = require("./../../environments/environment");
var axios = require('axios');
var NotificarVencimientoCubrirVacante = {
    start: function (JwtToken) {
        try {
            
            axios.defaults.baseURL = environment.environment.nomina;
            axios.defaults.headers.common['JwtToken'] = JwtToken
            
            const urlBuscarTarea = "/odata/tareaprogramadas?" + encodeURI("$filter=alias eq 'notificar-vencimientocubrirvacante'&$select=enEjecucion")

            axios.get(urlBuscarTarea)
                .then(async function (response) {
                    if (response.data.value && response.data.value.length) {
                        const enEjecucion = response.data.value[0].enEjecucion;

                        if (enEjecucion === false) {
                            const urlUpdateEstadoTarea = "/api/tareaprogramadas/notificar-vencimientocubrirvacante"
                            const urlEjecutarTarea = "/api/EjecucionTareas/NotificarVencimientoCubrirVacante"

                            await axios.patch(urlUpdateEstadoTarea,
                                {
                                    alias: "notificar-vencimientocubrirvacante",
                                    enEjecucion: true
                                }
                            ).catch(function (error) {
                                console.log("error al actualizar el estado de la tarea");
                            });


                            axios.patch(urlEjecutarTarea, {
                            }).then(async function (response) {
                                console.log("Ejecutado con exito");
                            }).catch(function (error) {
                                console.log("Error al consumir el recurso");
                            });


                            await axios.patch(urlUpdateEstadoTarea,
                                {
                                    alias: "notificar-vencimientocubrirvacante",
                                    enEjecucion: false
                                }
                            ).catch(function (error) {
                                console.log("error al actualizar el estado de la tarea");
                            });

                        } else {
                            console.log("tarea en ejecucion");
                        }
                    }
                })
                .catch(function (error) {
                    console.log("error al buscar la tarea");
                });

        } catch (e) {
            console.log("Error al tratar de ejecutar el comando");
        }
        return;
    }
};
exports.NotificarVencimientoCubrirVacante = NotificarVencimientoCubrirVacante;