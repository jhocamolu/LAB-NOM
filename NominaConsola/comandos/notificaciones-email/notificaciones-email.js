"use strict";
const nodemailer = require("nodemailer");
var handlebars = require('handlebars');
var fs = require('fs');
var axios = require('axios');
var environment = require("./../../environments/environment");

var readHTMLFile = function(path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function(err, html) {
        if (err) {
            throw err;
            callback(err);
        } else {
            callback(null, html);
        }
    });
};

var NotificacionesEmail = {

    start: function(notificacionId,JwtToken) {
        try {
            axios.defaults.headers.common['JwtToken'] = JwtToken
            axios.get(environment.environment.nomina + "/odata/tareaprogramadas?" + encodeURI("$filter=alias eq 'notificacion-push'&$select=enEjecucion"))
                .then(async function(response) {
                    if (response.data.value && response.data.value.length) {
                       
                        const enEjecucion = response.data.value[0].enEjecucion;
                        if (enEjecucion === false) {

                            await axios.patch(environment.environment.nomina + "/api/tareaprogramadas/notificacion-email", {
                                alias: "notificacion-email",
                                enEjecucion: true
                            }).catch(function(error) {
                                console.log("error al actualizar el estado de la tarea");
                            });

                            var smtpTransport = nodemailer.createTransport({
                                service: environment.config.email_service,
                                auth: {
                                    user: environment.config.email_user,
                                    pass: environment.config.email_pass
                                }
                            });

                            readHTMLFile(__dirname + '/template/index.html', async function(err, html) {
                                var filter = "$filter=estado ne 'Enviado' and notificacion/tipo eq 'Email'";
                                filter = (notificacionId) ? filter + " and notificacionId eq " + notificacionId : filter;
                                var expand = "$expand=notificacion($select=tipo,titulo,mensaje),funcionario($select=numeroDocumento,correoElectronicoPersonal,correoElectronicoCorporativo)";
                                var select = "$select=id,notificacionId,funcionarioId,estado,notificacion,funcionario,correoelectronico";
                                var order = "$orderBy=notificacionId";
                                var params = encodeURI(filter + "&" + expand + "&" + select + "&" + order);
                                var url = environment.environment.nomina + "/odata/notificaciondestinatarios?" + params;
                                //console.log(url);
                                var template = handlebars.compile(html);
                                await axios.get(url)
                                    .then(async function(response) {
                                        response.data.value.forEach(element => {
                                            //console.log(element);
                                            var email = null;
                                            if (element.correoElectronico != null){
                                                email = element.correoElectronico;
                                            }
                                            if(element.funcionario != null){
                                                
                                                if (element.funcionario.correoElectronicoPersonal != null) {
                                                    email = element.funcionario.correoElectronicoPersonal;
                                                }
                                                if (element.funcionario.correoElectronicoCorporativo != null) {
                                                    email = element.funcionario.correoElectronicoCorporativo;
                                                }
                                            }
                                            console.log("Email:"+ email);
                                            if (email) {
                                                var replacements = {
                                                    mensaje: element.notificacion.mensaje,
                                                    titulo: element.notificacion.titulo,
                                                    assets: environment.environment.assets,
                                                };
                                                var htmlToSend = template(replacements);
                                                var mailOptions = {
                                                    from: environment.config.email_user,
                                                    to: email,
                                                    subject: element.notificacion.titulo,
                                                    html: htmlToSend
                                                };

                                                //console.log(htmlToSend);

                                                smtpTransport.sendMail(mailOptions, async function(error, info) {
                                                    if (error) {
                                                        await axios.patch(environment.environment.nomina + "/api/notificaciondestinatarios/" + element.id, {
                                                            id: element.id,
                                                            estado: 'Fallido'
                                                        }).catch(function(error) {
                                                            console.log("error actualizando estado destinatario " + (element.funcionario.numeroDocumento)?element.funcionario.numeroDocumento:email);
                                                        });
                                                        await axios.post(environment.environment.nomina + "/api/notificaciondestinatariologs", {
                                                            notificacionId: element.notificacionId,
                                                            funcionarioId: (element.funcionarioId)?element.funcionarioId:null,
                                                            correoElectronico : (element.correoElectronico)?element.correoElectronico:null,
                                                            estado: 'Fallido',
                                                            resultado: 'Error al enviar al email' + email
                                                        }).catch(function(error) {
                                                            console.log("error insertando log destinatario " + (element.funcionario.numeroDocumento)?element.funcionario.numeroDocumento:email);
                                                        });
                                                    } else {
                                                        await axios.patch(environment.environment.nomina + "/api/notificaciondestinatarios/" + element.id, {
                                                            id: element.id,
                                                            estado: 'Enviado'
                                                        }).catch(function(error) {
                                                            console.log("error actualizando estado destinatario " + (element.funcionario.numeroDocumento)?element.funcionario.numeroDocumento:email);
                                                        });
                                                        await axios.post(environment.environment.nomina + "/api/notificaciondestinatariologs", {
                                                            notificacionId: element.notificacionId,
                                                            funcionarioId: (element.funcionarioId)?element.funcionarioId:null,
                                                            correoElectronico : (element.correoElectronico)?element.correoElectronico:null,
                                                            estado: 'Enviado'
                                                        }).catch(function(error) {
                                                            console.log("error insertando log destinatario " + (element.funcionario.numeroDocumento)?element.funcionario.numeroDocumento:email);
                                                        });
                                                        console.log('Email sent: ' + info.response);
                                                        //console.log('email enviado al correo electrónico ' + email);
                                                    }
                                                });

                                            } else {
                                                axios.patch(environment.environment.nomina + "/api/notificaciondestinatarios/" + element.id, {
                                                    id: element.id,
                                                    estado: 'Fallido'
                                                }).catch(function(error) {
                                                    console.log("error actualizando estado destinatario " + (element.funcionario.numeroDocumento)?element.funcionario.numeroDocumento:email);
                                                });
                                                axios.post(environment.environment.nomina + "/api/notificaciondestinatariologs", {
                                                    notificacionId: element.notificacionId,
                                                    funcionarioId: element.funcionarioId,
                                                    estado: 'Fallido',
                                                    resultado: 'El usuario no registrar ningun email'
                                                }).catch(function(error) {
                                                    console.log("error insertando log destinatario " + (element.funcionario.numeroDocumento)?element.funcionario.numeroDocumento:email);
                                                });
                                            }

                                        });
                                    })
                                    .catch(function(error) {
                                        // handle error
                                        console.log(error);
                                    });

                            });
                            await axios.patch(environment.environment.nomina + "/api/tareaprogramadas/notificacion-email", {
                                alias: "notificacion-email",
                                enEjecucion: false
                            }).catch(function(error) {
                                console.log("error al actualizar el estado de la tarea");
                            });

                            await axios.post(environment.environment.nomina + "/api/tareaprogramadaLogs", {
                                tareaProgramadaAlias: "notificacion-email",
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
            axios.patch(environment.environment.nomina + "/api/tareaprogramadas/notificacion-email", {
                alias: "notificacion-email",
                enEjecucion: false
            }).catch(function(error) {
                console.log("al actualizar el estado de la tarea");
            });
            axios.post(environment.environment.nomina + "/api/tareaprogramadaLogs", {
                tareaProgramadaAlias: "notificacion-email",
                estado: 'Fallido',
                resultado: "Error " + e.m
            }).catch(function(error) {
                console.log("al actualizar el logs de la tarea");
            });

        }
        return;
    }
};
exports.NotificacionesEmail = NotificacionesEmail;