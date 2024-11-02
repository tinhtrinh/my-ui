import { Component, OnInit } from '@angular/core';
import { AbstractTable } from '../shared/abstract-table/abstract-table';
import { MyNewDialogComponent } from '../my-new-dialog/my-new-dialog.component';

@Component({
  selector: 'app-my-table',
  templateUrl: './my-table.component.html',
  styleUrl: './my-table.component.css'
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
}
