package com.alcanosesp.appalcanos.ui.menulateral.solicitudes.beneficios

import android.app.AlertDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.CheckBox
import android.widget.TextView
import androidx.core.content.ContextCompat.getColorStateList
import androidx.core.content.res.ResourcesCompat
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProviders
import androidx.navigation.fragment.findNavController
import com.alcanosesp.appalcanos.App
import com.alcanosesp.appalcanos.R
import com.alcanosesp.appalcanos.api.HOST
import com.alcanosesp.appalcanos.api.IRespuestaServidor
import com.alcanosesp.appalcanos.api.cancelarSolicitudBeneficio
import com.alcanosesp.appalcanos.api.obtenerSolicitudesBeneficios
import com.alcanosesp.appalcanos.databinding.FragmentBeneficioVisualizarBinding
import com.alcanosesp.appalcanos.db.entity.SolicitudBeneficio
import com.alcanosesp.appalcanos.utils.colorEstados
import com.android.volley.VolleyError
import org.json.JSONObject

class BeneficioVisualizarFragment : Fragment() {

    private val viewModel by lazy {
        ViewModelProviders.of(this).get(BeneficiosViewModel::class.java)
    }

    private var funcionarioId: String = App.idFuncionario.toString()
    private var solicitud: SolicitudBeneficio? = App.solicitudBeneficio
    private lateinit var binding: FragmentBeneficioVisualizarBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        viewModel.tipoBeneficioSeleccionado(solicitud?.tipoBeneficioId?.toInt())
        viewModel.obtenerBeneficioAdjuntosApi(solicitud?.id)
        viewModel.obtenerPeriodicidadesBeneficioApi(solicitud?.id)
        viewModel.obtenerParametrosTipoBeneficio()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        binding = DataBindingUtil.inflate(
            inflater,
            R.layout.fragment_beneficio_visualizar,
            container,
            false
        )

        //viewModel.obtenerParametrosTipoBeneficio()

        binding.solicitud = solicitud
        context?.getColor(colorEstados[solicitud?.estado]!!)
            ?.let {
                binding.solicitudEstado.background.setTint(it)
            }

        ocultarMostrarInfo()

        binding.fabCancelarSolicitud.setOnClickListener {
            mostrarDialogoCancelar()
        }

        binding.fabEditarSolicitud.setOnClickListener {
            findNavController().navigate(R.id.action_beneficioVisualizarFragment_to_beneficioFormularioFragment)
        }

        viewModel.beneficioAdjuntos.observe(this, Observer {
            mostrarAdjuntos(it)
        })

        viewModel.periodicidadBeneficio.observe(this, Observer {
            mostrarPeriodicidad(it)
        })

        viewModel.periodicidadesBeneficio.observe(this, Observer {
            if (it.isNotEmpty()) {
                viewModel.obtenerPeriodicidadBeneficioApi(solicitud?.tipoPeriodoId?.toInt())
            }
        })

        viewModel.permitePlazoMes.observe(this, Observer {
            if (it == "true") {
                binding.plazovalor.visibility = View.VISIBLE
                binding.plazoMeses.visibility = View.VISIBLE
                binding.saldo.visibility = View.VISIBLE
                binding.valoresAutorizados.visibility = View.VISIBLE
                binding.valorCuota.visibility = View.VISIBLE
            } else {
                binding.plazoMeses.visibility = View.GONE
            }
        })

        viewModel.permiteValorSolicitado.observe(this, Observer {
            if (it == "true") {
                binding.plazovalor.visibility = View.VISIBLE
                binding.valorSolicitado.visibility = View.VISIBLE
            } else {
                binding.valorSolicitado.visibility = View.GONE
            }
        })

        viewModel.permitePeriodoPago.observe(this, Observer {
            if (it == "true") {
                binding.periodoPago.visibility = View.VISIBLE
            } else {
                binding.periodoPago.visibility = View.GONE
            }
        })

        viewModel.permiteAuxilioEducativo.observe(this, Observer {
            if (it == "true") {
                binding.fechaEstudios.visibility = View.VISIBLE
                binding.opcionAuxilioEducativo.visibility = View.VISIBLE
                binding.notaAcademica.visibility = View.VISIBLE
                binding.obsNotaAcademica.visibility = View.VISIBLE
            }
        })

        viewModel.permitePermisoEstudio.observe(this, Observer {
            if (it == "true") {
                binding.fechaEstudios.visibility = View.VISIBLE
                binding.horasPorSemana.visibility = View.VISIBLE
            }
        })

        viewModel.permiteValorAutorizado.observe(this, Observer {
            if (it == "true") {
                binding.valoresAutorizados.visibility = View.VISIBLE
                binding.valorAutorizado.visibility = View.VISIBLE
            }
        })

