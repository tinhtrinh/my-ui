import { Component, inject, OnInit } from '@angular/core';
import { AbstractEditFilterDialog } from '../shared/edit-filter-dialog/abstract-edit-filter-dialog';
import { TableService } from '../shared/table/table.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-my-edit-filter-dialog',
  templateUrl: './my-edit-filter-dialog.component.html',
  styleUrl: './my-edit-filter-dialog.component.css'
})
export class MyEditFilterDialogComponent extends AbstractEditFilterDialog implements OnInit {
  private tableService = inject(TableService);
  
  ngOnInit(): void {
    this.filterOptions = [
      {
        columnName: 'ID',
        operators: ['Equals', 'Not Equals', 'Contains']
      },
      {
        columnName: 'Name',
        operators: ['Equals', 'Not Equals', 'Contains', 'Not Contains']
      },
      {
        columnName: 'Fruit',
        operators: ['Equals', 'Not Equals', 'Contains', 'Not Contains'],
        valueApiCaller: this.getFruits()
      },
      {
        columnName: 'Created Date',
        operators: ['Equals', 'Not Equals', 'Contains', 'Not Contains']
      },
      {
        columnName: 'Last Modified Date',
        operators: ['Equals', 'Not Equals', 'Contains', 'Not Contains']
      }
    ]
    this.initDialog();
  }

  getFruits(): Observable<Array<string>> {
    return this.tableService.getFruits();
  }
}
