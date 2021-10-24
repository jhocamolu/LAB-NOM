import * as http from 'http';
import { Api } from './utils/api';
import { environment, usuario } from './environments/environment';
import { ODATANotificacionDestinatarios } from './utils/interface';
import { AxiosResponse, AxiosError } from 'axios';


export class AppSocket {

    private api: Api
    private io: SocketIO.Server;
    private mobileConnections: any = {};

    constructor(server: http.Server) {
        this.api = new Api();
        this.io = require('socket.io').listen(server, { origins: '*:*' });
    }

    public async listen() {

        this.io.on('connect', (socket: SocketIO.Socket) => {
            console.log('Connected client %s.', socket.id);
            socket.on('mobile:register', (data: {
                userId: string
            }) => {
                console.log(`mobile register ${data.userId}`);
                this.mobileConnections[data.userId] = socket;
            });

            socket.on('mobile:message', async (data?: {
                notificacionId: number
            } | null) => {

                var jwtToken = await this.obtenerToken()
                var config = ({
                    timeout: 8000,
                    headers: { 'JwtToken': jwtToken }
                });

                console.log(`mobile:message ${data?.notificacionId}`);

                let filter = `$filter=estado ne 'Enviado' and notificacion/tipo eq 'MobilePush'`;
                filter = (data && data.notificacionId) ? `${filter} and notificacionId eq ${data.notificacionId}` : filter;
                const expand = `$expand=notificacion($select=tipo,titulo,mensaje),funcionario($select=numeroDocumento)`;
                const select = `$select=id,notificacionId,funcionarioId,estado,notificacion,funcionario`;
                const order = `$orderBy=notificacionId`;
                const params = encodeURI(`${filter}&${expand}&${select}&${order}`);
                const url = `${environment.nomina}/odata/notificaciondestinatarios?${params}`;

                this.api.get<ODATANotificacionDestinatarios>(url, config)
                    .then((response: AxiosResponse<ODATANotificacionDestinatarios>) => {
                        console.log("TodoBien")
                        const { data } = response;
                        data.value.map(element => {
                            if (this.mobileConnections[element.funcionario.numeroDocumento]) {
                                const mobileSocket: SocketIO.Socket = this.mobileConnections[element.funcionario.numeroDocumento];
                                mobileSocket.emit('mobile:notification', {
                                    title: element.notificacion.titulo,
                                    text: element.notificacion.mensaje
                                });
                                this.api.patch(`${environment.nomina}/api/notificaciondestinatarios/${element.id}`, {
                                    id: element.id,
                                    estado: 'Enviado'
                                }, config).catch((error: AxiosError) => {
                                    console.log(`error actualizando estado destinatario ${element.funcionario.numeroDocumento}`);
                                });
                                this.api.post(`${environment.nomina}/api/notificaciondestinatariologs`, {
                                    notificacionId: element.notificacionId,
                                    funcionarioId: element.funcionarioId,
                                    estado: 'Enviado'
                                }, config).catch((error: AxiosError) => {
                                    console.log(`error insertando log destinatario ${element.funcionario.numeroDocumento}`);
                                });
                            } else {
                                this.api.patch(`${environment.nomina}/api/notificaciondestinatarios/${element.id}`, {
                                    id: element.id,
                                    estado: 'Fallido'
                                }, config).catch((error: AxiosError) => {
                                    console.log(`error actualizando estado destinatario ${element.funcionario.numeroDocumento}`);
                                });
                                this.api.post(`${environment.nomina}/api/notificaciondestinatariologs`, {
                                    notificacionId: element.notificacionId,
                                    funcionarioId: element.funcionarioId,
                                    estado: 'Fallido',
                                    resultado: 'El usuario no registra aplicación'
                                }, config).catch((error: AxiosError) => {
                                    console.log(`error insertando log destinatario ${element.funcionario.numeroDocumento}`);
                                });
                            }
                        });
                        console.log('finally mobile:message');
                    })
                    .catch((error: AxiosError) => {
                        console.log("pailas")
                        console.log('finally mobile:message');
                    });
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }

    public async obtenerToken() {
        var token = ""
        await this.api.post(`${environment.nomina}/api/Autenticacion/login`, {
            cedula: usuario.cedula,
            clave: usuario.clave
        }).then((response: AxiosResponse) => {
            token = response.data.token

        }).catch((error: AxiosError) => {
            console.log(`error al obtener token`);
        });
        
        return token;
    }
}