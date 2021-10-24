var jwtToken = ''
var environment = require("./environments/environment");
var axios = require('axios');
async function obtenerToken() {
    axios.defaults.baseURL = environment.environment.nomina;
console.log( environment.environment.nomina);
    await axios.post("/api/Autenticacion/login", {
        cedula: environment.usuario.cedula,
        clave: environment.usuario.clave
    })
        .then(async function (response) {
            if (response.data.token) {
                jwtToken = response.data.token

            } else {
                console.log(response.data.error)
            }
        })
        .catch(function (error) {
            console.log(error);
            console.log("error al obtener token");
        });
}

var notificacionesPush = require("./comandos/notificaciones-push/notificaciones-push");
var noficacionesEmail = require("./comandos/notificaciones-email/notificaciones-email");
var procedimientobd = require("./comandos/procedimientobd/procedimiento");
var actualizarSolicitudVacaciones = require("./comandos/actualizar-solicitud-vacaciones/actualizar-solicitud-vacaciones");
var actualizarSolicitudVacacionesInterrupcion = require("./comandos/actualizar-solicitud-vacaciones-interrupcion/actualizar-solicitud-vacaciones-interrupcion");
var actualizarLibroVacaciones = require("./comandos/actualizar-libro-vacaciones/actualizar-libro-vacaciones");
var migrarLibroVacaciones = require("./comandos/actualizar-libro-vacaciones/migrar-libro-vacaciones-antigo");
var finalizarAusentismo = require("./comandos/finalizar-ausentismo/finalizar-ausentismo");
var iniciarLibranza = require("./comandos/iniciar-libranza/iniciar-libranza");
var finalizarContrato = require("./comandos/finalizar-contrato/finalizar-contrato");
var actualizarestadofuncionariocontrato = require("./comandos/actualizar-estadofuncionariocontrato/actualizar-estadofuncionariocontrato");
var notificarVencimientoContratos = require("./comandos/notificar-vencimientocontratos/notificar-vencimientocontratos");
var notificarVencimientoCubrirVacante = require("./comandos/notificar-vencimientocubrirvacante/notificar-vencimientocubrirvacante");
var sincronizarCuentasContables = require("./comandos/sincronizar-cuentas-contables/sincronizar-cuentas-contables");
var sincronizarCentroCosto = require("./comandos/sincronizar-centros-costo/sincronizar-centros-costo");
var sincronizarPeriodoContable = require("./comandos/sincronizar-periodo-contable/sincronizar-periodo-contable");
var procesarBeneficios = require("./comandos/procesar-beneficios/procesar-beneficios"); 

