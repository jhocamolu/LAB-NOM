package com.alcanosesp.appalcanos.utils

import com.alcanosesp.appalcanos.R
import java.util.*
import kotlin.collections.HashMap

val colorEstados = HashMap<String, Int?>().apply {
    put("", R.color.blanco)
    put("Pendiente", R.color.fuego)
    put("Registrado", R.color.fuego)
    put("Solicitada", R.color.fuego)
    put("EnTramite", R.color.fuego)
    put("Rechazado", R.color.coral)
    put("Rechazada", R.color.coral)
    put("Validado", R.color.turquesa)
    put("Aprobado", R.color.turquesa)
    put("Aprobada", R.color.turquesa)
    put("Procesado", R.color.purpura)
    put("Condonada", R.color.purpura)
    put("Finalizado", R.color.nude)
    put("Terminada", R.color.nude)
    put("Finalizada", R.color.nude)
    put("Cancelada", R.color.carmesi)
    put("EnCurso", R.color.verde_menta)
    put("Otorgada", R.color.verde_menta)
    put("Interrumpida", R.color.magenta)
    put("EnCondonacion",  R.color.magenta)
    put("Autorizada", R.color.verde_lima)
    put("Anulado", R.color.castano)
    put("Anulada", R.color.castano)
    put("EnReembolso", R.color.azul_verdoso)
}

val listaColores = ArrayList<Int>().apply {
    add(R.color.magenta)
    add(R.color.fuego)
    add(R.color.azul_verdoso)
    add(R.color.ultravioleta)
    add(R.color.azul_rey)
    add(R.color.salmon)
    add(R.color.castano)
    add(R.color.naranja)
    add(R.color.mandarina)
    add(R.color.purpura)
    add(R.color.turquesa)
    add(R.color.nude)
    add(R.color.carmesi)
    add(R.color.verde_menta)
    add(R.color.coral)
    add(R.color.verde_lima)
}

val estadosInformacion = HashMap<String, Int?>().apply {
    put("", R.color.blanco)
    put("null", R.color.blanco)
    put("Pendiente", R.color.fuego)
    put("Validado", R.color.turquesa)
    put("Rechazado", R.color.coral)
}

val estadosAusentismoFuncionario = HashMap<String, Int?>().apply {
    put("", R.color.blanco)
    put("null", R.color.blanco)
    put("Registrado", R.color.fuego)
    put("Procesado", R.color.purpura)
    put("Aprobado", R.color.turquesa)
    put("Anulado", R.color.castano)
    put("Finalizado", R.color.nude)

}

val estadosBeneficiosdash = HashMap<String, Int?>().apply {
    put("EnTramite", R.color.fuego)
    put("Rechazada", R.color.coral)
    put("Aprobada", R.color.turquesa)
    put("Cancelada", R.color.carmesi)
    put("Autorizada", R.color.verde_lima)
    put("Otorgada", R.color.verde_menta)
    put("Finalizada", R.color.nude)
    put("EnCondonacion",  R.color.magenta)
    put("EnReembolso", R.color.azul_verdoso)
    put("Condonada", R.color.purpura)
    put("null", R.color.blanco)
    put("", R.color.blanco)
}

val estadosBeneficios = HashMap<String, Int?>().apply {
    put("Aprobada", R.color.turquesa)
    put("Autorizada", R.color.verde_lima)
    put("Otorgada", R.color.verde_menta)
    put("EnTramite", R.color.fuego)
    put("Condonada", R.color.purpura)
    put("Rechazada", R.color.coral)
    put("EnReembolso", R.color.fuego)
    put("Cancelada", R.color.carmesi)
    put("Finalizada", R.color.nude)
    put("EnCondonacion",  R.color.magenta)
    put("null", R.color.blanco)
    put("", R.color.blanco)
}

val estadosPermisos = HashMap<String, Int?>().apply {
    put("", R.color.blanco)
    put("null", R.color.blanco)
    put("Aprobada", R.color.turquesa)
    put("Autorizada", R.color.verde_lima)
    put("Cancelada", R.color.carmesi)
    put("Solicitada", R.color.fuego)
    put("Rechazada", R.color.coral)
}

val estaditos = HashMap<String, Int?>().apply {
    put("", R.color.blanco)
    put("null", R.color.blanco)
    put("Solicitada", R.color.fuego)
    put("Cancelada", R.color.carmesi)
    put("Rechazada", R.color.coral)
    put("Aprobada", R.color.turquesa)
    put("Autorizada", R.color.verde_lima)
}

val estadosVacaciones = HashMap<String, Int?>().apply {
    put("Aprobada", R.color.turquesa)
    put("Autorizada", R.color.verde_lima)
    put("Cancelada", R.color.carmesi)
    put("EnCurso", R.color.verde_menta)
    put("Interrumpida", R.color.magenta)
    put("Rechazada", R.color.coral)
    put("Solicitada", R.color.fuego)
    put("Terminada", R.color.nude)
    put("null", R.color.blanco)
    put("", R.color.blanco)
}

val estadosBeneficiosNombres = HashMap<String, String>().apply {
    put("", "")
    put("Aprobada", "Aprobada")
    put("EnTramite", "En trámite")
    put("EnReembolso", "En reembolso")
    put("Autorizada", "Autorizada")
    put("Condonada", "Condonada")
    put("EnCondonacion", "En condonación")
    put("Cancelada", "Cancelada")
    put("Otorgada", "Otorgada")
    put("Rechazada", "Rechazada")
    put("Finalizada", "Finalizada")

    put("Solicitada", "Solicitada")

    //Vacaciones
    put("EnCurso","En curso")
    put("Interrumpida","Interrumpida")
    put("Solicitada","Solicitada")
    put("Terminada","Terminada")
    put("Anulada","Anulada")
}

val opcionAxulioEducativoNombres = HashMap<String, String>().apply {
    put("", "")
    put("Opcion1Condonacion", "Opción 1: condonación")
    put("Opcion2Condonacionyfinanciacion", "Opción 2: condonación y financiación")
}
val opcionAxulioEducativoNombreC = HashMap<String, String>().apply {
    put("", "")
    put("Opción 1: condonación", "Opcion1Condonacion")
    put("Opción 2: condonación y financiación", "Opcion2Condonacionyfinanciacion")
}