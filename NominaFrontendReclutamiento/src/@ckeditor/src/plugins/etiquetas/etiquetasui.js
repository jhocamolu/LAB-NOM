import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import etiquetaIcon from './theme/icon/etiquetas.svg';

/**
 *
 * @extends module:core/plugin~Plugin
 */
export default class EtiquetasUI extends Plugin {

    init() {
        const editor = this.editor;
        const t = editor.t;
        let etiquetasNames = editor.config.get('etiquetasConfig.types');
        
        editor.ui.componentFactory.add('etiquetas', locale => {
            const dropdownView = createDropdown(locale);


            addListToDropdown(dropdownView, getDropdownItemsDefinitions(etiquetasNames));

            dropdownView.buttonView.set({

                label: t('Etiquetas de alcanos'),
                tooltip: true,
                withText: true
            });

            this.listenTo(dropdownView, 'execute', evt => {
                editor.execute('etiquetas', { value: evt.source.commandParam });
                editor.editing.view.focus();
            });

            return dropdownView;
        });
    }

}

function getDropdownItemsDefinitions(items) {
    const itemDefinitions = new Collection();

    for (const name of items) {
        const definition = {
            type: 'button',
            model: new Model({
                commandParam: name,
                label: name,
                withText: true
            })
        };

        // Add the item definition to the collection.
        itemDefinitions.add(definition);
    }

    return itemDefinitions;
}