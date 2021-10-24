package com.alcanosesp.appalcanos.ui.menulateral.incapacidades

import android.app.Application
import android.os.Handler
import androidx.lifecycle.MutableLiveData
import com.alcanosesp.appalcanos.App
import com.alcanosesp.appalcanos.api.*
import com.alcanosesp.appalcanos.db.AppDatabase
import com.alcanosesp.appalcanos.db.entity.AusentismoFuncionario
import com.alcanosesp.appalcanos.model.ItemAutocompletable
import com.alcanosesp.appalcanos.model.ItemSpinner
import com.alcanosesp.appalcanos.utils.BaseViewModel
import com.alcanosesp.appalcanos.utils.JSONValidador
import com.android.volley.VolleyError
import kotlinx.coroutines.launch
import org.json.JSONObject

class IncapacidadViewModel(application: Application) : BaseViewModel(application) {
    val db = AppDatabase(getApplication())
    private val daoAusentismoFuncionario = db.ausentismoFuncionarioDao()
    val incapacidad = MutableLiveData<List<AusentismoFuncionario>>()
    var mensajeDialogoErrorIncapacidad = MutableLiveData<String?>()
    var redireccionar = MutableLiveData<Boolean>()

    var listaDiagnosticoCie: MutableLiveData<List<ItemAutocompletable>>? = MutableLiveData()
    var idDiagnosticoCieSeleccionado: Int? = null
    var listaTipoIncapacidad: MutableLiveData<List<ItemSpinner>> = MutableLiveData()
    var idTipoIncapacidadSeleccionado: Int? = null
    var listaProrrogaDe: MutableLiveData<List<ItemSpinner>> = MutableLiveData()
    var idProrrogaDeSelecionda: Int? = null
    var listaIdIncapacidades : MutableLiveData<List<Int>> = MutableLiveData()

    fun obtenerIncapacidad() {
        launch {
            incapacidad.value = daoAusentismoFuncionario.obtenerAusentismoFuncionario()
        }
    }

    fun obtenerListaIdIncaPacidades() {
        launch {
            listaIdIncapacidades.value = daoAusentismoFuncionario.obtenerIdIncaPacidades()
        }
    }

    fun insertarIncapacidad(incapacidad: AusentismoFuncionario) {
        launch {
            daoAusentismoFuncionario.insertarAusentismoFuncionario(incapacidad)
        }
    }

    fun actualizarIncapacidadProroga(prorroga:String, ausentimosId:Int) {
        launch {
            daoAusentismoFuncionario.actualizarProrrogaAusentismoFuncionario(prorroga, ausentimosId)
        }
    }

    fun eliminarIncapacidad() {
        launch {
            daoAusentismoFuncionario.eliminarAusentismoFuncionario()
        }
    }

    fun obtenerDiagnosticoCieApi(like: CharSequence) {
        val callbackDiagnostico = object : IRespuestaServidor {

            override fun exito(respuesta: Any?) {
                val lista: ArrayList<ItemAutocompletable> = ArrayList()
                lista.clear()

                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")

                for (i in 0 until valueArr.length()) {
                    val item = valueArr.getJSONObject(i)
                    lista.add(ItemAutocompletable(item, "id", "codigo", "nombre"))
                }

                listaDiagnosticoCie?.value = lista
            }

            override fun error(error: VolleyError) {
            }
        }

        obtenerDiagnosticoCie(getApplication(), callbackDiagnostico, like)
    }

    fun diagnosticoCieSeleccionadoSeleccionado(id: Int?) {
        idDiagnosticoCieSeleccionado = id
    }


    fun obtenerTipoIncapacidadApi() {
        val lista: ArrayList<ItemSpinner> = ArrayList()

        val callbackTipoIncapacidad = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")

                for (i in 0 until valueArr.length()) {
                    val item = valueArr.getJSONObject(i)
                    lista.add(ItemSpinner(item))
                }
                listaTipoIncapacidad.value = lista
            }

