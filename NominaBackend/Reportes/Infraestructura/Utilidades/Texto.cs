using System;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;

namespace Reportes.Infraestructura.Utilidades
{
    public static class Texto
    {
        public static string LetraCapital(string oracion)
        {
            if (string.IsNullOrEmpty(oracion))
            {
                return null;
            }
            else
            {
                oracion = oracion.ToLower();
                TextInfo texto = new CultureInfo("es-ES", false).TextInfo;
                return texto.ToTitleCase(oracion);
            }
        }
        public static string TipoOracion(string oracion = null)
        {
            if (string.IsNullOrEmpty(oracion))
            {
                return null;
            }
            else
            {
                oracion = oracion.ToLower();
                return oracion.First().ToString().ToUpper() + oracion.Substring(1);
            }
        }

        public static string QuitarAcentos(string inputString)
        {
            inputString = inputString.ToLower();
            Regex replace_a_Accents = new Regex("[�|�|�|�]", RegexOptions.Compiled);
            Regex replace_e_Accents = new Regex("[�|�|�|�]", RegexOptions.Compiled);
            Regex replace_i_Accents = new Regex("[�|�|�|�]", RegexOptions.Compiled);
            Regex replace_o_Accents = new Regex("[�|�|�|�]", RegexOptions.Compiled);
            Regex replace_u_Accents = new Regex("[�|�|�|�]", RegexOptions.Compiled);
            Regex replace_n_Accents = new Regex("[�]", RegexOptions.Compiled);
            inputString = replace_a_Accents.Replace(inputString, "a");
            inputString = replace_e_Accents.Replace(inputString, "e");
            inputString = replace_i_Accents.Replace(inputString, "i");
            inputString = replace_o_Accents.Replace(inputString, "o");
            inputString = replace_u_Accents.Replace(inputString, "u");
            inputString = replace_n_Accents.Replace(inputString, "n");
            return inputString;
        }

        public static string LimpiarTexto(string inputString)
        {
            inputString = inputString.ToLower();
            Regex replace_parentesis = new Regex("[(|)]", RegexOptions.Compiled);
            Regex replace_corchetes = new Regex("[{|}]", RegexOptions.Compiled);
            Regex replace_slash = new Regex("[/|\\)]", RegexOptions.Compiled);
            Regex replace_matematicos = new Regex("[+|\\-|*]", RegexOptions.Compiled);
            Regex replace_interrogacion = new Regex("[?|�|�|!]", RegexOptions.Compiled);
            inputString = replace_parentesis.Replace(inputString, "");
            inputString = replace_corchetes.Replace(inputString, "");
            inputString = replace_slash.Replace(inputString, "");
            inputString = replace_matematicos.Replace(inputString, "");
            inputString = replace_interrogacion.Replace(inputString, "");
            return inputString;
        }
    }
}