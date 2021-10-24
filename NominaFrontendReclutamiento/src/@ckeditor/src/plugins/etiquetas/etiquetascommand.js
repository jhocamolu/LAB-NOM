import Command from '@ckeditor/ckeditor5-core/src/command';

export default class EtiquetasCommand extends Command {
    execute({ value }) {
        const editor = this.editor;

        editor.model.change(writer => {
            const placeholder = writer.createElement('alcanosBox', { name: value });
            editor.model.insertContent(placeholder);
            writer.setSelection(placeholder, 'on');
        });
    }

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;

        const isAllowed = model.schema.checkChild(selection.focus.parent, 'alcanosBox');

        this.isEnabled = isAllowed;
    }
}