import { inject } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { TableService } from './table.service';
import { MatSelectChange } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { AbstractDialog } from '../abstract-dialog/abstract-dialog';

export interface ITableRequest {
  moduleId: string;
  tableId: string;
  searchTerm: string;
  pageIndex: number;
  pageSize: number;
  filters: Array<IFilter>;
}

export interface ITableResponse {
  displayedColumns: Array<string>;
  rowData: Array<any>;
  pageSize: number;
  pageIndex: number;
  count: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ITableName {
  id: string;
  name: string;
}

export interface IPaginator {
  totalCount: number;
  pageSize: number;
  pageSizeOptions: Array<number>
}

export interface IFilter {
  column: string;
  operator: string;
  value: any;
}

export interface IFilterOption {
  columns: Array<string>;
  operators: Array<string>;
  values: Array<any>;
  valueType: any;
}

export abstract class AbstractTable {
  tableName: ITableName = {id: '', name: ''};
  tableNames: Array<ITableName> = [];
  displayedColumns: Array<string> = [];
  rowData: Array<any> = [];
  filters: Array<IFilter> = []
  getDataUrl: string = '';
  paginator: IPaginator = {
    totalCount : 100,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25, 100]
  }
  tableRequest: ITableRequest = {
    moduleId: '',
    tableId: '',
    searchTerm: '',
    pageIndex: 1,
    pageSize: 5,
    filters: []
  };

  private tableService = inject(TableService);
  private readonly dialog = inject(MatDialog);

  initTable(): void {
    this.initTableName();
    this.getData();
  }

  initTableName(): void {}

  getTableNames(): void {
    this.tableService.getTableNames(this.tableRequest.moduleId).subscribe((res) => {
      this.tableNames = res;
    })
  }

  getData(): void {
    this.tableService.getData(this.tableRequest).subscribe((res) => {
      this.setData(res);
    })
  }

  setData(res: ITableResponse): void {
    this.displayedColumns = res.displayedColumns;
    this.rowData = res.rowData;
    this.paginator.totalCount = res.totalCount;
  }

  applySearch(event: Event): void {
    const searchInput = (event.target as HTMLInputElement).value;
    this.tableRequest.searchTerm = searchInput;
    this.getData();
  }

  goToFirstPage(): void {
    this.tableRequest.pageIndex = 1;
    this.tableRequest.pageSize = 5;
    this.getData()
  }

  pageChange(event: PageEvent): void {
    this.tableRequest.pageIndex = event.pageIndex + 1;
    this.tableRequest.pageSize = event.pageSize;
    this.getData();
  }

  tableNameChange(event: MatSelectChange) {
    this.tableRequest.tableId = event.value;
    this.getData();
    this.getFilters();
  }

  openDialog(dialogComponent: ComponentType<AbstractDialog>, inputData?: any, callback?: Function) {
    const dialogRef = this.dialog.open(dialogComponent, {
      width: '250px',
      disableClose: true,
      data: inputData
    });

    dialogRef.afterClosed().subscribe((res: any) => {
      if(res && callback) callback(res);
    })
  }

  getFilters(): void {
    this.tableService.getFilters(this.tableRequest.tableId).subscribe((res) => {
      this.filters = res;
    })
  }

  saveFilters(): void {
    this.tableRequest.filters = this.filters;
    this.goToFirstPage();
  }

  addFilter(): void {
    this.filters.push({ column: '', operator: '', value: '' })
  }
}
