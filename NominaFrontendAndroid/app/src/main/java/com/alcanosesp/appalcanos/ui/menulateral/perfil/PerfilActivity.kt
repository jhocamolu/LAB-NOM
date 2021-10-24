package com.alcanosesp.appalcanos.ui.menulateral.perfil

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProviders
import com.alcanosesp.appalcanos.R
import com.alcanosesp.appalcanos.api.IRespuestaServidor
import com.alcanosesp.appalcanos.databinding.ActivityPerfilBinding
import com.alcanosesp.appalcanos.ui.login.LoginActivity
import com.alcanosesp.appalcanos.ui.login.LoginViewModel
import com.alcanosesp.appalcanos.ui.menulateral.datos_personales.datos_basicos.BasicosViewModel
import com.alcanosesp.appalcanos.ui.menulateral.datos_personales.datos_basicos.EstudiosViewModel
import com.alcanosesp.appalcanos.ui.menulateral.datos_personales.datos_basicos.ExperienciasViewModel
import com.alcanosesp.appalcanos.ui.menulateral.datos_personales.datos_basicos.FamiliaresViewModel
import com.alcanosesp.appalcanos.ui.menulateral.incapacidades.IncapacidadViewModel
import com.alcanosesp.appalcanos.ui.menulateral.solicitudes.beneficios.BeneficiosViewModel
import com.alcanosesp.appalcanos.ui.menulateral.solicitudes.cesantias.CesantiasViewModel
import com.alcanosesp.appalcanos.ui.menulateral.solicitudes.permisos.PermisoViewModel
import com.alcanosesp.appalcanos.utils.stringToBitMap
import com.android.volley.VolleyError
import de.hdodenhof.circleimageview.CircleImageView
import kotlinx.android.synthetic.main.activity_perfil.*

var intentos = 0

class PerfilActivity : AppCompatActivity() {
    private lateinit var imagenPrincipal: CircleImageView
    private val vmLogin by lazy {
        ViewModelProviders.of(this).get(LoginViewModel::class.java)
    }
    private val vmFuncionario by lazy {
        ViewModelProviders.of(this).get(BasicosViewModel::class.java)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val binding = DataBindingUtil.inflate<ActivityPerfilBinding>(
            layoutInflater,
            R.layout.activity_perfil,
            null,
            false
        )
        setContentView(binding.root)
       // imagenPrincipal = findViewById(R.id.avatarFuncionario)
        funcionario(binding)
        cerrarSesion()
        cambiarImagen()

        vmLogin.obtenerToken()
    }

    private fun cerrarSesion() = btnCerrarSesion.setOnClickListener {
        val iLogin = Intent(applicationContext, LoginActivity::class.java)
        iLogin.putExtra( this.getString(R.string.cerrarSesion), this.getString(R.string.cerrarSesion) )
        iLogin.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(iLogin)
        this.finish()
    }

    private fun cambiarImagen() = rlCambiarImagen.setOnClickListener {
        val iCambiarimagen = Intent(this, CambiarAvatarActivity::class.java)
        startActivity(iCambiarimagen)
    }

   private fun funcionario(binding: ActivityPerfilBinding) {
        vmFuncionario.obtenerFuncionario()

        vmFuncionario.funcionario.observe(this, Observer {
            Log.i("PerfilActivity", it.foto.toString())
            binding.funcionario = it
            if (!it?.foto.isNullOrEmpty()) {
                val imagenBitmap = stringToBitMap(it.foto.toString())
                binding.avatarFuncionario.setImageBitmap(imagenBitmap)
                //imagenPrincipal.setImageBitmap(imagenBitmap)
            } else {
                binding.avatarFuncionario.setImageResource(R.drawable.empty_personaje)
                //imagenPrincipal.setImageResource(R.drawable.empty_personaje)
            }

        })
    }
}
