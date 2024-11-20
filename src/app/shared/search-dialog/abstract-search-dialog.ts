import { FormControl, FormGroup } from "@angular/forms"
import { AbstractDialog } from "../dialog/abstract-dialog"
import { inject } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { IFilter, IPaginator, ITableRequest, ITableResponse } from "../table/abstract-table";
import { TableService } from "../table/table.service";

export abstract class AbstractSearchDialog extends AbstractDialog {
    override formGroup = new FormGroup({
        searchControl: new FormControl('')
    })
    displayedColumns: Array<string> = [];
    rowData: Array<any> = [];
    filters: Array<IFilter> = []
    getDataUrl: string = '';
    paginator: IPaginator = {
      pageIndex: 0,
      pageSize: 5,
      pageSizeOptions: [5, 10, 25, 100],
      totalCount : 100,
      hasNext: false,
      hasPrevious: false
    }
    tableRequest: ITableRequest = {
      moduleId: '',
      tableId: '',
      searchTerm: '',
      pageIndex: 0,
      pageSize: 5,
      filters: []
    };

    private tableService = inject(TableService);

    override initDialog(): void {
        this.formGroup.controls.searchControl.setValue(this.inputData);
        this.tableRequest.searchTerm = this.inputData;
        this.getData();
    }

    getData(): void {
        this.tableService.getData(this.getDataUrl, this.tableRequest).subscribe((res) => {
          this.setData(res);
        })
    }
    
    setData(res: ITableResponse): void {
        this.displayedColumns = res.displayedColumns;
        this.rowData = res.rowData;
        this.paginator = {
            ...this.paginator,
            pageIndex: res.pageIndex,
            pageSize: res.pageSize,
            totalCount: res.totalCount,
            hasNext: res.hasNext,
            hasPrevious: res.hasPrevious
        }
    }

    applySearch(event: Event): void {
        const searchInput = (event.target as HTMLInputElement).value;
        this.tableRequest.searchTerm = searchInput;
        this.goToFirstPage();
        }

        goToFirstPage(): void {
        this.tableRequest.pageIndex = 0;
        this.tableRequest.pageSize = 5;
        this.getData()
    }

    pageChange(event: PageEvent): void {
        this.tableRequest.pageIndex = event.pageIndex + 1;
        this.tableRequest.pageSize = event.pageSize;
        this.getData();
    }
    
    sortChange(event: any): void {}

    selectRow(row: any): void {
        this.onClose(row);
    }
}