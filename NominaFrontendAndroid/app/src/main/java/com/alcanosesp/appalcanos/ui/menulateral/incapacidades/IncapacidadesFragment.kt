package com.alcanosesp.appalcanos.ui.menulateral.incapacidades

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProviders
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.alcanosesp.appalcanos.App
import com.alcanosesp.appalcanos.R
import com.alcanosesp.appalcanos.adapter.AdapterRecyclerView
import com.alcanosesp.appalcanos.databinding.FragmentIncapacidadesBinding
import com.alcanosesp.appalcanos.db.entity.AusentismoFuncionario
import com.alcanosesp.appalcanos.utils.construirAlerta

class IncapacidadesFragment : Fragment(), AdapterRecyclerView.OnRecyclerClickListener {

    private val viewModel by lazy {
        ViewModelProviders.of(this).get(IncapacidadViewModel::class.java)
    }

    private lateinit var binding: FragmentIncapacidadesBinding
    private lateinit var adaptadorRVIncapacidad: AdapterRecyclerView
    private var lista = ArrayList<AusentismoFuncionario>()
    private var obtenerBaseDeDatos = true


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        viewModel.obtenerIncapacidad()
    }

    @SuppressLint("InflateParams")
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding =
            DataBindingUtil.inflate(inflater, R.layout.fragment_incapacidades, container, false)

        adaptadorRVIncapacidad = AdapterRecyclerView(context, this)
        binding.rvIncapacidad.apply {
            layoutManager = LinearLayoutManager(activity)
            adapter = adaptadorRVIncapacidad
        }

        mostarProgresBar()
        observadorIncapacidades()
        swiperListener()
        observarMensajeDialogoError()
        clickCreaIncapacidad()


        return binding.root
    }

    private fun clickCreaIncapacidad() {
        App.incapacidad = null
        binding.fabIncapacidad.setImageDrawable(context!!.getDrawable(R.drawable.ic_add))
        binding.fabIncapacidad.setOnClickListener {
            findNavController().navigate(R.id.action_nav_incapacidades_to_incapacidadFormularioFragment)
        }
    }

    private fun observarMensajeDialogoError() {
        viewModel.mensajeDialogoErrorIncapacidad.observe(viewLifecycleOwner, Observer {
            val mensaje = it
            if (!mensaje.isNullOrEmpty()) {
                construirAlerta(context!!, R.layout.toas_login_warning, mensaje.toString())
            }
            ocultarProgresBar()
        })
    }

    private fun swiperListener() = binding.refreshIncapaciad.setOnRefreshListener {
        mostarProgresBar()
        viewModel.obtenerIncapacidadApi()
        binding.refreshIncapaciad.isRefreshing = false
    }

    private fun observadorIncapacidades() {
        viewModel.incapacidad.observe(viewLifecycleOwner, Observer {
            lista.clear()
            val incapacidad = it
            if (incapacidad.isEmpty() && !obtenerBaseDeDatos) {
                ocultarProgresBar()
                mostarEmptyState()
            }
            if (incapacidad.isEmpty() && obtenerBaseDeDatos) {
                obtenerBaseDeDatos = false
                viewModel.obtenerIncapacidadApi()

            } else {
                for (element in incapacidad) {
                    lista.add(element)
                }
                adaptadorRVIncapacidad.crearListaElementos(lista)
                ocultarEmptyState()
                ocultarProgresBar()
            }
            adaptadorRVIncapacidad.notifyDataSetChanged()



        })
    }

    private fun mostarProgresBar() {
        binding.pbIncapacidads.isVisible = true
        binding.refreshIncapaciad.isVisible = false
        binding.llEmptyIncapacidad.isVisible = false
        binding.fabIncapacidad.isVisible =false
    }

    private fun ocultarProgresBar() {
        binding.pbIncapacidads.isVisible = false
        binding.refreshIncapaciad.isVisible = true
        binding.fabIncapacidad.isVisible =true
    }

    private fun mostarEmptyState() {
        binding.llEmptyIncapacidad.isVisible = true
        binding.refreshIncapaciad.isVisible = false
    }

    private fun ocultarEmptyState() {
        binding.llEmptyIncapacidad.isVisible = false
    }


    override fun seleccionarItem(item: Any?) {
        App.incapacidad = item as AusentismoFuncionario
        findNavController().navigate(R.id.action_nav_incapacidades_to_incapacidadVisualizarFragment)
    }
}
