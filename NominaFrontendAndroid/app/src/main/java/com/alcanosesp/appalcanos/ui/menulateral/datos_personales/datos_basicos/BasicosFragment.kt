package com.alcanosesp.appalcanos.ui.menulateral.datos_personales.datos_basicos

import android.content.Context
import android.os.Bundle
import android.os.Handler
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import android.widget.AdapterView
import android.widget.TextView
import androidx.core.content.res.ResourcesCompat
import androidx.core.view.isVisible
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProviders
import com.alcanosesp.appalcanos.App
import com.alcanosesp.appalcanos.R
import com.alcanosesp.appalcanos.adapter.SpinnerAdapter
import com.alcanosesp.appalcanos.api.IRespuestaServidor
import com.alcanosesp.appalcanos.api.editarFuncionario
import com.alcanosesp.appalcanos.api.obtenerFuncionario
import com.alcanosesp.appalcanos.databinding.FragmentBasicosBinding
import com.alcanosesp.appalcanos.db.entity.Funcionario
import com.alcanosesp.appalcanos.model.ItemSpinner
import com.alcanosesp.appalcanos.utils.Validador
import com.alcanosesp.appalcanos.utils.construirAlerta
import com.alcanosesp.appalcanos.utils.obtenerMensajesJsonDialog
import com.alcanosesp.appalcanos.utils.obtenerMensajesJsonLabel
import com.android.volley.VolleyError
import com.google.android.material.snackbar.Snackbar
import org.json.JSONObject


class BasicosFragment : Fragment() {

    private val viewModel by lazy {
        ViewModelProviders.of(this).get(BasicosViewModel::class.java)
    }
    private lateinit var binding: FragmentBasicosBinding
    private lateinit var adapterPaises: SpinnerAdapter
    private lateinit var adapterDeptos: SpinnerAdapter
    private lateinit var adapterMunicipios: SpinnerAdapter
    private lateinit var adapterViviendas: SpinnerAdapter
    private lateinit var adapterLentes: SpinnerAdapter
    private val lentes: ArrayList<ItemSpinner> = ArrayList()
    private var cargaInicialEditar = false
    private val handler = Handler()
    private var posicionItemSpinner = 0
    private val VISUALIZAR = 1
    private val EDITAR = 2
    private val CARGA = 3
    private val touchListenerS = View.OnTouchListener { _, _ ->
        cerrarTeclado()
        false
    }

    override fun onResume() {
        super.onResume()
        inicializarVariables()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        adapterLentes = SpinnerAdapter(context!!)
        adapterPaises = SpinnerAdapter(context!!)
        adapterDeptos = SpinnerAdapter(context!!)
        adapterViviendas = SpinnerAdapter(context!!)
        adapterMunicipios = SpinnerAdapter(context!!)
        lentes.add(ItemSpinner(1, "Si"))
        lentes.add(ItemSpinner(2, "No"))
        adapterLentes.setItems(lentes)
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = DataBindingUtil.inflate(inflater, R.layout.fragment_basicos, container, false)

        observadorFuncionario()
        adaptadoLentes()
        observadoryAdaptadorPais()
        observadoryAdaptadorDepartamento()
        observadoryAdaptadorMunicipio()
        observadoryAdaptadorVivienda()
        bindearFuncionario()
        clickEditar()
        clickGuardarDatos()
        clickRegresar()

        return binding.root
    }

    private fun bindearFuncionario() {
        mostrarProgressBar()
        viewModel.obtenerFuncionario()
    }

    private fun clickEditar() = binding.fabDatosBasicos.setOnClickListener {
        cargaInicialEditar = true
        mostrarEdicion(true)
    }

    private fun clickGuardarDatos() = binding.btnGuardarDatosBasicos.setOnClickListener {
        cerrarTeclado()
        if (validarAntesdeEnviar()) {
            actualizarInfo()
        } else {
            crearSnackbar(false).show()
        }
    }

