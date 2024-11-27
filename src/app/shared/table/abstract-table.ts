import { inject } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { TableService } from './table.service';
import { MatSelectChange } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { AbstractDialog } from '../dialog/abstract-dialog';
import { AbstractEditFilterDialog } from '../edit-filter-dialog/abstract-edit-filter-dialog';

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
  pageIndex: number;
  pageSize: number;
  pageSizeOptions: Array<number>;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface IFilter {
  columnName: string;
  operator: string;
  value: any;
}

enum SCROLL_DIRECTION {
  UP,
  DOWN
}

export abstract class AbstractTable {
  tableName: ITableName = {id: '', name: ''};
  tableNames: Array<ITableName> = [];
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
    pageSize: 10,
    filters: []
  };
  previousScrollDirection: SCROLL_DIRECTION = SCROLL_DIRECTION.DOWN;

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
    this.tableRequest.pageSize = 10;
    this.getData()
  }

  pageChange($event: PageEvent | number | any): void {
    if($event.pageSize) {
      let { pageSize,  pageIndex } = $event;
      this.tableRequest.pageSize = pageSize;
      this.tableRequest.pageIndex = pageIndex;
    } 
    
    if($event.value) {
      this.tableRequest.pageIndex = $event.value - 1;
    } 

    if(typeof($event) == 'number') {
      this.tableRequest.pageIndex = $event - 1;
    }
    
    this.getData();
  }

  sortChange(event: any): void {}

  tableNameChange(event: MatSelectChange) {
    this.tableRequest.tableId = event.value;
    this.goToFirstPage();
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
    this.filters.push({ columnName: '', operator: '', value: '' })
  }

  deleteFilter(index: number): void {
    this.filters.splice(index, 1);
  }

  openEditFilterDialog(editFilterDialog: ComponentType<AbstractEditFilterDialog>, filter: IFilter, index: number): void {
    this.openDialog(editFilterDialog, filter, (result: IFilter) => {
      this.filters[index] = result;
    })
  }

  getScrollViewData(scrollDirection: SCROLL_DIRECTION): void {
    this.tableService.getData(this.getDataUrl, this.tableRequest).subscribe((res) => {
      if(scrollDirection.valueOf() == SCROLL_DIRECTION.DOWN && this.rowData.length < 30) {
        res.rowData = this.rowData.concat(res.rowData);
        this.setData(res);
        return;
      }

      if(scrollDirection.valueOf() == SCROLL_DIRECTION.DOWN && this.rowData.length == 30) {
        this.rowData.splice(0, 10);
        res.rowData = this.rowData.concat(res.rowData);
        this.setData(res);
      }

      if(scrollDirection.valueOf() == SCROLL_DIRECTION.UP && this.rowData.length == 30) {
        this.rowData.splice(20, 10);
        res.rowData = res.rowData.concat(this.rowData);
        this.setData(res);
      }

      if(scrollDirection.valueOf() == SCROLL_DIRECTION.UP && this.rowData.length < 30) {
        this.rowData.splice(20, this.rowData.length % 10);
        res.rowData = res.rowData.concat(this.rowData);
        this.setData(res);
      }
    })
  }

  scrollViewPageChange(event: Event | any): void {
    const tableViewHeight = event.target.offsetHeight;
    let tableScrollHeight = event.target.scrollTop;
    const scrollLocation = event.target.scrollHeight;

    const distance = 3;

    //Scrolling Down
    if (scrollLocation <= tableViewHeight + tableScrollHeight) {
      if(this.previousScrollDirection == SCROLL_DIRECTION.DOWN && this.paginator.hasNext) {
        this.tableRequest.pageIndex ++;
        this.getScrollViewData(SCROLL_DIRECTION.DOWN);
        this.previousScrollDirection = SCROLL_DIRECTION.DOWN
      }

      if(this.previousScrollDirection == SCROLL_DIRECTION.UP) {
        this.tableRequest.pageIndex += distance;
        this.getScrollViewData(SCROLL_DIRECTION.DOWN);
        this.previousScrollDirection = SCROLL_DIRECTION.DOWN
      }
    }

    //Scrolling Up
    if(tableScrollHeight == 0) {
      if(this.previousScrollDirection == SCROLL_DIRECTION.DOWN && this.tableRequest.pageIndex >= distance) {
        event.target.scrollTop+=70;
        this.tableRequest.pageIndex -= distance;
        this.getScrollViewData(SCROLL_DIRECTION.UP);
        this.previousScrollDirection = SCROLL_DIRECTION.UP;
      }

      if(this.previousScrollDirection == SCROLL_DIRECTION.UP && this.paginator.hasPrevious) {
        event.target.scrollTop+=70;
        this.tableRequest.pageIndex --;
        this.getScrollViewData(SCROLL_DIRECTION.UP);
        this.previousScrollDirection = SCROLL_DIRECTION.UP;
      }
    }
  }
}
