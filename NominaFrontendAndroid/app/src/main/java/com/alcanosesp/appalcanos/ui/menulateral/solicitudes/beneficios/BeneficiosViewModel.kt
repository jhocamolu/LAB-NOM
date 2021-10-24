package com.alcanosesp.appalcanos.ui.menulateral.solicitudes.beneficios

import android.app.Application
import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.lifecycle.MutableLiveData
import com.alcanosesp.appalcanos.api.*
import com.alcanosesp.appalcanos.db.AppDatabase
import com.alcanosesp.appalcanos.db.entity.SolicitudBeneficio
import com.alcanosesp.appalcanos.model.ItemSpinner
import com.alcanosesp.appalcanos.utils.BaseViewModel
import com.alcanosesp.appalcanos.utils.opcionAxulioEducativoNombreC
import com.android.volley.VolleyError
import kotlinx.coroutines.launch
import org.json.JSONObject

class BeneficiosViewModel(application: Application) : BaseViewModel(application) {

    val db =  AppDatabase(getApplication())
    private val daoSolicitudBeneficio = db.solicitudBeneficioDao()

    val solicitudesBeneficios = MutableLiveData<List<SolicitudBeneficio>>()

    var listaTiposBeneficio : MutableLiveData<List<ItemSpinner>> = MutableLiveData()
    var listaPeriodosPago : MutableLiveData<List<ItemSpinner>> = MutableLiveData()

    var idTipoBeneficioSeleccionado: Int? = null
    var idPeriodoPagoSeleccionado: Int? = null
    var nombreOpcionAuxilioEducativoSeleccionado: String? = ""

    var permitePlazoMes: MutableLiveData<String> = MutableLiveData() //: String? = "null"
    var permitePeriodoPago: MutableLiveData<String> = MutableLiveData()// : String? = "null"
    var permiteValorSolicitado: MutableLiveData<String> = MutableLiveData()//permiteValorSolicitado : String? = "null"
    var permiteValorAutorizado: MutableLiveData<String> = MutableLiveData()
    var permiteAuxilioEducativo: MutableLiveData<String> = MutableLiveData()// : String? = "null"
    var permitePermisoEstudio: MutableLiveData<String> = MutableLiveData()// : String? = "null"

    /*
    var permitePlazoMesS:String? = "null"
    var permitePeriodoPagoS: String? = "null"
    var permiteValorSolicitadoS:String? = "null"
    var permiteAuxilioEducativoS: String? = "null"
    var permitePermisoEstudioS: String? = "null"
    */


    var adjuntos =  mutableListOf<HashMap<String, String>>()

    var periodicidades =  mutableListOf<HashMap<String, String>>()
    var periodicidad =  mutableListOf<HashMap<String, String>>()
    //var periodicidadesSeleccionadasBeneficio = mutableListOf<HashMap<String, String>>()
    var periodicidadesSeleccionadasBeneficio = mutableListOf<String>()

    //Adjuntos para descargar al visualizar
    var beneficioAdjuntos = MutableLiveData<List<HashMap<String, String>>>()

    //Adjuntos para crear o editar
    var adjuntosBeneficio = MutableLiveData<List<HashMap<String, String>>>()

    var periodicidadesBeneficio = MutableLiveData<List<HashMap<String, String>>>()
    var periodicidadBeneficio = MutableLiveData<List<HashMap<String, String>>>()

    fun obtenerSolicitudes(){
        launch {
            solicitudesBeneficios.value = daoSolicitudBeneficio.obtenerSolicitudes()
        }
    }

    fun insertarSolicitud(solicitudBeneficio: SolicitudBeneficio){
        launch {
            daoSolicitudBeneficio.insertarSolicitud(solicitudBeneficio)
        }
    }

    fun eliminarSolicitudes(){
        launch {
            daoSolicitudBeneficio.eliminarSolicitudes()
        }
    }

    fun obtenerTiposBeneficioApi(){
        val lista: ArrayList<ItemSpinner> = ArrayList()

        val callbackTiposBeneficio = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")

                for (i in 0 until valueArr.length()) {
                    val item = valueArr.getJSONObject(i)
                    lista.add(ItemSpinner(item))
                }
                listaTiposBeneficio.value = lista
            }

