package com.alcanosesp.appalcanos.ui.menulateral.consultas.ingresos_retenciones

import android.app.Application
import android.util.Log
import androidx.lifecycle.MutableLiveData
import com.alcanosesp.appalcanos.api.IRespuestaServidor
import com.alcanosesp.appalcanos.api.obtenerAnioVigente
import com.alcanosesp.appalcanos.api.obtenerCertificadoRetenciones
import com.alcanosesp.appalcanos.utils.BaseViewModel
import com.android.volley.VolleyError
import org.json.JSONArray
import org.json.JSONObject

class CertificadoRetencionesViewModel(application: Application) : BaseViewModel(application) {

    val annioVIgencia = MutableLiveData<JSONObject>()
    val certificado = MutableLiveData<JSONObject>()
    val mensajeDialogoError = MutableLiveData<String>()


    fun obtenerCertificadoRetencionesApi(idAnioVigente :Int) {

        val callbackDesprendibles = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                Log.i("exito", respuesta.toString())
                val json = JSONObject(respuesta.toString())
                val errorMensaje: String? = json.optString("message")
                if (errorMensaje == null || errorMensaje == "") {
                    certificado.value = JSONObject(respuesta.toString())
                }else {
                    mensajeDialogoError.value = errorMensaje.toString().substring(0, 88)
                }
            }

            override fun error(error: VolleyError) {
                var codigo = error.networkResponse?.statusCode
                if (codigo == null) {
                    codigo = 404
                }
                mensajeDialogoError.value =
                    "$codigo Error al obtener certificado ingreso y retenciones."
            }
        }

        val parametros = JSONObject().apply {
            put("annio", idAnioVigente)
        }
        obtenerCertificadoRetenciones(getApplication(), callbackDesprendibles, parametros)
    }

    fun obtenerAnioVigenteApi() {
        val callbackAnnioVigencia = object : IRespuestaServidor {

            override fun exito(respuesta: Any?) {
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getString("value")
                if(valueArr!="[]"){
                    val data = JSONArray(valueArr)[0].toString()
                    annioVIgencia.value = JSONObject(data)
                }else{
                    mensajeDialogoError.value = "Error, no hay un año vigente en el sistema."
                }
            }

            override fun error(error: VolleyError) {
                var codigo = error.networkResponse?.statusCode
                if (codigo == null) {
                    codigo = 404
                }
                mensajeDialogoError.value = "$codigo Error al obtener año vigente."
            }
        }
        obtenerAnioVigente(getApplication(), callbackAnnioVigencia)
    }
}