require('yargs')
    .command('notificacion-email [notificacionId] [JwtToken]', 'conecta con la aplicacion de socket para emitir los mensajes!', (yargs) => {
        yargs.positional('notificacionId', {
            type: 'number',
            default: null,
            describe: 'id de la notificacion'
        }),
        yargs.positional('JwtToken', {
            type: 'string',
            default: null,
            describe: 'token autorizacion'
        })
    }, async function (argv) {
        if (argv.JwtToken) {
            new noficacionesEmail.NotificacionesEmail.start(argv.notificacionId, argv.JwtToken);
        } else {
            await obtenerToken()
            new noficacionesEmail.NotificacionesEmail.start(argv.notificacionId, jwtToken);
        }
    })

    .command('notificacion-push [notificacionId] [JwtToken]', 'conecta con la aplicacion de socket para emitir los mensajes!', (yargs) => {
        yargs.positional('notificacionId', {
            type: 'number',
            default: null,
            describe: 'id de la notificacion'
        }),
        yargs.positional('JwtToken', {
            type: 'string',
            default: null,
            describe: 'token autorizacion'
        })
    }, async function (argv) {
        if (argv.JwtToken) {
            new notificacionesPush.NotificacionesPush.start(argv.notificacionId, argv.JwtToken);
        } else {
            await obtenerToken()
            new notificacionesPush.NotificacionesPush.start(argv.notificacionId, jwtToken);
        }
    })

    .command('actualizar-solicitud-vacaciones [JwtToken]', 'Ejecuta procedimiento almacenado', (yargs) => {
        yargs.positional('JwtToken', {
            type: 'string',
            default: null,
            describe: 'token autorizacion'
        })
    }, async function (argv) {
        if (argv.JwtToken) {
            new actualizarSolicitudVacaciones.ActualizarSolicitudVacaciones.start(argv.JwtToken);
        } else {
            await obtenerToken()
            new actualizarSolicitudVacaciones.ActualizarSolicitudVacaciones.start(jwtToken);
        }
    })

    // Yusef 12/02/2021
    .command('migrar-libro-vacaciones [JwtToken]', 'Ejecuta procedimiento almacenado migrar libro de vacaciones', (yargs) => {
        yargs.positional('JwtToken', {
            type: 'string',
            default: null,
            describe: 'token autorizacion'
        })
    }, async function (argv) {
        if (argv.JwtToken) {
            new migrarLibroVacaciones.MigrarLibroVacaciones.start(argv.JwtToken); 
        } else {
            await obtenerToken()
            new migrarLibroVacaciones.MigrarLibroVacaciones.start(jwtToken);
        }
    })

    .command('actualizar-solicitud-vacaciones-interrupcion [JwtToken]', 'Ejecuta procedimiento almacenado', (yargs) => {
        yargs.positional('JwtToken', {
            type: 'string',
            default: null,
            describe: 'token autorizacion'
        })
    }, async function (argv) {
        if (argv.JwtToken) {
            new actualizarSolicitudVacacionesInterrupcion.ActualizarSolicitudVacacionesInterrupcion.start(argv.JwtToken);
        } else {
            await obtenerToken()
            new actualizarSolicitudVacacionesInterrupcion.ActualizarSolicitudVacacionesInterrupcion.start(jwtToken);
        }
    })

    .command('actualizar-libro-vacaciones [JwtToken]', 'Ejecuta procedimiento almacenado', (yargs) => {
        yargs.positional('JwtToken', {
            type: 'string',
            default: null,
            describe: 'token autorizacion'
        })
    }, async function (argv) {
        if (argv.JwtToken) {
            new actualizarLibroVacaciones.ActualizarLibroVacaciones.start(argv.JwtToken);
        } else {
            await obtenerToken()
            new actualizarLibroVacaciones.ActualizarLibroVacaciones.start(jwtToken);
        }
    })

    .command('iniciar-libranza [JwtToken]', 'Ejecuta procedimiento almacenado', (yargs) => {
        yargs.positional('JwtToken', {
            type: 'string',
            default: null,
            describe: 'token autorizacion'
        })
    }, async function (argv) {
        if (argv.JwtToken) {
            new iniciarLibranza.IniciarLibranza.start(argv.JwtToken);
        } else {
            await obtenerToken()
            new iniciarLibranza.IniciarLibranza.start(jwtToken);
        }
    })

    .command('finalizar-ausentismo [JwtToken]', 'Ejecuta procedimiento almacenado', (yargs) => {
        yargs.positional('JwtToken', {
            type: 'string',
            default: null,
            describe: 'token autorizacion'
        })
    }, async function (argv) {
        if (argv.JwtToken) {
            new finalizarAusentismo.FinalizarAusentismo.start(argv.JwtToken);
        } else {
            await obtenerToken()
            new finalizarAusentismo.FinalizarAusentismo.start(jwtToken);
        }
    })

    .command('finalizar-contrato [JwtToken]', 'Ejecuta procedimiento almacenado', (yargs) => {
        yargs.positional('JwtToken', {
            type: 'string',
            default: null,
            describe: 'token autorizacion'
        })
    }, async function (argv) {
        if (argv.JwtToken) {
            new finalizarContrato.FinalizarContrato.start(argv.JwtToken);
        } else {
            await obtenerToken()
            new finalizarContrato.FinalizarContrato.start(jwtToken);
        }
    })

    .command('actualizar-estadofuncionariocontrato [JwtToken]', 'Ejecuta procedimiento almacenado', (yargs) => {
        yargs.positional('JwtToken', {
            type: 'string',
            default: null,
            describe: 'token autorizacion'
        })
    }, async function (argv) {
        if (argv.JwtToken) {
            new actualizarestadofuncionariocontrato.ActualizarEstadoFuncionarioContrato.start(argv.JwtToken);
        } else {
            await obtenerToken()
            new actualizarestadofuncionariocontrato.ActualizarEstadoFuncionarioContrato.start(jwtToken);
        }
    })

    .command('notificar-vencimientocontratos [JwtToken]', 'Ejecuta procedimiento almacenado', (yargs) => {
        yargs.positional('JwtToken', {
            type: 'string',
            default: null,
            describe: 'token autorizacion'
        })
    }, async function (argv) {
        if (argv.JwtToken) {
            new notificarVencimientoContratos.NotificarVencimientoContratos.start(argv.JwtToken);
        } else {
            await obtenerToken()
            new notificarVencimientoContratos.NotificarVencimientoContratos.start(jwtToken);
        }
    })

    .command('notificar-vencimientocubrirvacante [JwtToken]', 'Ejecuta procedimiento almacenado', (yargs) => {
        yargs.positional('JwtToken', {
            type: 'string',
            default: null,
            describe: 'token autorizacion'
        })
    }, async function (argv) {
        if (argv.JwtToken) {
            new notificarVencimientoCubrirVacante.NotificarVencimientoCubrirVacante.start(argv.JwtToken);
        } else {
            await obtenerToken()
            new notificarVencimientoCubrirVacante.NotificarVencimientoCubrirVacante.start(jwtToken);
        }
    })

    .command('sincronizar-cuentas-contables [JwtToken]', 'Ejecuta procedimiento almacenado', (yargs) => {
        yargs.positional('JwtToken', {
            type: 'string',
            default: null,
            describe: 'token autorizacion'
        })
    }, async function (argv) {
        if (argv.JwtToken) {
            new sincronizarCuentasContables.SincronizarCuentasContables.start(argv.JwtToken);
        } else {
            await obtenerToken()
            new sincronizarCuentasContables.SincronizarCuentasContables.start(jwtToken);
        }
    })

    .command('sincronizar-periodo-contable [JwtToken]', 'Ejecuta procedimiento almacenado', (yargs) => {
        yargs.positional('JwtToken', {
            type: 'string',
            default: null,
            describe: 'token autorizacion'
        })
    }, async function (argv) {
        if (argv.JwtToken) {
            new sincronizarPeriodoContable.SincronizarPeriodoContable.start(argv.JwtToken);
        } else {
            await obtenerToken()
            new sincronizarPeriodoContable.SincronizarPeriodoContable.start(jwtToken);
        }
    })

    .command('sincronizar-centros-costo [JwtToken]', 'Ejecuta procedimiento almacenado', (yargs) => {
        yargs.positional('JwtToken', {
            type: 'string',
            default: null,
            describe: 'token autorizacion'
        })
    }, async function (argv) {
        if (argv.JwtToken) {
            new sincronizarCentroCosto.SincronizarCentroCosto.start(argv.JwtToken);
        } else {
            await obtenerToken()
            new sincronizarCentroCosto.SincronizarCentroCosto.start(jwtToken);
        }
    })

    .command('procesar-beneficios [JwtToken]', 'Ejecuta procedimiento almacenado', (yargs) => {
        yargs.positional('JwtToken', {
            type: 'string',
            default: null,
            describe: 'token autorizacion'
        })
    }, async function (argv) {
        if (argv.JwtToken) {
            new procesarBeneficios.ProcesarBeneficios.start(argv.JwtToken);
        } else {
            await obtenerToken()
            new procesarBeneficios.ProcesarBeneficios.start(jwtToken);
        }
    })


    .help()
    .argv