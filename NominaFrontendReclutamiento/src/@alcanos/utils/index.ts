import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';


export class AlcanosValidators {

    /**
     * 
     * @param {number} length 
     * @returns {ValidatorFn}
     */
    static maxLength(length: number): ValidatorFn {
        return (control: AbstractControl): any => {
            if (control.value != null && `${control.value}`.length > length) {
                const errors = {};
                errors[`Máximo de caracteres ${length}.`] = true;
                return errors;
            }
        };
    }


    /**
     * 
     * @param {number} length 
     * @returns {ValidatorFn}
     */
    static minLength(length: number): ValidatorFn {
        return (control: AbstractControl): any => {
            if (control.value != null && `${control.value}`.length < length) {
                const errors = {};
                errors[`Mínimo de caracteres ${length}.`] = true;
                return errors;
            }
        };
    }


    /**
     * 
     * @param control 
     * @returns {ValidationErrors | null}
     */
    static alfabetico(control: AbstractControl): ValidationErrors | null {
        if (control.value != null && `${control.value}`.trim().length > 0) {
            const exp = new RegExp(`^[A-Za-zäÄëËïÏöÖüÜáéíóúáéíóúÁÉÍÓÚñÑ\\s]*$`);
            if (!exp.test(control.value)) {
                return { 'El campo debe ser alfabético. ': true };
            }
        }
        return null;
    }

    /**
     * 
     * @param control 
     * @returns {ValidationErrors | null}
     */
    static mayusculas(control: AbstractControl): ValidationErrors | null {
        if (control.value != null && `${control.value}`.trim().length > 0) {
            const exp = new RegExp(`^[A-ZÄËÏÖÜÁÉÍÓÚÑ\\s]*$`);
            if (!exp.test(control.value)) {
                return { 'El campo debe ser alfabético con mayúsculas.': true };
            }
        }
        return null;
    }

    /**
     * 
     * @param control 
     * @returns {ValidationErrors | null}
     */
    static minusculas(control: AbstractControl): ValidationErrors | null {
        if (control.value != null && `${control.value}`.trim().length > 0) {
            const exp = new RegExp(`^[a-zäëïöüáéíóúáéíóúñ\\s]*$`);
            if (!exp.test(control.value)) {
                return { 'El campo debe ser alfabético con minúsculas.': true };
            }
        }
        return null;
    }

    /**
     * 
     * @param control 
     * @returns {ValidationErrors | null}
     */
    static numerico(control: AbstractControl): ValidationErrors | null {
        if (control.value != null && `${control.value}`.trim().length > 0) {
            const exp = new RegExp(`^[0-9]*$`);
            if (!exp.test(control.value)) {
                return { 'El campo debe ser numérico.': true };
            }
        }
        return null;
    }

    /**
     * 
     * @param control 
     * @returns {ValidationErrors | null}
     */
    static decimal(control: AbstractControl): ValidationErrors | null {
        if (control.value != null && `${control.value}`.trim().length > 0) {
            const exp = new RegExp(`^[0-9.,]*$`);
            if (!exp.test(control.value)) {
                return { 'El campo debe ser decimal.': true };
            }
        }
        return null;
    }

    /**
     * 
     * @param control 
     * @returns {ValidationErrors | null}
     */
    static alfanumerico(control: AbstractControl): ValidationErrors | null {
        if (control.value != null && `${control.value}`.trim().length > 0) {
            const exp = new RegExp(`^[0-9A-Za-zäÄëËïÏöÖüÜáéíóúáéíóúÁÉÍÓÚñÑ\\s]*$`);
            if (!exp.test(control.value)) {
                return { 'El campo debe contener números y letras.': true };
            }
        }
        return null;
    }

    /**
     * 
     * @param control 
     * @returns {ValidationErrors | null}
     */
    static correoElectronico(control: AbstractControl): ValidationErrors | null {
        if (control.value != null && `${control.value}`.trim().length > 0) {
            const exp = new RegExp(`[\\w\\._-]{1,30}\\+?[\\w]{0,10}@[\\w\\.\\-]{3,}\\.\\w{2,5}`);
            if (!exp.test(control.value)) {
                return { 'El correo eletrónico ingresado no es válido.': true };
            }
        }
        return null;
    }

    /**
     * 
     * @param control 
     * @returns {ValidationErrors | null}
     */
    static paginaWeb(control: AbstractControl): ValidationErrors | null {
        if (control.value != null && `${control.value}`.trim().length > 0) {
            const exp = new RegExp(`^[(?:http(s)?:\\/\\/)?[\\w\\.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]]*$`);
            if (!exp.test(control.value)) {
                return { 'La URL ingresada no es válida.': true };
            }
        }
        return null;
    }

    /**
     * 
     * @param control 
     * @returns {ValidationErrors | null}
     */
    static direccion(control: AbstractControl): ValidationErrors | null {
        if (control.value != null && `${control.value}`.trim().length > 0) {
            const exp = new RegExp(`^[a-zA-Z0-9\\s#áéíóúñÁÉÍÓÚÑ\\-#]*$`);
            if (!exp.test(control.value)) {
                return { 'No es un formato de dirección válido.': true };
            }
        }
        return null;
    }

}


