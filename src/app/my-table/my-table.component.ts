import { Component, OnInit } from '@angular/core';
import { AbstractTable, IFilter } from '../shared/table/abstract-table';
import { MyNewDialogComponent } from '../my-new-dialog/my-new-dialog.component';
import { MyEditFilterDialogComponent } from '../my-edit-filter-dialog/my-edit-filter-dialog.component';

@Component({
  selector: 'app-my-table',
  templateUrl: './my-table.component.html',
  styleUrls: ['./my-table.component.css', '../shared/table/abstract-table.css']
})
export class MyTableComponent extends AbstractTable implements OnInit {
  ngOnInit(): void {
    this.getTableNames();
    this.initTable();
  }

  override initTableName(): void {
    this.tableName = {id: '0', name: 'Table Zero'};
  }

  openMyNewDialog(): void {
    this.openDialog(MyNewDialogComponent, null, (res: any) => this.getData());
  }

  openMyEditFilterDialog(filter: IFilter, index: number): void {
    this.openEditFilterDialog(MyEditFilterDialogComponent, filter, index);
  }
}