        return binding.root
    }

    private fun mostrarAdjuntos(lista: List<HashMap<String, String>>) {
        if (lista.isNotEmpty()) {
            binding.requisitosBeneficio.visibility = View.VISIBLE
            for (i in lista.indices) {
                val tvAdjunto = layoutInflater.inflate(R.layout.adjuntos_layout, null) as TextView
                tvAdjunto.apply {
                    text = lista[i]["nombre"]
                    setCompoundDrawablesWithIntrinsicBounds(0, 0, R.drawable.ic_save_alt, 0)
                    setOnClickListener {
                        abrirAdjunto(lista[i]["adjunto"]!!)
                    }
                }
                binding.requisitos.addView(tvAdjunto)
            }
        }
    }

    private fun mostrarPeriodicidad(lista: List<HashMap<String, String>>) {
        binding.periodicidades.removeAllViews()
        if (lista.isNotEmpty()) {
            binding.periodicidadRequisito.visibility = View.VISIBLE
            for (i in lista.indices) {
                val periodoCheckBox = CheckBox(context).apply {
                    text = lista[i]["nombre"]
                    typeface = ResourcesCompat.getFont(context!!, R.font.muli_regular)
                    setTextColor(context!!.getColor(R.color.gris))
                    isEnabled = false
                    buttonTintList = (getColorStateList(context!!, R.color.gris))
                }

                if (viewModel.verificarPeriodicidad(lista[i]["nombre"])) {
                    periodoCheckBox.isChecked = true
                }

                binding.periodicidades.addView(periodoCheckBox)
            }
        }
    }

    //General
    private fun abrirAdjunto(objectId: String) {
        val url = "${HOST}api/archivos/$objectId/Archivo"
        val i = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        startActivity(i)
    }

    fun mostrarDialogoCancelar() {
        val vista = LayoutInflater.from(context).inflate(R.layout.dialogo_botones, null)
        val textView = vista.findViewById<TextView>(R.id.texto_dialog)
        textView.text = "¿Estás seguro de cancelar la solicitud?"

        val botonAceptar = vista.findViewById<Button>(R.id.boton_dialog)
        val botonCancelar = vista.findViewById<Button>(R.id.boton_dialog_cancel)

        val builder = AlertDialog.Builder(context)
        builder.apply {
            setView(vista)
            create()
        }
        val dialogo = builder.show()
        botonAceptar.setOnClickListener {
            dialogo.dismiss()
            cancelarSolicitud()
        }

        botonCancelar.setOnClickListener {
            dialogo.dismiss()
        }
    }

    private fun cancelarSolicitud() {
        val parametros = JSONObject()
        parametros.put("id", App.solicitudBeneficio?.id)
        parametros.put("estado", "Cancelada")

        val callbackEditarSolicitudBeneficio = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                recargarSolicitudesBeneficio()
            }

            override fun error(error: VolleyError) {
            }
        }
        cancelarSolicitudBeneficio(
            context!!,
            callbackEditarSolicitudBeneficio,
            parametros,
            solicitud?.id!!
        )
    }

    fun recargarSolicitudesBeneficio() {
        viewModel.eliminarSolicitudes()

        val callbackSolicitudes = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                val json = JSONObject(respuesta.toString())
                val valueArr = json.getJSONArray("value")

                for (i in 0 until valueArr.length()) {
                    val item = valueArr.getJSONObject(i)
                    val solicitud = SolicitudBeneficio(item)

                    viewModel.insertarSolicitud(solicitud)
                }

                val handler = Handler()

                handler.postDelayed(
                    {
                        findNavController().navigate(R.id.action_beneficioVisualizarFragment_to_beneficiosFragment)
                        App.experiencia = null
                    },
                    700
                )
            }

            override fun error(error: VolleyError) {
                //DIALOGO DE ERROR O ALGO
            }
        }
        obtenerSolicitudesBeneficios(context!!, callbackSolicitudes, funcionarioId)
    }

    private fun ocultarMostrarInfo() {

        when (solicitud?.estado) {
            "EnTramite" -> {
                binding.fabCancelarSolicitud.show()
                binding.fabEditarSolicitud.show()

            }
            "Autorizada" -> {
                binding.fabCancelarSolicitud.show()
            }
        }

        if (solicitud?.observacionAprobacion!!.isNotEmpty()) {
            binding.grupoObsAprobacion.visibility = View.VISIBLE
        }

        if (solicitud?.observacionAutorizacion!!.isNotEmpty()) {
            binding.grupoObsAutorizacion.visibility = View.VISIBLE
        }
    }
}