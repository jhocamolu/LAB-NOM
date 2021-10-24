// Config
const config = require('../../../config/config')
const logger = require('../../../config/logger.config')

// Logic
const mongoose = require('mongoose')
const fs = require('fs')
const Grid = require('gridfs-stream')

//models
const Files = require('../../../models/files.model')

module.exports = router => {
    const conn = mongoose.connection;
    Grid.mongo = mongoose.mongo;
    let gfs;

    conn.once("open", () => {
        gfs = Grid(conn.db);

        router.delete('/bucket/delete', (req, res) => {
            let {
                document_id
            } = req.query;

            Files.findOne({
                doc_id: document_id
            }, (err, file) => {
                if (!file) {
                    return res.status(404).send({
                        message: 'Archivo no encontrado'
                    });
                }
                    let doc_id=file._doc._id;
                    file.remove({ _id : doc_id })
                    gfs.findOne({
                            _id: document_id
                        }, (err, file) => {
                        if (!file) {
                            return res.status(404).send({
                                message: 'Archivo no encontrado'
                            });
                        }
                        let data = [];
                        
                        let eliminar = gfs.remove({ _id: document_id });

                        res.json({
                            success: true,
                            message: "Archivo eliminado",
                            object_id: document_id
                        })
                    });
            });

        });
    });
}
