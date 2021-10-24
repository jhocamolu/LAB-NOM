package com.alcanosesp.appalcanos.ui.menulateral.consultas.desprendibles

import android.app.Application
import android.net.Uri
import androidx.lifecycle.MutableLiveData
import com.alcanosesp.appalcanos.App
import com.alcanosesp.appalcanos.api.IRespuestaServidor
import com.alcanosesp.appalcanos.api.obtenerDesprendible
import com.alcanosesp.appalcanos.api.obtenerDesprendibles
import com.alcanosesp.appalcanos.model.Desprendible
import com.alcanosesp.appalcanos.utils.BaseViewModel
import com.android.volley.VolleyError
import org.json.JSONObject

class DesprendiblesViewModel(application: Application) : BaseViewModel(application) {

    val desprendibleURi = MutableLiveData<Uri>()
    var mensajeDialogoError = MutableLiveData<String?>()
    var listaDesprendibles = MutableLiveData<ArrayList<Desprendible>?>()

    fun obtenerDesprendiblesApi() {
        val callbackDesprendibles = object : IRespuestaServidor {

            override fun exito(respuesta: Any?) {
                var lista = ArrayList<Desprendible>()
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")

                if (valueArr.length() != 0) {
                    for (i in 0 until valueArr.length()) {
                        val item = valueArr.getJSONObject(i)
                        val desprendible = Desprendible(item)
                        lista.add(desprendible)
                    }
                    listaDesprendibles.value = lista
                } else {
                    listaDesprendibles.value = null
                }
            }

            override fun error(error: VolleyError) {
                var codigo = error.networkResponse?.statusCode
                if (codigo == null) {
                    codigo = 404
                }
                mensajeDialogoError.value = "$codigo Error al obtener listado de desprendible."
            }
        }
        obtenerDesprendibles(getApplication(), callbackDesprendibles, App.idFuncionario.toString())
    }

    fun descargardesprendibleApi(parametros: JSONObject) {
        val callbackDesprendible = object : IRespuestaServidor {

            override fun exito(respuesta: Any?) {
                val json = JSONObject(respuesta.toString())
                val errorMensaje: String? = json.optString("message")
                if (errorMensaje == null || errorMensaje == "") {
                    desprendibleURi.value =
                        Uri.parse(json.getString("url").plus(json.getString("file")))
                    /*"url": "http://nomintegra.alcanosesp.com:9009", "file": "/public/desprendibledepago_20200706222935.pdf"*/
                } else {
                    mensajeDialogoError.value = errorMensaje.toString().substring(0, 88)
                }
            }

            override fun error(error: VolleyError) {
                var codigo = error.networkResponse?.statusCode
                if (codigo == null) {
                    codigo = 404
                }
                mensajeDialogoError.value = "$codigo Error al obtener el desprendible."
            }
        }

        obtenerDesprendible(getApplication(), callbackDesprendible, parametros)
    }
}