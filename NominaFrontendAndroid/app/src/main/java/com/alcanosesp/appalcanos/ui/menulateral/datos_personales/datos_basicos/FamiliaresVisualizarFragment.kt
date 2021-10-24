package com.alcanosesp.appalcanos.ui.menulateral.datos_personales.datos_basicos

import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import com.alcanosesp.appalcanos.App

import com.alcanosesp.appalcanos.R
import com.alcanosesp.appalcanos.databinding.FragmentFamiliaresVisualizarBinding

class FamiliaresVisualizarFragment : Fragment() {

    private lateinit var binding: FragmentFamiliaresVisualizarBinding

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = DataBindingUtil.inflate(inflater, R.layout.fragment_familiares_visualizar, container, false)
        binding.familiar = App.familiar

        return  binding.root
    }

    private fun ocultarMostrarInfo() {
        Log.i("estado", "${binding.familiar?.estado}")
        when (binding.familiar?.estado) {
            "Pendiente" -> {
                binding.fabFamiliares.show()
                binding.fabFamiliares.setImageResource(R.drawable.ic_edit)
            }
        }
    }
}
