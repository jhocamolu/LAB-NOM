package com.alcanosesp.appalcanos.ui.login

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProviders
import com.alcanosesp.appalcanos.R
import com.alcanosesp.appalcanos.ui.menulateral.MenuLateralActivity
import com.alcanosesp.appalcanos.ui.menulateral.datos_personales.datos_basicos.BasicosViewModel
import com.alcanosesp.appalcanos.ui.menulateral.datos_personales.datos_basicos.EstudiosViewModel
import com.alcanosesp.appalcanos.ui.menulateral.datos_personales.datos_basicos.ExperienciasViewModel
import com.alcanosesp.appalcanos.ui.menulateral.datos_personales.datos_basicos.FamiliaresViewModel
import com.alcanosesp.appalcanos.ui.menulateral.incapacidades.IncapacidadViewModel
import com.alcanosesp.appalcanos.ui.menulateral.solicitudes.beneficios.BeneficiosViewModel
import com.alcanosesp.appalcanos.ui.menulateral.solicitudes.cesantias.CesantiasViewModel
import com.alcanosesp.appalcanos.ui.menulateral.solicitudes.permisos.PermisoViewModel
import com.alcanosesp.appalcanos.utils.construirAlerta
import kotlinx.android.synthetic.main.activity_login.*

class LoginActivity : AppCompatActivity() {
    private val vmLogin by lazy {
        ViewModelProviders.of(this).get(LoginViewModel::class.java)
    }
    private val vmFuncionario by lazy {
        ViewModelProviders.of(this).get(BasicosViewModel::class.java)
    }
    private val vmFamiliar by lazy {
        ViewModelProviders.of(this).get(FamiliaresViewModel::class.java)
    }
    private val vmExperiencia by lazy {
        ViewModelProviders.of(this).get(ExperienciasViewModel::class.java)
    }
    private val vmEstudios by lazy {
        ViewModelProviders.of(this).get(EstudiosViewModel::class.java)
    }
    private val vmIncapacidad by lazy {
        ViewModelProviders.of(this).get(IncapacidadViewModel::class.java)
    }
    private val vmSolicitud by lazy {
        ViewModelProviders.of(this).get(BeneficiosViewModel::class.java)
    }
    private val vmPermiso by lazy {
        ViewModelProviders.of(this).get(PermisoViewModel::class.java)
    }
    private val vmCesantias by lazy {
        ViewModelProviders.of(this).get(CesantiasViewModel::class.java)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        supportActionBar?.hide()
        window.navigationBarColor = getColor(R.color.colorPrimary)
        super.onCreate(savedInstanceState)
        this.setContentView(R.layout.activity_login)

        validarSiCerroSesion()
        validarSiTokenExpiro()
        observadorAbrirMenulateral()
        observadorTokensesion()
        observadorFuncionarioMensajeDialogoError()
        observadorLoginMensajeDialogoError()
    }

    private fun validarSiTokenExpiro() {
        //Validamos el cierre es por que el token expiro y no se pudo refrescar
        val tokenExpeiro: String? = intent.getStringExtra(getString(R.string.token_expiro))
        if (tokenExpeiro != null) {

            limpiarBasedeDatos()
            construirAlerta(
                this,
                R.layout.toas_login_cerrar_sesion,
                getString(R.string.mensaje_token_expiro)
            ).show()
        }
    }

    private fun validarSiCerroSesion() {
        //Validamos si la app llego a login por un cierre de sesion
        val cerroSession: String? = intent.getStringExtra(getString(R.string.cerrarSesion))
        if (cerroSession != null) {

            limpiarBasedeDatos()
            construirAlerta(
                this,
                R.layout.toas_login_cerrar_sesion,
                getString(R.string.mensaje_sesion_cerrada)
            ).show()
        }
    }

    fun btnLoginIngresar(v: View) {
        mostrarProgressBar()
        val usuario = etLoginUsuario.text.toString()
        val contrasena = etLoginContrasena.text.toString()

        if (usuario.isEmpty() || contrasena.isEmpty()) {
            construirAlerta(
                this,
                R.layout.toas_login_warning,
                getString(R.string.mensaje_error_iniciar_sesion)
            ).show()
            ocultarProgressBar()
        } else {
            vmLogin.loginIngresar(usuario, contrasena)
        }
    }

    private fun observadorTokensesion() {
        vmLogin.usuarioLogeado.observe(this, Observer {
            vmFuncionario.obtenerUsuarioAPi(it)
        })
    }

    private fun observadorAbrirMenulateral() {
        vmFuncionario.abrirMenulateral.observe(this, Observer {
            val iLogin = Intent(this@LoginActivity, MenuLateralActivity::class.java)
            this@LoginActivity.startActivity(iLogin)
            this@LoginActivity.finish()
        })
    }

    private fun observadorLoginMensajeDialogoError() {
        vmLogin.mensajeDialogoError.observe(this, Observer {
            if (!it.isNullOrEmpty()) {
                construirAlerta(this, R.layout.toas_login_warning, it)
                ocultarProgressBar()
            }
        })
    }

    private fun observadorFuncionarioMensajeDialogoError() {
        vmFuncionario.mensajeDialogoError.observe(this, Observer {
            if (!it.isNullOrEmpty()) {
                construirAlerta(this, R.layout.toas_login_warning, it)
                ocultarProgressBar()
            }
        })
    }

    private fun mostrarProgressBar() {
        llLoginCampos.visibility = View.INVISIBLE
        pbLoginBarraProgreso.visibility = View.VISIBLE
    }

    private fun ocultarProgressBar() {
        llLoginCampos.visibility = View.VISIBLE
        pbLoginBarraProgreso.visibility = View.INVISIBLE
    }

    private fun limpiarBasedeDatos() {
        vmLogin.eliminarToken()
        vmFuncionario.eliminarFuncionario()
        vmFamiliar.eliminarFamiliares()
        vmEstudios.eliminarEstudios()
        vmExperiencia.eliminarExperiencias()
        vmIncapacidad.eliminarIncapacidad()
        vmSolicitud.eliminarSolicitudes()
        vmPermiso.eliminarSolicitudPermiso()
        vmPermiso.eliminarSoporteSolicitudPermiso()
        vmCesantias.eliminarSolicidCesantias()
    }
}