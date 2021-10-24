package com.alcanosesp.appalcanos.ui.menulateral.datos_personales.datos_basicos

//278
import android.app.Application
import android.graphics.Bitmap
import android.util.Log
import androidx.lifecycle.MutableLiveData
import com.alcanosesp.appalcanos.App
import com.alcanosesp.appalcanos.R
import com.alcanosesp.appalcanos.api.*
import com.alcanosesp.appalcanos.db.AppDatabase
import com.alcanosesp.appalcanos.db.entity.Funcionario
import com.alcanosesp.appalcanos.model.ItemSpinner
import com.alcanosesp.appalcanos.utils.BaseViewModel
import com.alcanosesp.appalcanos.utils.bitMapToString
import com.android.volley.VolleyError
import kotlinx.coroutines.launch
import org.json.JSONObject

class BasicosViewModel(application: Application) : BaseViewModel(application) {

    private val db = AppDatabase(getApplication())
    private val dao = db.funcionarioDao()

    val abrirMenulateral = MutableLiveData<Boolean>()
    var mensajeDialogoError = MutableLiveData<String?>()

    val funcionario = MutableLiveData<Funcionario>()
    val funcionarioFoto = MutableLiveData<String?>()

    private var cedulaFuncionario: String? = null

    var listaTiposVivienda: MutableLiveData<List<ItemSpinner>> = MutableLiveData()
    var idViviendaSeleccionada: Int? = null

    var listaPaises: MutableLiveData<List<ItemSpinner>> = MutableLiveData()
    private var idPaisSeleccionado: Int? = null

    var listaDepartamentos: MutableLiveData<List<ItemSpinner>> = MutableLiveData()
    private var idDeptoSeleccionado: Int? = null

    var listaMunicipios: MutableLiveData<List<ItemSpinner>> = MutableLiveData()
    var idMunicipioSeleccionado: Int? = null

    var usaLentes: String? = null


    //Acciones para el funcionario
    fun insertarFuncionario(funcionario: Funcionario) {
        eliminarFuncionario()
        launch {
            dao.agregarFuncionario(funcionario)
        }
    }

    fun obtenerFuncionario() {
        launch {
            funcionario.value = dao.obtenerFuncionario()
            App.idFuncionario = funcionario.value?.id?.toInt()
        }
    }

    fun obtenerCedulaFuncionario(): String? {
        cedulaFuncionario = funcionario.value?.numeroDocumento

        return cedulaFuncionario
    }

    fun obtenerFotoFuncionario() {
        launch {
            funcionarioFoto.value = dao.obtenerFotoFuncionario()
        }
    }

    fun actualizarFuncionario(funcionario: Funcionario) {
        launch {
            dao.actualizarFuncionario(funcionario)
            obtenerImagenFuncionarioApi(funcionario.adjunto)
        }
    }


    fun eliminarFuncionario() {
        launch {
            dao.eliminarFuncionarios()
        }
    }

    fun atualizarImagenFuncionario(imagenB64: String) {
        launch {
            dao.actualizarImagenFuncionarios(imagenB64)
        }
    }

    fun actualizaNullAdjuntoFoto() {
        launch {
            dao.actualizaNullAdjuntoFoto()
        }
    }

    fun atualizarAdjuntoFuncionario(objectId: String) {
        launch {
            dao.atualizarAdjuntoFuncionario(objectId)
        }
    }

    //Obtener informacion del funcionario
    fun obtenerTipoViviendasApi() {
        val lista: ArrayList<ItemSpinner> = ArrayList()

        val callbackTiposVivienda = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")

                for (i in 0 until valueArr.length()) {
                    val item = valueArr.getJSONObject(i)
                    lista.add(ItemSpinner(item))
                }

                listaTiposVivienda.value = lista
            }

