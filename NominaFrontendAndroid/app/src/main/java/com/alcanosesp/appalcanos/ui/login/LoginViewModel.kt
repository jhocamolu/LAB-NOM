package com.alcanosesp.appalcanos.ui.login

import android.app.Application
import android.util.Log
import androidx.lifecycle.MutableLiveData
import com.alcanosesp.appalcanos.App
import com.alcanosesp.appalcanos.R
import com.alcanosesp.appalcanos.api.IRespuestaServidor
import com.alcanosesp.appalcanos.api.iniciarSesion
import com.alcanosesp.appalcanos.db.AppDatabase
import com.alcanosesp.appalcanos.db.entity.Token
import com.alcanosesp.appalcanos.utils.BaseViewModel
import com.android.volley.VolleyError
import kotlinx.coroutines.launch
import org.json.JSONObject

class LoginViewModel(application: Application) : BaseViewModel(application) {

    val tokenSesion = MutableLiveData<Token>()
    private val dao = AppDatabase(getApplication()).tokenDao()
    var mensajeDialogoError = MutableLiveData<String?>()
    val usuarioLogeado = MutableLiveData<String>()


    fun obtenerToken() {
        launch {
            tokenSesion.value = dao.obtenerToken()
        }
    }

    fun insertarToken(token: Token) {
        eliminarToken()
        launch {
            dao.agregarToken(token)
        }
    }

    fun eliminarToken() {
        launch {
            dao.eliminarToken()
        }
    }

    fun actualizarToken(token: String, refreskToken: String) {
        launch {
            dao.actualizarToken(token, refreskToken)

            tokenSesion.value = dao.obtenerToken()
        }
    }

     fun loginIngresar(usuario: String, contrasena: String) {

        val callback = object : IRespuestaServidor {

            override fun exito(respuesta: Any?) {
                Log.i("TokenDatos", respuesta.toString())

                val objToken = JSONObject(respuesta.toString())
                val token = objToken.getString(getApplication<Application>().getString(R.string.token))
                if (token.isEmpty()) {
                    mensajeDialogoError.value =
                        getApplication<Application>().getString(R.string.mensaje_error_iniciar_sesion)
                } else {

                    val nombreApp = objToken.getString(getApplication<Application>().getString(R.string.aplicaciones))
                        .contains(getApplication<Application>().getString(R.string.app_permiso))
                    if (nombreApp) {
                        insertarToken(Token(objToken))
                        App.TOKEN = objToken.getString(getApplication<Application>().getString(R.string.token))
                        App.REFRESH = objToken.getString(getApplication<Application>().getString(R.string.refreshToken))

                        usuarioLogeado.value = usuario


                    } else {
                        mensajeDialogoError.value =
                            getApplication<Application>().getString(R.string.mensaje_no_tiene_permisos_ingreso)
                    }
                }
            }

            override fun error(error: VolleyError) {
                var codigo = error.networkResponse?.statusCode
                if (codigo == null) {
                    codigo = 404
                }
                mensajeDialogoError.value =
                    "$codigo " + getApplication<Application>().getString(R.string.mensaje_eror_404)
            }
        }
        iniciarSesion(getApplication(), usuario, contrasena, callback)
    }
}