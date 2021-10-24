package com.alcanosesp.appalcanos.ui.menulateral.consultas.certificados_desprendibles

import android.app.Application
import android.content.Context
import android.net.Uri
import android.os.Environment
import android.util.Base64
import androidx.core.content.FileProvider
import androidx.lifecycle.MutableLiveData
import com.alcanosesp.appalcanos.api.IRespuestaServidor
import com.alcanosesp.appalcanos.api.obtenerCertificado
import com.alcanosesp.appalcanos.utils.BaseViewModel
import com.android.volley.VolleyError
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

class CertificadoLaboralViewModel(application: Application) :BaseViewModel(application){
    val uriPdf = MutableLiveData<Uri>()
    var mensajeDialogoError = MutableLiveData<String?>()


    fun obtenerCertificacoApi(url:String, titulo:String,context: Context) {
        val callCertificado = object : IRespuestaServidor {

            override fun exito(respuesta: Any?) {
                val storageDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
                val dwldsPath = File(storageDir?.toURI()?.path +titulo + ".pdf")
                val pdfAsBytes = Base64.decode(respuesta.toString(), 0)

                val os = FileOutputStream(dwldsPath, false).apply {
                    write(pdfAsBytes)
                    flush()
                    close()
                }

                uriPdf.value = FileProvider.getUriForFile(
                    context!!,
                    "com.alcanosesp.fileprovider",
                    dwldsPath
                )


            }

            override fun error(error: VolleyError) {
                var codigo = error.networkResponse?.statusCode
                if (codigo == null) {
                    codigo = 404
                }
                mensajeDialogoError.value = "$codigo Error al obtener certificado"
            }
        }
        obtenerCertificado(
            context!!,
            callCertificado,
            url
        )
    }
}