            override fun error(error: VolleyError) {
            }
        }

        obtenerTiposVivienda(getApplication(), callbackTiposVivienda)
    }

    fun tipoViviendaSeleccionada(id: Int?) {
        idViviendaSeleccionada = if (id == 0) {
            null
        } else {
            id
        }
    }

    fun obtenerOpcionesUsaLentes() {

    }

    fun usaLentesSeleccion(s: String?) {
        usaLentes = s
    }

    fun obtenerPaisesApi() {
        val lista: ArrayList<ItemSpinner> = ArrayList()

        val callbackPaises = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")

                for (i in 0 until valueArr.length()) {
                    val item = valueArr.getJSONObject(i)
                    lista.add(ItemSpinner(item))
                }
                listaPaises.value = lista
            }

            override fun error(error: VolleyError) {
            }
        }
        obtenerPaises(getApplication(), callbackPaises)
    }

    fun paisSeleccionado(id: Int?) {
        idPaisSeleccionado = if (id == 0) {
            null
        } else {
            id
        }
    }

    fun obtenerDeptosApi() {
        val lista: ArrayList<ItemSpinner> = ArrayList()

        val callbackDepartamentos = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")

                for (i in 0 until valueArr.length()) {
                    val item = valueArr.getJSONObject(i)
                    lista.add(ItemSpinner(item))
                }
                listaDepartamentos.value = lista
            }

            override fun error(error: VolleyError) {
            }
        }
        obtenerDepartamentos(getApplication(), callbackDepartamentos, idPaisSeleccionado)
    }

    fun deptoSeleccionado(id: Int?) {
        idDeptoSeleccionado = if (id == 0) {
            null
        } else {
            id
        }
    }

    fun obtenerMunicipiosApi() {
        val lista: ArrayList<ItemSpinner> = ArrayList()

        val callbackMunicipios = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")

                for (i in 0 until valueArr.length()) {
                    val item = valueArr.getJSONObject(i)
                    lista.add(ItemSpinner(item))
                }
                listaMunicipios.value = lista
            }

            override fun error(error: VolleyError) {
            }
        }
        obtenerMunicipios(getApplication(), callbackMunicipios, idDeptoSeleccionado)
    }

    fun municipioSeleccionado(id: Int?) {
        idMunicipioSeleccionado = if (id == 0) {
            null
        } else {
            id
        }
    }

    private fun obtenerImagenFuncionarioApi(adjunto: String?) {
        val callbackImagen = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                if (respuesta != null) {
                    //Guardamos Bitmap de imagen en base Local
                    val imgString = bitMapToString(respuesta as Bitmap)
                    atualizarImagenFuncionario(imgString).also {
                        obtenerFuncionario()
                    }
                }
            }

            override fun error(error: VolleyError) {
                obtenerFuncionario()
            }

        }
        obtenerImagenServer(getApplication(), adjunto.toString(), callbackImagen)
    }

    fun obtenerFoto(adjunto: String?) {
        val callbackImg = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                if (respuesta != null) {
                    //Guardamos Bitmap de imagen en base Local
                    val imgString = bitMapToString(respuesta as Bitmap)
                    atualizarImagenFuncionario(imgString)
                    abrirMenulateral.value = true
                }
            }

            override fun error(error: VolleyError) {
                Log.i("Error", "ObtenerImagenLoginActivity ${error.networkResponse?.statusCode}")
                abrirMenulateral.value = true
            }
        }
        obtenerImagenServer(getApplication(), adjunto.toString(), callbackImg)
    }

    fun obtenerUsuarioAPi(cedula: String) {
        val callback = object : IRespuestaServidor {

            override fun exito(respuesta: Any?) {
                val obj = JSONObject(respuesta.toString())
                val value = obj.get("value")

                if (value.toString() != "[]") {
                    val valueObj = obj.getJSONArray("value")[0]
                    val datosFuncionario = JSONObject(valueObj.toString())

                    val nuevoFuncionario = Funcionario(datosFuncionario)
                    insertarFuncionario(nuevoFuncionario)

                    //obtener imagen
                    val adjunto = datosFuncionario.getString("adjunto")
                    if (!adjunto.isNullOrEmpty() && adjunto != "null") {
                        obtenerFoto(adjunto)
                    } else {
                        abrirMenulateral.value = true
                    }
                } else {
                    mensajeDialogoError.value =
                        getApplication<Application>().getString(R.string.mensaje_no_creado_como_empleado)
                }
            }

            override fun error(error: VolleyError) {
                var codigo = error.networkResponse?.statusCode
                if (codigo == null) {
                    codigo = 404
                }
                mensajeDialogoError.value =
                    "$codigo " + getApplication<Application>().getString(R.string.mensaje_no_creado_como_empleado)
            }
        }
        obtenerFuncionario(getApplication(), cedula, callback)
    }
}