    private fun clickRegresar() =binding.fabRegresa.setOnClickListener {
        inicializarVariables()
        binding.visualizacionDatosBasicos.visibility = View.VISIBLE
        binding.edicionDatosBasicos.visibility = View.GONE
    }

    private fun mostrarEdicion(mostrar: Boolean) {
        Log.i("cargaInicialEditar", "$cargaInicialEditar")
        when (mostrar) {
            true -> {
                mostrarProgressBar()
                binding.fabDatosBasicos.hide()
                binding.visualizacionDatosBasicos.visibility = View.GONE
                binding.edicionDatosBasicos.visibility = View.VISIBLE

                binding.msgErrorCorreoPersonal.text = ""
                binding.msgErrorPaisResidencia.text = ""
                binding.msgErrorDepartamentoResidencia.text = ""
                binding.msgErrorMunicipioResidencia.text = ""

                viewModel.obtenerPaisesApi()

                posicionItemSpinner =
                    adapterLentes.obtenerPosicionNombre(binding.funcionario?.usaLentes!!)
                binding.spLentes.setSelection(posicionItemSpinner)

            }
            false -> {
                binding.fabDatosBasicos.show()
                inicializarVariables()
            }
        }
    }

    private fun validarAntesdeEnviar(): Boolean {
        val validador = Validador()
        var retorno = true

        if (!validador.campoDireccion(
                binding.etDireccion,
                binding.msgErrorDireccion,
                true
            )
        ) retorno = false

        if (!validador.campoTelefono(
                binding.etTelefonoFijo,
                binding.msgErrorTelefonoFijo,
                false
            )
        ) retorno = false

        if (!validador.campoAlfabetico(
                binding.etTallaCamisa,
                binding.msgErrorTallaCamisa,
                false
            )
        ) retorno = false

        if (!validador.campoCelular(binding.etCelular, binding.msgErrorCelular, true)) retorno =
            false

        if (!validador.spinnerRequerido(binding.spVivienda, binding.msgErrorTipoVivienda)) retorno =
            false

        if (!validador.spinnerRequerido(binding.spLentes, binding.msgErrorTipoVivienda)) retorno =
            false

        if (!validador.spinnerRequerido(
                binding.spPaisResidencia,
                binding.msgErrorPaisResidencia
            )
        ) retorno = false

        if (!validador.spinnerRequerido(
                binding.spDepartamentoResidencia,
                binding.msgErrorDepartamentoResidencia
            )
        ) retorno = false

        if (!validador.spinnerRequerido(
                binding.spMunicipioResidencia,
                binding.msgErrorMunicipioResidencia
            )
        ) retorno = false

        if (!validador.campoCorreo(
                binding.etCorreoPersonal,
                binding.msgErrorCorreoPersonal,
                false
            )
        ) retorno = false

        return retorno
    }

    private fun actualizarInfo() {
        binding.btnGuardarDatosBasicos.isEnabled = false
        val id = App.idFuncionario

        val parametros = JSONObject()
        parametros.put("id", id)
        parametros.put("divisionPoliticaNivel2ResidenciaId", viewModel.idMunicipioSeleccionado)
        parametros.put("celular", binding.etCelular.text.toString())
        parametros.put("telefonoFijo", binding.etTelefonoFijo.text.toString())
        parametros.put("tipoViviendaId", viewModel.idViviendaSeleccionada)
        parametros.put("direccion", binding.etDireccion.text.toString())
        parametros.put("tallaCamisa", binding.etTallaCamisa.text.toString())
        parametros.put("tallaPantalon", binding.etTallaPantalon.text.toString())
        parametros.put("numeroCalzado", binding.etNumeroCalzado.text.toString())
        parametros.put("usaLentes", toBool(viewModel.usaLentes!!))
        parametros.put("correoElectronicoPersonal", binding.etCorreoPersonal.text.toString())

        val callbackFuncionario = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                Log.i("parametrosRespo", respuesta.toString())
                crearSnackbar(true).show()
                actualizarFuncionario()

                val handler = Handler()
                val run = Runnable {
                    mostrarEdicion(false)
                }
                handler.postDelayed(run, 3000)
            }

