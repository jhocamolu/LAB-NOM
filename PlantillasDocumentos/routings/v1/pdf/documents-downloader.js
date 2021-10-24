// Config
const logger = require('../../../config/logger.config')
const config = require('../../../config/config')
const puppeteer = require('puppeteer')
const path = require('path')
var request = require('request')
var fs = require('fs')
const pfxFilePath = path.resolve(
  __dirname,
  '../../../ssl/nomintegra.alcanosesp.com.pfx'
)

var styleEncabezadoPie = `<style>
            table {
              border-collapse: collapse; 
              position:relative; 
              width:80%; 
              left:10%;
              table-layout: fixed;
            }
            .tablaPie td, th{
              border: 0px solid black; 
            }
          
            td, th {
              border: 0px solid black; 
              font-family:Arial;
              font-size:8px;
            }
            .center-in-content{
              margin: 0 auto;
          }
          </style>`

module.exports = router => {
  router.get('/crear', (req, res) => {

    //console.log(res);
    let { grupo, documento, membrete } = req.query
    var url =
      config.apiPlantillas +
      '/api/crearpdf/documento/' +
      grupo +
      '/informacion/' +
      documento
    console.log(url)
      /** Intersecto y envio token */
    var options = {
      json: true,
      headers: {
        JwtToken: req.headers['jwttoken']
      }     
    };
    var dato;
    request(url, options, (err, respuesta, body) => {
      if (err) {
        console.log(err)
        res.send('{error : "Error en el servidor" }')
      }
      if (body.message) {
        res.send('{error : "' + body.message + '" }')
      }
      dato = body;
      (async () => {
        try {
          const browser = await puppeteer.launch({
            //headless: true,
            args: ['--no-sandbox']
          })
          const page = await browser.newPage()
          var margen = {
            right: '2cm',
            left: '2cm'
          }
          if (membrete == 'true') {
            margen.bottom = '4cm'
            margen.top = '4cm'
            var verEncabezadoPie = false
          } else {
            var verEncabezadoPie = true
            margen.bottom = dato.pieAlto ? dato.pieAlto + 'cm' : '4cm'
            margen.top = dato.encabezadoAlto
              ? dato.encabezadoAlto + 'cm'
              : '4cm'
          }
          //console.log(dato);
          var cadena = dato.encabezado
          if (cadena != 'null') {
            var encabezado = cadena.replace(
              /<figure/g,
              `<div class="center-in-content encabezado"`
            )
            encabezado = encabezado.replace(
              /<img/g,
              '<img width="100%" heigth="auto"'
            )
            encabezado = encabezado.replace(
              /font-size:[\d]+px;/g,
              'font-size:10px;'
            )
          }

          var cadena = dato.pie
          if (cadena != 'null') {
            var pie = cadena.replace(
              /<figure/g,
              `<div class="center-in-content pie"`
            )
            pie = pie.replace(/<img/g, '<img width="100%" heigth="auto"')
            pie = pie.replace(/font-size:[\d]+px;/g, 'font-size:8px;')
            pie = pie.replace(/<table/g, '<table class="tablaPie"')
          }

          var cadena = dato.cuerpo
          var cuerpo = cadena.replace(/figure/g, `div clas="cuerpo"`)
          cuerpo = cuerpo.replace(
            /<alcanos>/g,
            '<span style="font-size:12px;font-family:Arial;">'
          )
          cuerpo = cuerpo.replace(/<\/alcanos>/g, '</span>')
          cuerpo = cuerpo.replace(
            /font-family:Arial, Helvetica, sans-serif;/g,
            'font-family:Arial;'
          )
          cuerpo = cuerpo.replace(/font-size:[\d]+px;/g, 'font-size:12px;')

          await page.setContent(
            `<html>
                            <body>${cuerpo}</body>
                          </html> `
          )
          await page.addStyleTag({ path: 'styles/stylePdf.css' })
          console.log(cuerpo)
          const buffer = await page.pdf({
            format: 'Letter',
            displayHeaderFooter: verEncabezadoPie,
            footerTemplate: `${styleEncabezadoPie}${pie}`,
            headerTemplate: encabezado,
            margin: margen
          })
          res.type('application/pdf')
          res.send(buffer)
          browser.close()
        } catch (e) {
          console.log(e)
          res.send('{error : "Error en el servidor"}')
        }
      })()
    })
  })
}