            override fun error(error: VolleyError) {
            }
        }
        obtenerTiposBeneficio(getApplication(), callbackTiposBeneficio)
    }

    fun tipoBeneficioSeleccionado(id: Int?){
        idTipoBeneficioSeleccionado = if (id == 0){
            null
        }else{
            id
        }
    }

    fun obtenerPeriodosPagoApi(){
        val lista: ArrayList<ItemSpinner> = ArrayList()

        val callbackPeriodosPago = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")

                for (i in 0 until valueArr.length()) {
                    lista.add(ItemSpinner(valueArr.getJSONObject(i)))
                }
                listaPeriodosPago.value = lista
            }

            override fun error(error: VolleyError) {
            }
        }
        obtenerPeriodosPago(getApplication(), callbackPeriodosPago)
    }

    fun periodoPagoSeleccionado(id: Int?){
        idPeriodoPagoSeleccionado = if (id == 0){
            null
        }else{
            id
        }
    }

    fun opcionAuxilioSeleccionado(s: String?){
        nombreOpcionAuxilioEducativoSeleccionado = opcionAxulioEducativoNombreC[s]
    }

    fun obtenerParametrosTipoBeneficio(){
        val callbackTipoBeneficio = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")
                Log.i("RESPUESTAB", respuesta.toString())

                for (i in 0 until valueArr.length()) {
                    val item = valueArr.getJSONObject(i)

                    permitePlazoMes(item.getString("plazoMes"))
                    permitePeriodoPago(item.getString("periodoPago"))
                    permiteValorSolicitado(item.getString("valorSolicitado"))
                    permiteAuxilioEducativo(item.getString("permiteAuxilioEducativo"))
                    permitePermisoEstudio(item.getString("permisoEstudio"))
                    permiteValorAutorizado(item.getString("valorAutorizado"))
                }
            }

            override fun error(error: VolleyError) {
            }
        }
        obtenerTipoBeneficio(getApplication(), callbackTipoBeneficio, idTipoBeneficioSeleccionado!!)
    }

    /*fun obtenerAdjuntosBeneficioApi(id: Int?){
        Log.i("RESPUESTAB", "HASHA")
        val callbackAdjuntosBeneficio = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                adjuntos.clear()
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")
                for (i in 0 until valueArr.length()) {
                    val item = valueArr.getJSONObject(i)

                    val adjunto = HashMap<String, String>().apply {
                        put("nombre", item.getString("nombre"))
                        put("adjunto", item.getString("adjunto"))
                    }

                    adjuntos.add(adjunto)
                }
                adjuntosBeneficio.value = adjuntos
            }

            override fun error(error: VolleyError) {
                Log.i("RESPUESGFJ", "HASHA")
            }
        }
        obtenerAdjuntosBeneficio(getApplication(), callbackAdjuntosBeneficio, id!!)
    }*/

    //NADA
    fun obtenerBeneficioAdjuntosApi(id: Int?){
        Log.i("RESPUESTAB", "HASHA")
        val callbackAdjuntosBeneficio = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                adjuntos.clear()
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")
                for (i in 0 until valueArr.length()) {
                    val item = valueArr.getJSONObject(i)

                    val adjunto = HashMap<String, String>().apply {
                        put("nombre", item.getJSONObject("tipoBeneficioRequisito").getJSONObject("tipoSoporte").getString("nombre"))
                        put("adjunto", item.getString("adjunto"))
                    }

                    adjuntos.add(adjunto)
                }
                beneficioAdjuntos.value = adjuntos
            }

            override fun error(error: VolleyError) {
                Log.i("RESPUESGFJ", "HASHA")
            }
        }
        obtenerBeneficioAdjuntos(getApplication(), callbackAdjuntosBeneficio, id!!)
    }

    fun obtenerRequisitosBeneficioApi(id: Int?){
        val callbackRequisitosBeneficio = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                adjuntos.clear()
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")
                for (i in 0 until valueArr.length()) {
                    val item = valueArr.getJSONObject(i)

                    val adjunto = HashMap<String, String>().apply {
                        put("id", item.getString("id"))
                        put("nombre", item.getJSONObject("tipoSoporte").getString("nombre"))
                        put("adjunto", "")
                        put("beneficioAdjunto", "")
                    }

                    Log.i("requisito", "nombre ".plus(adjunto["nombre"]))

                    adjuntos.add(adjunto)
                }
                adjuntosBeneficio.value = adjuntos
            }

            override fun error(error: VolleyError) {
                Log.i("RESPUESGFJ", "HASHA")
            }
        }
        obtenerRequisitosTipoBeneficio(getApplication(), callbackRequisitosBeneficio, id!!)
    }

    fun obtenerRequisitoBeneficioAdjuntoApi(id: Int?){
        val callbackRequisitoBeneficioAdjunto = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                adjuntos.clear()
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")
                for (i in 0 until valueArr.length()) {
                    val item = valueArr.getJSONObject(i)

                    if (!item.isNull("tipoBeneficioRequisitoid")){
                        val adjunto = HashMap<String, String>().apply {
                            put("id", item.getString("tipoBeneficioRequisitoid"))
                            put("nombre", item.getString("nombre"))
                            put("adjunto", item.getString("adjunto"))
                            put("beneficioAdjunto", item.getString("beneficioAdjuntoId"))
                        }
                        adjuntos.add(adjunto)
                    }
                }
                adjuntosBeneficio.value = adjuntos
            }

            override fun error(error: VolleyError) {
                Log.i("RESPUESGFJ", "HASHA")
            }
        }
        obtenerRequisitoBeneficioAdjunto(getApplication(), callbackRequisitoBeneficioAdjunto, id!!)
    }

    fun obtenerPeriodicidadBeneficioApi(id: Int?){
        Log.i("RESPUESTAB", "HASHA")
        val callbackPeriodicidadBeneficio = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                Log.i("JSBG", respuesta.toString())
                periodicidad.clear()
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")
                for (i in 0 until valueArr.length()) {
                    val item = valueArr.getJSONObject(i)

                    val periodo = HashMap<String, String>().apply {
                        Log.i("LMRQ", item.getString("nombre"))
                        put("id", item.getString("id"))
                        put("nombre", item.getString("nombre"))
                    }

                    periodicidad.add(periodo)
                }
                periodicidadBeneficio.value = periodicidad
            }

            override fun error(error: VolleyError) {
                Log.i("RESPUESGFJ", "HASHA")
            }
        }
        obtenerPeriodicidad(getApplication(), callbackPeriodicidadBeneficio, id!!)
    }

    fun obtenerPeriodicidadesBeneficioApi(id: Int?){
        Log.i("RESPUESTAB", "HASHA")
        val callbackPeriodicidadesBeneficio = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                Log.i("JSBG", respuesta.toString())
                periodicidades.clear()
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")
                for (i in 0 until valueArr.length()) {
                    val item = valueArr.getJSONObject(i)

                    val periodo = HashMap<String, String>().apply {
                        Log.i("LMRQ", item.getJSONObject("subPeriodo").getString("nombre"))
                        put("id", item.getJSONObject("subPeriodo").getString("id"))
                        put("nombre", item.getJSONObject("subPeriodo").getString("nombre"))
                    }

                    periodicidades.add(periodo)
                }
                periodicidadesBeneficio.value = periodicidades
            }

            override fun error(error: VolleyError) {
                Log.i("RESPUESGFJ", "HASHA")
            }
        }
        obtenerPeriodicidadesBeneficio(getApplication(), callbackPeriodicidadesBeneficio, id!!)
    }

    fun agregarPeriodicidad(i: Int){
        periodicidadesSeleccionadasBeneficio.add(periodicidadBeneficio.value!![i]["id"]!!)
    }

    fun verificarPeriodicidad(nombre: String?): Boolean{
        for (i in periodicidades.indices){
            if (periodicidades[i]["nombre"].equals(nombre)) return true
        }
        return false
    }

    fun adjuntarDocumento(i: Int,  objId: String){
        //requisitoBeneficioAdjunto.value!![i][adjunto!!] = objId
        //requisitoBeneficioAdjunto.value!![i].put(adjunto!!, objId)
        adjuntosBeneficio.value!![i].put("adjunto", objId)

        Log.i("Jesus", adjuntosBeneficio.value!![i]["adjunto"].toString())
    }

    fun verAdjuntos(){
        for(i in adjuntosBeneficio.value!!.indices){
            println("id: " + adjuntosBeneficio.value!![i]["id"].toString())
            println("nombre: " +adjuntosBeneficio.value!![i]["nombre"].toString())
            println("objId: " + adjuntosBeneficio.value!![i]["adjunto"].toString())
            println("rId: " + adjuntosBeneficio.value!![i]["beneficioAdjunto"].toString())
        }
    }

    fun permiteValorSolicitado(s: String?){
        permiteValorSolicitado.value = s
        //permiteValorSolicitadoS = s
    }
    fun permiteValorAutorizado(s: String?){
        permiteValorAutorizado.value = s
    }
    fun permitePlazoMes(s: String?){
        permitePlazoMes.value = s
        //permitePlazoMesS = s
    }
    fun permitePeriodoPago(s: String?){
        permitePeriodoPago.value = s
        //permitePeriodoPagoS = s
    }
    fun permiteAuxilioEducativo(s: String?){
        permiteAuxilioEducativo.value = s
        //permiteAuxilioEducativoS = s
    }
    fun permitePermisoEstudio(s: String?){
        permitePermisoEstudio.value = s
        //permitePermisoEstudioS = s
    }

    fun yina():Int{
        return idPeriodoPagoSeleccionado!!
    }
}