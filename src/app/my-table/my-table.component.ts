import { Component, OnInit } from '@angular/core';
import { TableComponent } from '../shared/table/table.component';

@Component({
  selector: 'app-my-table',
  templateUrl: './my-table.component.html',
  styleUrl: './my-table.component.css'
})
export class MyTableComponent extends TableComponent implements OnInit {
  ngOnInit(): void {
    this.getTableNames();
    this.initTable();
  }

  override initTableName(): void {
    this.tableName = {id: '0', name: 'Table Zero'};
  }
}
