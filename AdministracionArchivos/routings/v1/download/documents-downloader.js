// Config
const logger = require('../../../config/logger.config')

// Logic
const mongoose = require('mongoose')
const fs = require('fs')
const Grid = require('gridfs-stream')
const fileType = require('file-type')

//models
const Files = require('../../../models/files.model')

module.exports = router => {
  const conn = mongoose.connection
  Grid.mongo = mongoose.mongo
  let gfs

  conn.once('open', () => {
    gfs = Grid(conn.db)

        router.get('/home', (req, res) => {
            Files.find()
                .exec()
                .then(files => {
                    let uploadedFiles = files.map(file => ({
                        file_name: file.name,
                        file_type: file.type,
                        file_link: `http://${req.headers.host}/v1/bucket/download?document_id=${file.doc_id}`
                    }));
                    res.json({
                        success: true,
                        uploadedFiles
                    })
                })
                .catch(err => {
                    logger.error(`[*] Error, al obtener todos los archivos cargados:  ${err}`);
                    res.status(400).send({
                        message: `Error, al obtener todos los archivos cargados: ${err}`
                    });
                });
        });

        router.get('/bucket/download', (req, res) => {
            let {
                document_id
            } = req.query;
            gfs.findOne({
                _id: document_id
            }, (err, file) => {
                if (!file) {
                    return res.status(404).send({
                        message: 'Archivo no encontrado'
                    });
                }
                let data = [];
                let readstream = gfs.createReadStream({
                    filename: file.filename
                });
                readstream.on('data', (chunk) => {
                    data.push(chunk);
                });
                readstream.on('end', () => {
                    data = Buffer.concat(data);
                    let type = fileType(data);
                    res.writeHead(200, {
                        'Content-Type': type.mime,
                        'Content-disposition': 'attachment; filename=' + file.filename + '.' + type.ext,
                        'Content-Length': file.length
                    });
                    res.end(data);
                });
                readstream.on('error', (err) => {
                    logger.error(`[*] Error al descargar un archivo:  ${err}`);
                    res.status(400).send({
                        message: `Error al descargar un archivo:  ${err}`
                    });
                });
            });
        });
    });
}
