package com.alcanosesp.appalcanos.utils

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.Fragment
import com.alcanosesp.appalcanos.R
import com.alcanosesp.appalcanos.api.headers
import com.alcanosesp.appalcanos.databinding.FragmentWebViewBinding


class WebViewFragment : Fragment() {

    private lateinit var binding: FragmentWebViewBinding
    private lateinit var url: String
    private var cargaConEexito: Boolean = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        arguments?.let {

            val datos = it.getStringArray("datos")
            val titulo = datos?.get(0).toString()

            url = datos?.get(1).toString()
            (activity as AppCompatActivity?)!!.supportActionBar?.title = titulo
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = DataBindingUtil.inflate(inflater, R.layout.fragment_web_view, container, false)

        binding.fabWebView.setImageDrawable(context!!.getDrawable(R.drawable.ic_save_alt))

        cargarWebView()
        clicDescargar()

        return binding.root
    }

    private fun clicDescargar() {
        binding.fabWebView.setOnClickListener {
            val pilaIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            startActivity(pilaIntent)

        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun cargarWebView() {
        binding.run {

            wvPrincipal.settings.javaScriptEnabled = true
            wvPrincipal.settings
            wvPrincipal.loadUrl(url,headers())
            //Log.i("ss", url)

            wvPrincipal.webViewClient = object : WebViewClient() {
                override fun onPageFinished(
                    view: WebView,
                    url: String
                ) {

                    if (cargaConEexito) {
                        binding.fabWebView.isVisible = true
                    } else {
                        binding.tvErrorWebView.isVisible = true
                        binding.ivWebView.isVisible = true

                    }
                    binding.pbWebView.isVisible = false
                    binding.wvPrincipal.isVisible = true
                    Log.i("certificados", "onPageFinished $url")
                    Log.i("cargaConEexito", "$cargaConEexito")
                }


                override fun onPageCommitVisible(view: WebView?, url: String?) {
                    super.onPageCommitVisible(view, url)
                    Log.i("certificados", "onPageCommitVisible $url")

                    cargaConEexito = true
                }

                override fun onReceivedError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    error: WebResourceError?
                ) {
                    super.onReceivedError(view, request, error)
                    Toast.makeText(context, "ss", Toast.LENGTH_LONG).show()
                }
            }
        }

    }
}
