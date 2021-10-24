package com.alcanosesp.appalcanos.ui.menulateral.incapacidades

import android.annotation.SuppressLint
import android.app.AlertDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.core.view.isVisible
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProviders
import androidx.navigation.fragment.findNavController
import com.alcanosesp.appalcanos.App
import com.alcanosesp.appalcanos.R
import com.alcanosesp.appalcanos.databinding.FragmentIncapacidadVisualizarBinding
import com.alcanosesp.appalcanos.utils.colorEstados
import com.alcanosesp.appalcanos.utils.estadosAusentismoFuncionario

class IncapacidadVisualizarFragment : Fragment() {
    private val viewModel by lazy {
        ViewModelProviders.of(this).get(IncapacidadViewModel::class.java)
    }

    private lateinit var binding: FragmentIncapacidadVisualizarBinding

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = DataBindingUtil.inflate(
            inflater,
            R.layout.fragment_incapacidad_visualizar,
            container,
            false
        )

        binding.incapacidad = App.incapacidad

        clickEditar()
        clickCancelar()
        observadorCancelarRedireccionar()
        ocultarMostrarInfo()
        colorEstado()

        return binding.root
    }

    private fun colorEstado() = context.let { it ->
        it?.getColor(colorEstados[binding.incapacidad?.estado]!!).let {
            binding.incapacidadEstado.background.setTint(it!!)
        }
    }

    private fun ocultarMostrarInfo() {
        when (binding.incapacidad?.estado) {
            "Registrado" -> {
                binding.fabAprobar.show()
                binding.fabAprobar.setImageResource(R.drawable.ic_edit)
                binding.fabCancelar.show()
                binding.fabCancelar.setImageResource(R.drawable.ic_block)
            }
        }
    }

    private fun observadorCancelarRedireccionar() {
        viewModel.redireccionar.observe(viewLifecycleOwner, Observer {
            findNavController().navigate(R.id.action_incapacidadVisualizarFragment_to_nav_incapacidades)
        })
    }

    private fun clickCancelar() = binding.fabCancelar.setOnClickListener {
        mostarDialogoCancelar()
    }

    @SuppressLint("InflateParams")
    private fun mostarDialogoCancelar() {
        val vista = LayoutInflater.from(context).inflate(R.layout.dialogo_botones, null)
        val textView = vista.findViewById<TextView>(R.id.texto_dialog)
        textView.text = getString(R.string.pregunta_anular_solicitud)

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
            binding.pbIncapacidad.isVisible = true
            binding.fabCancelar.isVisible = false
            binding.fabAprobar.isVisible = false
            viewModel.cancelarIncapacidadApi()
        }

        botonCancelar.setOnClickListener {
            dialogo.dismiss()
        }
    }

    private fun clickEditar() = binding.fabAprobar.setOnClickListener {
        App.incapacidad = binding.incapacidad
        findNavController().navigate(R.id.action_incapacidadVisualizarFragment_to_incapacidadFormularioFragment)
    }

}
