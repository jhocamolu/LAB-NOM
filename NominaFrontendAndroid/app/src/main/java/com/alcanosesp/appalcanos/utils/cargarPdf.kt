package com.alcanosesp.appalcanos.utils

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.os.Parcel
import android.os.Parcelable
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import java.io.File

class pruebaCargue(private val listener: OncargaListener): BottomSheetDialogFragment(){
    private val FOTO_GALERIA = 1
    private val TOMAR_FOTO = 2
    private val DOCUMENTO = 3
    private var photoFile: File? = null


    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "application/pdf"
        }

        startActivityForResult(intent, DOCUMENTO)

        val objectId = "222222"

        listener.resultado(objectId)
        return super.onCreateView(inflater, container, savedInstanceState)
    }

    fun esto(){

        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "application/pdf"
        }

        startActivityForResult(intent, DOCUMENTO)

        val objectId = "222222"

        listener.resultado(objectId)
    }






    interface OncargaListener {
        fun resultado(string: String)
    }






}

