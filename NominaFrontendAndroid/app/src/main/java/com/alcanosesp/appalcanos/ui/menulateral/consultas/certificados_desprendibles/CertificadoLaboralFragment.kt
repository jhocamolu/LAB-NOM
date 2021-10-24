package com.alcanosesp.appalcanos.ui.menulateral.consultas.certificados_desprendibles
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProviders
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.alcanosesp.appalcanos.R
import com.alcanosesp.appalcanos.adapter.AdapterRvCertificadoLaboral
import com.alcanosesp.appalcanos.model.CertificadoLaboral
import com.alcanosesp.appalcanos.ui.menulateral.datos_personales.datos_basicos.BasicosViewModel
import com.alcanosesp.appalcanos.utils.construirAlerta
import kotlinx.android.synthetic.main.fragment_certificado_laboral.*


class CertificadoLaboralFragment : Fragment(),
    AdapterRvCertificadoLaboral.OnCertificadoLaboralListener {

    private val vmCertificadoLaboral by lazy {
        ViewModelProviders.of(this).get(CertificadoLaboralViewModel::class.java)
    }
    private lateinit var adaptadorRV: AdapterRvCertificadoLaboral
    private lateinit var funcionarioId: String
    private lateinit var recyclerView: RecyclerView
    private val vmFuncionario by lazy {
        ViewModelProviders.of(this).get(BasicosViewModel::class.java)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_certificado_laboral, container, false)

        recyclerView = view.findViewById<RecyclerView>(R.id.rvCertificadolaboral)
        adaptadorRV = AdapterRvCertificadoLaboral(context!!, this)
        recyclerView.layoutManager = LinearLayoutManager(context)
        recyclerView.adapter = adaptadorRV

        obteberFuncionario()
        observadorUriPdf()
        observadorError()

        return view
    }

    private fun observadorUriPdf() {
        vmCertificadoLaboral.uriPdf.observe(viewLifecycleOwner, Observer {
            Log.i("respode", it.toString())
            val intent = Intent(Intent.ACTION_VIEW, it)
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            startActivity(intent)
            ocultarProgresBar()
        })

    }

    private fun observadorError() {
        vmCertificadoLaboral.mensajeDialogoError.observe(this, Observer {
            val mensaje = it
            ocultarProgresBar()
            if (!mensaje.isNullOrEmpty()) {
                construirAlerta(context!!, R.layout.toas_login_warning, mensaje.toString())
            }
        })
    }

    private fun obteberFuncionario() {
        vmFuncionario.obtenerFuncionario()
        vmFuncionario.funcionario.observe(this, Observer {

            funcionarioId = it.id
            adaptadorRV.crearListaCertificados(llenarListaCertificados())
            adaptadorRV.notifyDataSetChanged()
        })
    }

    private fun llenarListaCertificados(): ArrayList<CertificadoLaboral> {

        val lista = ArrayList<CertificadoLaboral>()

        lista.add(
            0, CertificadoLaboral(
                R.drawable.ic_account_box,
                "Certificado laboral donde solo se muestre el cargo.",
                R.drawable.ic_save_alt,
                "api/Certificados/${funcionarioId}/cargo",
                "Certificado de cargo"
            )
        )

        lista.add(
            CertificadoLaboral(
                R.drawable.ic_monetization_onpx,
                "Certificado laboral donde solo se muestre el sueldo.",
                R.drawable.ic_save_alt,
                "api/Certificados/${funcionarioId}/sueldo",
                "Certificado de sueldo"
            )
        )

        lista.add(
            CertificadoLaboral(
                R.drawable.ic_business_centerpx,
                "Certificado laboral donde se muestre el cargo y el sueldo.",
                R.drawable.ic_save_alt,
                "api/Certificados/${funcionarioId}/sueldocargo",
                "Certificado de cargo y sueldo"
            )
        )
        return lista
    }

    override fun onCertificadoClick(position: Int) {
        val url = llenarListaCertificados()[position].URL
        val titulo = llenarListaCertificados()[position].titulo

        mostarProgresBar()
        vmCertificadoLaboral.obtenerCertificacoApi(url, titulo, context!!)
    }

    private fun mostarProgresBar(){
        pb_fragmentCertificadoLaboral.visibility = View.VISIBLE
    }

    private fun ocultarProgresBar(){
        pb_fragmentCertificadoLaboral.visibility = View.GONE
    }

}
