"use strict";
var environment = require("./../../environments/environment");
var axios = require('axios');
var NotificacionesPush = {
    start: function (notificacionId, JwtToken) {
        axios.defaults.headers.common['JwtToken'] = JwtToken
        var socket = require('socket.io-client')(environment.environment.socket);
        
        socket.on('connect', async function () {
            await axios.patch(environment.environment.nomina + "/api/tareaprogramadas/notificacion-push", {
                alias: "notificacion-push",
                enEjecucion: true
            }).catch(function (error) {
                console.log("error al actualizar el estado de la tarea");
            });

            if (notificacionId) {
                socket.emit('mobile:message', { notificacionId: notificacionId });
                console.log(`mensaje emitido con notificacion ${notificacionId}`);
            } else {
                socket.emit('mobile:message', {});
                console.log(`mensaje emitido`);
            }

            socket.disconnect();
            await axios.patch(environment.environment.nomina + "/api/tareaprogramadas/notificacion-push", {
                alias: "notificacion-push",
                enEjecucion: false
            }).catch(function (error) {
                console.log("error al actualizar el estado de la tarea");
            });
            await axios.post(environment.environment.nomina + "/api/tareaprogramadaLogs", {
                tareaProgramadaAlias: "notificacion-push",
                estado: 'Exitoso',
                resultado: "Ejecucion exitosa "
            }).catch(function (error) {
                console.log("error al actualizar el logs de la tarea");
            });


        })


        return;
    }
};
exports.NotificacionesPush = NotificacionesPush;