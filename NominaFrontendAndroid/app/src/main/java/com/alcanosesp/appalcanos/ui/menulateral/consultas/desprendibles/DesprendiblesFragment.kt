package com.alcanosesp.appalcanos.ui.menulateral.consultas.desprendibles

import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProviders
import androidx.recyclerview.widget.LinearLayoutManager
import com.alcanosesp.appalcanos.R
import com.alcanosesp.appalcanos.adapter.AdapterRecyclerView
import com.alcanosesp.appalcanos.databinding.FragmentDesprendiblesBinding
import com.alcanosesp.appalcanos.model.Desprendible
import com.alcanosesp.appalcanos.utils.construirAlerta
import org.json.JSONObject

class DesprendiblesFragment : Fragment(), AdapterRecyclerView.OnRecyclerClickListener {

    private val viewModel by lazy {
        ViewModelProviders.of(this).get(DesprendiblesViewModel::class.java)
    }
    private lateinit var binding: FragmentDesprendiblesBinding
    private lateinit var adaptadorRVDesprendibles: AdapterRecyclerView
    private var lista = ArrayList<Desprendible>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.obtenerDesprendiblesApi()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding =
            DataBindingUtil.inflate(inflater, R.layout.fragment_desprendibles, container, false)
        binding.desprendiblesRv.layoutManager = LinearLayoutManager(activity)
        adaptadorRVDesprendibles = AdapterRecyclerView(context, this)
        binding.desprendiblesRv.adapter = adaptadorRVDesprendibles

        observadorListaDesprendibles()
        observadordesprendibleURi()
        observarMensajeDialogoError()
        swiperListener()

        return binding.root
    }

    override fun seleccionarItem(item: Any?) {
        mostrarVista("PROGRESO")
        val desprendible = item as Desprendible
        val parametros = JSONObject().apply {
            put("nominaFuncionarioId", desprendible.nominaDesprendible)
        }

        viewModel.descargardesprendibleApi(parametros)
    }

    private fun observadorListaDesprendibles() {
        viewModel.listaDesprendibles.observe(viewLifecycleOwner, Observer {
            if (it != null) {
                lista.clear()
                adaptadorRVDesprendibles.notifyDataSetChanged()
                lista = it
                mostrarVista("LISTA")
            } else {
                mostrarVista("EMPTY")
            }
        })
    }

    private fun observadordesprendibleURi() {
        viewModel.desprendibleURi.observe(viewLifecycleOwner, Observer {
            val i = Intent(Intent.ACTION_VIEW, it)
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            startActivity(i)
            val handler= Handler()
            handler.postDelayed({mostrarVista("LISTA")},2000)

        })
    }

    private fun observarMensajeDialogoError() {
        viewModel.mensajeDialogoError.observe(viewLifecycleOwner, Observer {
            val mensaje = it
            if (!mensaje.isNullOrEmpty()) {
                construirAlerta(context!!, R.layout.toas_login_warning, mensaje.toString())
            }
            mostrarVista("LISTA")
        })
    }

    private fun swiperListener() = binding.refreshDesprendibles.setOnRefreshListener {
        mostrarVista("PROGRESO")
        viewModel.obtenerDesprendiblesApi()
        binding.refreshDesprendibles.isRefreshing = false
    }

    private fun mostrarVista(vista: String) {
        when (vista) {
            "PROGRESO" -> {
                binding.pbDesprendibles.visibility = View.VISIBLE
                binding.emptyDesprendibles.visibility = View.GONE
                binding.refreshDesprendibles.visibility = View.GONE
            }
            "EMPTY" -> {
                binding.emptyDesprendibles.visibility = View.VISIBLE
                binding.refreshDesprendibles.visibility = View.GONE
                binding.pbDesprendibles.visibility = View.GONE
            }
            "LISTA" -> {
                adaptadorRVDesprendibles.crearListaElementos(lista)
                adaptadorRVDesprendibles.notifyDataSetChanged()

                binding.refreshDesprendibles.visibility = View.VISIBLE
                binding.emptyDesprendibles.visibility = View.GONE
                binding.pbDesprendibles.visibility = View.GONE
            }
        }
    }

    fun descargarDesprendible(url: String) {
        val request = DownloadManager.Request(Uri.parse(url)).apply {
            setAllowedNetworkTypes(DownloadManager.Request.NETWORK_WIFI or DownloadManager.Request.NETWORK_MOBILE)
            setTitle("Desprendible de pago")
            setDescription("Downloading")
            setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)

            //setDestinationUri(Uri.parse("file://ghestic"))
        }
        val f = activity?.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        f.enqueue(request)
    }
}