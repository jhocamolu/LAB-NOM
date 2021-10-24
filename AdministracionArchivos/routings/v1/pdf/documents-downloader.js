// Config
const logger = require("../../../config/logger.config");
const config = require("../../../config/config");
const puppeteer = require("puppeteer");
var request = require("request");

module.exports = router => {
  router.get("/crear", (req, res) => {
    let { grupo, documento } = req.query;

    request(
      config.nomina + "/api/crearpdf/" + grupo + "/" + documento,
      { json: true },
      (err, response, body) => {
        if (err) {
          return console.log(err);
        }
        
        (async () => {
          const browser = await puppeteer.launch();
          const page = await browser.newPage();
          //await page.goto(res.render(response.body.cuerpo));
          var style = "";
          
          var cadena = response.body.encabezado;
          var encabezado = cadena.replace(/figure/g, "div");
          encabezado = encabezado.replace(/<img/g, '<img width="100px" heigth="100px"');

          cadena = response.body.pie;
          var pie = cadena.replace(/figure/g, "div");
          pie = pie.replace(/<img/g, '<img width="100px" heigth="100px" style="align: center; vertical-align:middle"');

          cadena = response.body.cuerpo;
          var cuerpo = cadena.replace(/figure/g, "div");
          cuerpo = cuerpo.replace(/<table/g, '<table class="table"');

          await page.setContent(
            `<html>
            <head>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
            </head>
            <body class="text-justify" style="font-size:16px;">${cuerpo}</body>
            </html> `
          );
          const buffer = await page.pdf({
            format: "A4",
            displayHeaderFooter: true,
            footerTemplate: `<div style="width:100%; font-size:16px;text-align: center; position:relative;">${pie}</div>`,
            headerTemplate: `<div style="width:100%; font-size:16px;text-align: center; position:relative;">${encabezado}</div>`,
            margin: {
              top: 165,
              right: 80,
              left: 80,
              bottom: 80
            }
          });
          res.type("application/pdf");
          res.send(buffer);
          browser.close();
        })();
      }
    );
  });
};
