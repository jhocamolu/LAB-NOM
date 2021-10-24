package com.alcanosesp.appalcanos.utils

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.DocumentsContract
import android.provider.MediaStore
import android.provider.OpenableColumns
import android.util.Base64
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.core.content.FileProvider
import androidx.core.net.toUri
import androidx.core.view.isVisible
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProviders
import com.alcanosesp.appalcanos.R
import com.alcanosesp.appalcanos.api.IRespuestaServidor
import com.alcanosesp.appalcanos.api.crearArchivoServer
import com.alcanosesp.appalcanos.db.entity.ArchivoAdjunto
import com.android.volley.VolleyError
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import kotlinx.android.synthetic.main.fragment_cargar_adjunto.*
import org.json.JSONObject
import java.io.File
import java.nio.file.Files
interface IAdjuntos{
    fun obtenerAdjunto(s: String)
}

class AdjuntoBeneficio(val listener: IAdjuntos)  : BottomSheetDialogFragment() {
    private val FOTO_GALERIA = 1
    private val TOMAR_FOTO = 2
    private val DOCUMENTO = 3
    private var photoFile: File? = null

    private var objectID: String = "null"


    private val viewModel by lazy {
        ViewModelProviders.of(this).get(ArchivoAdjuntoViewModel::class.java)
    }


    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_cargar_adjunto, container, false)

        val seleccionarDocumento =
            view.findViewById<LinearLayout>(R.id.llSeleccionarDocumentoDialogo)
        val seleccionarFoto = view.findViewById<LinearLayout>(R.id.llSeleccionarFotoDialogo)
        val tomarFoto = view.findViewById<LinearLayout>(R.id.llTomarFotoDialogo)


        seleccionarDocumento.setOnClickListener {
            val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = "application/pdf"
            }

            startActivityForResult(intent, DOCUMENTO)
        }


        seleccionarFoto.setOnClickListener {
            val iGaleria = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            iGaleria.type = "image/*"
            startActivityForResult(
                iGaleria,
                FOTO_GALERIA
            )
        }

        tomarFoto.setOnClickListener {
            Intent(MediaStore.ACTION_IMAGE_CAPTURE).also { takePictureIntent ->
                takePictureIntent.resolveActivity(context!!.packageManager)?.also {
                    photoFile = try {
                        crearArchivoImagen(context!!)
                    } catch (ex: Exception) {
                        // Error occurred while creating the File
                        Log.e("errorTomarFoto", "sss")
                        null

                    }

                    // Continue only if the File was successfully created
                    photoFile?.also {
                        val photoURI: Uri = FileProvider.getUriForFile(
                            context!!,
                            "com.alcanosesp.fileprovider",
                            photoFile!!
                        )
                        pb_cargar_adjunto.isVisible=true
                        takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI)
                        startActivityForResult(takePictureIntent, TOMAR_FOTO)
                    }
                }
            }
        }

        viewModel.archivoAdjunto.observe(this, Observer {
            Log.i("Obserac", " cerrar")
            dismiss()
        })

        return view
    }


    @RequiresApi(Build.VERSION_CODES.O)
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        val validador = Validador()

        when (requestCode) {
            FOTO_GALERIA -> {
                if (resultCode == Activity.RESULT_OK) {
                    pb_cargar_adjunto.isVisible=true
                    ll_item_cargar_adjunto.isVisible=false

                    val selectedImage = data?.data
                    Log.i("Foto", selectedImage.toString())
                    val imageBitmap = uriToBitmapNoCambiaTamanio(context!!, selectedImage!!)
                    val tamanioPermitido = validador.ajustarPesoPermitido(context!!, imageBitmap)
                    val imgString: String = bitMapToString(tamanioPermitido)

                    cargarImagen(imgString, this)

                } else {
                    Toast.makeText(context, "No selecciono una imagen.", Toast.LENGTH_LONG).show()
                }

            }
            TOMAR_FOTO -> {
                if (resultCode == Activity.RESULT_OK) {
                    pb_cargar_adjunto.isVisible=true
                    ll_item_cargar_adjunto.isVisible=false
                    val filePath = photoFile?.path
                    Log.i("filePath", filePath)
                    val imageBitmap = BitmapFactory.decodeFile(filePath)
                    val rotation = obtenerRatacionIMagen(filePath!!)
                    val rotatedBitmap = ajustarRotacionimagen(rotation, imageBitmap)
                    val tamaniPermitido = validador.ajustarPesoPermitido(context!!, rotatedBitmap)
                    val imgString: String = bitMapToString(tamaniPermitido)

                    cargarImagen(imgString, this)

                } else {
                    Toast.makeText(context, "No tomó una foto.", Toast.LENGTH_LONG).show()
                }
            }
            DOCUMENTO -> {
                if (resultCode == Activity.RESULT_OK) {
                    mostrarProgessBar()

                    data?.data?.also { uri ->

                        val inputStream = context?.contentResolver?.openInputStream(uri)
                        val byteArray = inputStream?.readBytes()

                        if (byteArray?.size!! > validador.PESO_MAXIMO_PDF) {
                            construirAlerta(context!!,R.layout.toas_login_warning,"Solo puedes cargar Pdf con un tamaño menor a 5 Mb.")
                        }else{
                            val base64 =
                                Base64.encodeToString(byteArray, Base64.DEFAULT).replace("\n", "")
                            cargarImagen(base64, this)
                        }
                        /*val intent   =  Intent(Intent.ACTION_VIEW);
                        intent.type="application/pdf";
                        intent.data=uri;
                        intent.flags=Intent.FLAG_ACTIVITY_CLEAR_TOP;
                        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        startActivity(intent)*/
                    }
                } else {
                    Toast.makeText(context, "No selecciono una imagen.", Toast.LENGTH_LONG).show()
                }

            }
        }
    }

    private fun mostrarProgessBar() {
        pb_cargar_adjunto.isVisible = true
        ll_item_cargar_adjunto.isVisible = false
    }

    fun cargarImagen(imgB64: String, bottomSheet: AdjuntoBeneficio) {
        val callbackArchivoAdjunto = object : IRespuestaServidor {

            override fun exito(respuesta: Any?) {
                val json = JSONObject(respuesta.toString())

                objectID = json.getString("object_id")
                bottomSheet.dismiss()
                listener.obtenerAdjunto(objectID)
            }

            override fun error(error: VolleyError) {
                Log.e("Error", "CargarAdjunto volley ${error.networkResponse.statusCode}")
                viewModel.obtenerArchivoAdjunto()
            }
        }

        crearArchivoServer(context!!, imgB64, callbackArchivoAdjunto)
    }


    fun objectAdjunto(): String {
        /*return if (objectID == null){
            "null"
        }else{
            objectID
        }*/
        return objectID
    }

}