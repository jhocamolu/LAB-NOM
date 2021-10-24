import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import EtiquetasCommand from './etiquetascommand';

/**
 *
 * @extends module:core/plugin~Plugin
 */
export default class EtiquetasEditing extends Plugin {

    static get requires() {
        return [Widget];
    }

    init() {
        console.log('etiquetasEditing#init() got called');

        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add('etiquetas', new EtiquetasCommand(this.editor));

        this.editor.editing.mapper.on(
            'viewToModelPosition',
            viewToModelPositionOutsideModelElement(this.editor.model, viewElement => viewElement.hasClass('alcanos-box'))
        );
        this.editor.config.define('etiquetasConfig', {
            types: []
        });
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register('alcanosBox', {
            allowWhere: '$text',
            isInline: true,
            isObject: true,
            allowAttributes: ['name']
        });
    }

    _defineConverters() {
        const conversion = this.editor.conversion;

        conversion.for('upcast').elementToElement({
            view: {
                name: 'alcanos',
                classes: ['alcanos-box']
            },
            model: (viewElement, modelWriter) => {
                const name = viewElement.getChild(0).data.slice(1, -1);
                return modelWriter.createElement('alcanosBox', { name });
            }
        });

        conversion.for('editingDowncast').elementToElement({
            model: 'alcanosBox',
            view: (modelItem, viewWriter) => {
                const widgetElement = createEtiquetaView(modelItem, viewWriter);                
                return toWidget(widgetElement, viewWriter);
            }
        });

        conversion.for('dataDowncast').elementToElement({
            model: 'alcanosBox',
            view: createEtiquetaView
        });


        function createEtiquetaView(modelItem, viewWriter) {
            const name = modelItem.getAttribute('name');

            const boxView = viewWriter.createContainerElement('alcanos', {
                class: 'alcanos-box'
            });

            const innerText = viewWriter.createText('{' + name + '}');
            viewWriter.insert(viewWriter.createPositionAt(boxView, 0), innerText);
            console.log('createEtiquetaView');

            return boxView;
        }
    }


}