package com.alcanosesp.appalcanos.ui.menulateral.consultas.ingresos_retenciones

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProviders
import com.alcanosesp.appalcanos.R
import com.alcanosesp.appalcanos.databinding.FragmentCertificadoRetencionesBinding
import com.alcanosesp.appalcanos.utils.construirAlerta


class CertificadoRetencionesFragment : Fragment() {
    private var idanioVigente: Int = 0
    private lateinit var binding: FragmentCertificadoRetencionesBinding
    private val viewModel by lazy {
        ViewModelProviders.of(this).get(CertificadoRetencionesViewModel::class.java)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.obtenerAnioVigenteApi()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = DataBindingUtil.inflate(
            inflater,
            R.layout.fragment_certificado_retenciones,
            container,
            false
        )

        observadorAnioVigencia()
        observadorCertificado()
        observarMensajeDialogoError()
        clickDescargar()

        return binding.root
    }

    private fun clickDescargar() = binding.rlItemRetenciones.setOnClickListener {
        mostrarProgresBar()
        viewModel.obtenerCertificadoRetencionesApi(idanioVigente)
    }

    private fun observarMensajeDialogoError() {
        viewModel.mensajeDialogoError.observe(viewLifecycleOwner, Observer {
            val mensaje = it
            if (!mensaje.isNullOrEmpty()) {
                construirAlerta(context!!, R.layout.toas_login_warning, mensaje.toString())
            }
            ocultarProgresBar()
        })
    }

    private fun observadorAnioVigencia() {
        viewModel.annioVIgencia.observe(viewLifecycleOwner, Observer {
            idanioVigente = it.optInt("id")
            val anno = (it.optInt("anno") - 1).toString()
            val texto = getString(R.string.ingresisyretencionesdescripcion).plus(" ").plus(anno)
            binding.tvDescripcionCertificadoRetenciones.text = texto
            ocultarProgresBar()
        })
    }

    private fun observadorCertificado() {
        viewModel.certificado.observe(viewLifecycleOwner, Observer {
            val intent = Intent(
                Intent.ACTION_VIEW,
                Uri.parse(it.getString("url").plus(it.getString("file")))
            )
            Log.i("que busca", it.getString("url").plus(it.getString("file")) )
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            startActivity(intent)
            ocultarProgresBar()
        })
    }

    private fun ocultarProgresBar() {
        binding.pbRetenciones.visibility = View.GONE
        binding.rlItemRetenciones.visibility = View.VISIBLE
    }

    private fun mostrarProgresBar() {
        binding.pbRetenciones.visibility = View.VISIBLE
        binding.rlItemRetenciones.visibility = View.INVISIBLE
    }
}