            override fun error(error: VolleyError) {
                crearSnackbar(false).show()
                Log.d("respuestaConError", error.toString())

                binding.btnGuardarDatosBasicos.isEnabled = true

                val errors = String(error.networkResponse.data)

                obtenerMensajesBacked(JSONObject(errors).getJSONObject("errors"))
            }

        }

        editarFuncionario(context!!, callbackFuncionario, parametros, id!!)
        Log.i("parametros", parametros.toString())
    }

    private fun obtenerMensajesBacked(error: JSONObject) {
        val message: String? = error.optString("message")
        if (message!!.isNotEmpty()) {
            construirAlerta(context!!, R.layout.toas_login_warning, message)
        } else {
            val jsonErrors = error.getJSONObject("errors")

            obtenerMensajesJsonDialog(jsonErrors, "errror", context!!)
            obtenerMensajesJsonDialog(jsonErrors, "snack", context!!)
            obtenerMensajesJsonDialog(jsonErrors, "funcionarioId", context!!)

            obtenerMensajesJsonLabel(
                jsonErrors, "correoElectronicoPersonal", binding.msgErrorCorreoPersonal
            )
            obtenerMensajesJsonLabel(
                jsonErrors, "direccion", binding.msgErrorDireccion
            )
            obtenerMensajesJsonLabel(
                jsonErrors, "celular", binding.msgErrorCelular
            )
        }
    }

    private fun actualizarFuncionario() {
        llamadoFuncionarioApi(viewModel.obtenerCedulaFuncionario())
    }

    private fun llamadoFuncionarioApi(cedula: String?) {
        val callbackFuncionario = object : IRespuestaServidor {
            override fun exito(respuesta: Any?) {
                val json = JSONObject(respuesta.toString())
                val value = json.get("value")

                if (value.toString() != "[]") {
                    val valueObj = json.getJSONArray("value")[0]
                    val datosFuncionario = JSONObject(valueObj.toString())

                    viewModel.actualizarFuncionario(Funcionario(datosFuncionario))

                    bindearFuncionario()
                } else {
                    Log.i("ManuLateRespuestaValue", "Vacio/nullo")
                    //Generar alerta que no hay datos del usuario
                }
            }

            override fun error(error: VolleyError) {
                Log.d("respuestaConError", error.toString())
            }

        }
        obtenerFuncionario(context!!, cedula!!, callbackFuncionario)
    }

    private fun crearSnackbar(exito: Boolean): Snackbar {
        return Snackbar.make(view!!, "Snackbar", 2600).apply {

            val vista = view

            when (exito) {
                true -> {
                    setText("Información actualizada.")
                    vista.setBackgroundColor(context.getColor(R.color.verde_pera))
                }
                false -> {
                    setText("Ha ocurrido un error al procesar la información.")
                    vista.setBackgroundColor(context.getColor(R.color.rojo))
                }
            }

            vista.findViewById<TextView>(com.google.android.material.R.id.snackbar_text).apply {
                typeface = ResourcesCompat.getFont(context!!, R.font.muli_regular)
            }

            vista.findViewById<TextView>(com.google.android.material.R.id.snackbar_action).apply {
                typeface = ResourcesCompat.getFont(context!!, R.font.muli_bold)
                isAllCaps = false
            }

            setAction("Aceptar") {
                dismiss()
            }
        }
    }

    private fun observadoryAdaptadorPais() {
        viewModel.listaPaises.observe(viewLifecycleOwner, Observer {
            adapterPaises.clear()
            adapterPaises.setItems(it)

            posicionItemSpinner = adapterPaises.obtenerPosicionValor(
                ItemSpinner(
                    binding.funcionario?.paisResidenciaId!!.toInt(),
                    binding.funcionario?.paisResidenciaNombre.toString()
                )
            )
            binding.spPaisResidencia.setSelection(posicionItemSpinner)
        })

        binding.spPaisResidencia.adapter = adapterPaises
        binding.spPaisResidencia.dropDownWidth = 960
        binding.spPaisResidencia.dropDownHorizontalOffset = -30
        binding.spPaisResidencia.setOnTouchListener(touchListenerS)
        binding.spPaisResidencia.onItemSelectedListener =
            object : AdapterView.OnItemSelectedListener {
                override fun onNothingSelected(parent: AdapterView<*>?) {
                }

                override fun onItemSelected(
                    parent: AdapterView<*>?,
                    view: View?,
                    position: Int,
                    id: Long
                ) {
                    val seleccion = parent?.getItemAtPosition(position) as ItemSpinner
                    if (seleccion.id != 0) {
                        viewModel.paisSeleccionado(seleccion.id)
                    }
                    handler.postDelayed({ viewModel.obtenerDeptosApi() }, 100)
                }
            }
    }

    private fun observadoryAdaptadorDepartamento() {
        viewModel.listaDepartamentos.observe(viewLifecycleOwner, Observer {
            adapterDeptos.clear()
            adapterDeptos.setItems(it)
            if (cargaInicialEditar) {
                posicionItemSpinner = adapterDeptos.obtenerPosicionValor(
                    ItemSpinner(
                        binding.funcionario?.departamentoResidenciaId!!.toInt(),
                        binding.funcionario?.departamentoResidenciaNombre!!
                    )
                )
                binding.spDepartamentoResidencia.setSelection(posicionItemSpinner)
            } else {
                ocultarProgressBar(CARGA)
            }
        })

        binding.spDepartamentoResidencia.adapter = adapterDeptos
        binding.spDepartamentoResidencia.dropDownWidth = 960
        binding.spDepartamentoResidencia.dropDownHorizontalOffset = -30
        binding.spPaisResidencia.setOnTouchListener(touchListenerS)
        binding.spDepartamentoResidencia.onItemSelectedListener =
            object : AdapterView.OnItemSelectedListener {
                override fun onNothingSelected(parent: AdapterView<*>?) {
                }

                override fun onItemSelected(
                    parent: AdapterView<*>?,
                    view: View?,
                    position: Int,
                    id: Long
                ) {
                    val seleccion = parent?.getItemAtPosition(position) as ItemSpinner
                    if (seleccion.id != 0) {
                        viewModel.deptoSeleccionado(seleccion.id)
                    }
                    handler.postDelayed({ viewModel.obtenerMunicipiosApi() }, 100)
                    if (!cargaInicialEditar) {
                        binding.spMunicipioResidencia.setSelection(0)
                        ocultarProgressBar()
                    }
                }
            }
    }

    private fun observadoryAdaptadorMunicipio() {
        viewModel.listaMunicipios.observe(viewLifecycleOwner, Observer {
            adapterMunicipios.clear()
            adapterMunicipios.setItems(it)
            if (cargaInicialEditar) {
                posicionItemSpinner = adapterMunicipios.obtenerPosicionValor(
                    ItemSpinner(
                        binding.funcionario?.municipioResidenciaId!!.toInt(),
                        binding.funcionario?.municipioResidenciaNombre!!
                    )
                )
                binding.spMunicipioResidencia.setSelection(posicionItemSpinner)
            } else {
                ocultarProgressBar()
            }
        })

        binding.spMunicipioResidencia.adapter = adapterMunicipios
        binding.spMunicipioResidencia.dropDownWidth = 960
        binding.spMunicipioResidencia.dropDownHorizontalOffset = -30
        binding.spPaisResidencia.setOnTouchListener(touchListenerS)
        binding.spMunicipioResidencia.onItemSelectedListener =
            object : AdapterView.OnItemSelectedListener {
                override fun onNothingSelected(parent: AdapterView<*>?) {
                }

                override fun onItemSelected(
                    parent: AdapterView<*>?,
                    view: View?,
                    position: Int,
                    id: Long
                ) {
                    val seleccion = parent?.getItemAtPosition(position) as ItemSpinner
                    if (seleccion.id != 0) {
                        viewModel.municipioSeleccionado(seleccion.id)
                    }
                    if (cargaInicialEditar) {
                        viewModel.obtenerTipoViviendasApi()
                    }
                }
            }
    }

    private fun observadoryAdaptadorVivienda() {
        viewModel.listaTiposVivienda.observe(viewLifecycleOwner, Observer {
            adapterViviendas.clear()
            adapterViviendas.setItems(it)
            if (cargaInicialEditar) {
                posicionItemSpinner = adapterViviendas.obtenerPosicionValor(
                    ItemSpinner(
                        binding.funcionario?.tipoViviendaId!!.toInt(),
                        binding.funcionario?.tipoViviendaNombre!!
                    )
                )
                binding.spVivienda.setSelection(posicionItemSpinner)
            }
            handler.postDelayed({ ocultarProgressBar(EDITAR) }, 10)

        })

        binding.spVivienda.adapter = adapterViviendas
        binding.spVivienda.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onNothingSelected(parent: AdapterView<*>?) {
            }

            override fun onItemSelected(
                parent: AdapterView<*>?,
                view: View?,
                position: Int,
                id: Long
            ) {
                val seleccion = parent?.getItemAtPosition(position) as ItemSpinner
                viewModel.tipoViviendaSeleccionada(seleccion.id)
            }
        }
    }

    private fun observadorFuncionario() {
        viewModel.funcionario.observe(viewLifecycleOwner, Observer {
            binding.funcionario = it
            ocultarProgressBar(VISUALIZAR)
        })

    }

    private fun adaptadoLentes() {
        binding.spLentes.adapter = adapterLentes
        binding.spLentes.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onNothingSelected(parent: AdapterView<*>?) {
            }

            override fun onItemSelected(
                parent: AdapterView<*>?,
                view: View?,
                position: Int,
                id: Long
            ) {
                val seleccion = parent?.getItemAtPosition(position) as ItemSpinner
                viewModel.usaLentesSeleccion(seleccion.nombre)
            }
        }
    }

    private fun cerrarTeclado() {
        val vista = activity?.currentFocus
        if (vista != null) {
            val input =
                activity?.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
            input.hideSoftInputFromWindow(vista.windowToken, 0)
        }
    }

    //SE PUEDE HACER GENERAL EN OTRA CLASE, O EN VALIDADOR
    private fun toBool(s: String): Boolean {
        return when (s) {
            "Si" -> true
            else -> false
        }
    }

    private fun mostrarProgressBar() {
        binding.pbBasicos.isVisible = true
        binding.btnGuardarDatosBasicos.isEnabled = false
    }

    private fun ocultarProgressBar(tipo: Int? = null) {
        when (tipo) {
            VISUALIZAR -> {
                binding.visualizacionDatosBasicos.isVisible = true
                binding.pbBasicos.isVisible = false
            }
            EDITAR -> {
                binding.edicionDatosBasicos.isVisible = true
                binding.btnGuardarDatosBasicos.isEnabled = true
                binding.fabRegresa.show()
                binding.fabRegresa.setImageResource(R.drawable.ic_edit)
                binding.fabRegresa.setImageResource(R.drawable.ic_arrow_back)
                binding.pbBasicos.isVisible = false
            }
            CARGA -> {
                binding.pbBasicos.isVisible = false
            }
            else -> {
                binding.pbBasicos.isVisible = false
            }
        }
    }

    private fun inicializarVariables() {
        cargaInicialEditar = false
        binding.fabRegresa.hide()
        binding.fabDatosBasicos.show()

        binding.visualizacionDatosBasicos.visibility = View.VISIBLE
        binding.edicionDatosBasicos.visibility = View.GONE

        binding.spPaisResidencia.setSelection(0)
        binding.spDepartamentoResidencia.setSelection(0)
        binding.spMunicipioResidencia.setSelection(0)
        binding.spVivienda.setSelection(0)
    }
}