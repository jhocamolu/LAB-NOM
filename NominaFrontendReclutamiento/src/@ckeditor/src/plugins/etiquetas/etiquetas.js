import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import EtiquetasEditing from './etiquetasediting';
import EtiquetasUI from './etiquetasui';

export class Etiquetas extends Plugin {

    /**
     * @inheritDoc
     */
    static get requires() {
        return [EtiquetasEditing, EtiquetasUI];
    }


    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'Etiquetas';
    }

}