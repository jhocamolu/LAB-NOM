package com.alcanosesp.appalcanos.utils

import android.app.Application
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.ParcelFileDescriptor
import androidx.lifecycle.MutableLiveData
import com.alcanosesp.appalcanos.db.AppDatabase
import com.alcanosesp.appalcanos.db.entity.ArchivoAdjunto
import kotlinx.coroutines.launch
import java.io.FileDescriptor

class ArchivoAdjuntoViewModel(application: Application) : BaseViewModel(application) {
    val db = AppDatabase(getApplication())
    private val daoArchivoAdjunto = db.archivoAdjuntoDao()
    val bitmap = MutableLiveData<Bitmap?>()

    val archivoAdjunto = MutableLiveData<List<ArchivoAdjunto>>()

    fun obtenerArchivoAdjunto() {
        launch {

            archivoAdjunto.value = daoArchivoAdjunto.obtenerArchivoAdjunto()
        }
    }

    fun insertarArchivoAdjunto(archivoAdjunto: ArchivoAdjunto) {
        eliminarArchivoAdjunto()
        launch {
            daoArchivoAdjunto.insertarArchivoAdjunto(archivoAdjunto)
        }
    }

    fun eliminarArchivoAdjunto() {
        launch {
            daoArchivoAdjunto.eliminarArchivoAdjunto()
        }
    }

    fun readTextFromUri(uri: Uri, context: Context) {
        launch {
            fun desc(parcelFileDescriptor: ParcelFileDescriptor): FileDescriptor {
                return parcelFileDescriptor.fileDescriptor
            }

            val parcelFileDescriptor= context.contentResolver.openFileDescriptor(uri, "r")!!

            desc(parcelFileDescriptor).also { it ->

                var imagen = BitmapFactory.decodeFileDescriptor(it)


                parcelFileDescriptor.close()
                bitmap.value = imagen
            }
        }
    }
}