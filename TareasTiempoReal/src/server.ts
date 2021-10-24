import express from 'express';
import cors from 'cors';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import { AppSocket } from './socket';


export class AppServer {
    public static readonly PORT: number = 3000;
    private app: express.Application;
    private server: http.Server;
    private appSocket: AppSocket;
    private port?: string | number;


    constructor() {
        // create app
        this.app = express();
        this.app.use(express.json());
        this.app.use(cors());
        // config
        this.port = process.env.PORT || AppServer.PORT;
        // create server http
        //this.server = http.createServer(this.app);
        // create server https
        this.server = https.createServer({
              key: fs.readFileSync('/etc/ssl/private/ghestic.key'), 
              cert: fs.readFileSync('/etc/ssl/certs/certghestic.pem'),
              passphrase: 'Alcanos.2021'
            },this.app);
        // create socket
        this.appSocket = new AppSocket(this.server);
        this.listen();
    }



    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });
        this.appSocket.listen();

    }

    public getApp(): express.Application {
        return this.app;
    }
}