            override fun error(error: VolleyError) {
            }
        }
        obtenerTipoIncapaciad(getApplication(), callbackTipoIncapacidad)
    }

    fun tipoIncapacidadSeleccionada(id: Int?) {
        idTipoIncapacidadSeleccionado = id
    }


    fun obtenerProrrogaDeApi(fechaInicio: String, idFuncionario: Int) {
        val lista: ArrayList<ItemSpinner> = ArrayList()

        val callbackIncapacidadAPrrorogar = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")

                for (i in 0 until valueArr.length()) {
                    val item = valueArr.getJSONObject(i)
                    lista.add(ItemSpinner(item, "prorrogaDe"))
                }
                listaProrrogaDe.value = lista
            }

            override fun error(error: VolleyError) {
            }
        }

        obtenerIncapaciadProrrogaPorFecha(
            getApplication(),
            fechaInicio,
            idFuncionario,
            callbackIncapacidadAPrrorogar
        )
    }

    fun prorrogaDeSeleccionada(id: Int?) {
        idProrrogaDeSelecionda = id
    }

    fun obtenerIncapacidadApi(redirecionar :Boolean = false) {
        val callbackIncapacidad = object : IRespuestaServidor {

            override fun exito(respuesta: Any?) {
                eliminarIncapacidad()

                var filtro = " or ausentismoId eq "
                // filtro += " or ausentismoId eq " + item.getString("id")
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")
                val numroIncapacidades = valueArr.length() - 1

                    for (i in 0 until valueArr.length()) {
                        val item = valueArr.getJSONObject(i)
                        val incapacidad = AusentismoFuncionario(item)
                        insertarIncapacidad(incapacidad)

                        filtro += " or ausentismoId eq " + item.getString("id")
                        if (numroIncapacidades == i) {
                            obtenerPrrorrogasApi(filtro.replace("or ausentismoId eq  or ", " "))
                        }
                    }

                val handler = Handler()
                handler.postDelayed(
                    {
                        obtenerIncapacidad()
                        if (redirecionar){
                            redireccionar.value = true
                        }
                    }, 2000)
            }

            override fun error(error: VolleyError) {
                var codigo = error.networkResponse?.statusCode
                if (codigo == null) {
                    codigo = 404
                }
                mensajeDialogoErrorIncapacidad.value = "$codigo Error al obtener incapacidades."
            }
        }
        obtenerIncapacidad(
            getApplication(),
            callbackIncapacidad,
            App.idFuncionario.toString()
        )
    }

    private fun obtenerPrrorrogasApi(filtro: String) {

        val callbackCancelarIncapacidad = object : IRespuestaServidor {

            override fun exito(respuesta: Any?) {
                val validador = JSONValidador()
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")
                for (i in 0 until valueArr.length()) {

                    val item = valueArr.getJSONObject(i)
                    val ausentismoId = item.getString("ausentismoId")

                    val codigo = validador.jsonNuloSegundoGrado(
                        item,
                        "prorroga",
                        "diagnosticoCie",
                        "codigo"
                    )
                    val nombre = validador.jsonNuloSegundoGrado(
                        item,
                        "prorroga",
                        "diagnosticoCie",
                        "nombre"
                    )
                    val fechaFinal = validador.jsonNuloPrimerGrado(item, "prorroga", "fechaFin")

                    val prorroga ="$codigo - $nombre - $fechaFinal"

                    actualizarIncapacidadProroga(prorroga, ausentismoId.toInt())
                }
            }

            override fun error(error: VolleyError) {
            }
        }
        obtenerIncapaciadProrrogaPorId(getApplication(), filtro, callbackCancelarIncapacidad)
    }

    fun cancelarIncapacidadApi() {

        val parametros = JSONObject().apply {
            put("id", App.incapacidad?.id)
            put("aprobado", false)
            put("justificacion", "Eliminado por el usuario desde el dispositivo movil.")
        }
        val callbackCancelarIncapacidad = object : IRespuestaServidor {

            override fun exito(respuesta: Any?) {
                obtenerIncapacidadApi(true)
            }

            override fun error(error: VolleyError) {
                var codigo = error.networkResponse?.statusCode
                if (codigo == null) {
                    codigo = 404
                }
                mensajeDialogoErrorIncapacidad.value = "$codigo Error al cancelar incapacidad, intenta de nuevo.."
            }
        }
        cancelarIncapacidad(
            getApplication(),
            App.incapacidad?.id!!,
            parametros,
            callbackCancelarIncapacidad
        )
    }


}