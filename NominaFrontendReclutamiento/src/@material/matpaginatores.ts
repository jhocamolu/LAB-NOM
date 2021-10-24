import { MatPaginator, MatPaginatorIntl } from '@angular/material';

export class MatPaginatorEs extends MatPaginatorIntl {
    constructor() {
        super();
        this.itemsPerPageLabel = 'Elementos por página:';
        this.firstPageLabel = 'Primera página';
        this.previousPageLabel = 'Atrás';
        this.nextPageLabel = 'Siguiente';
        this.lastPageLabel = 'Última página';

    }

    getRangeLabel = function (page, pageSize, length) {
        const of = 'de';
        if (length === 0 || pageSize === 0) {
            return '0 ' + of + ' ' + length;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length ?
            Math.min(startIndex + pageSize, length) :
            startIndex + pageSize;
        return startIndex + 1 + ' - ' + endIndex + ' ' + of + ' ' + length;
    };
}