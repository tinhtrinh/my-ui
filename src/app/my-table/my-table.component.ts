import { Component, OnInit } from '@angular/core';
import { AbstractTable, IFilter, IFilterOption } from '../shared/table/abstract-table';
import { MyNewDialogComponent } from '../my-new-dialog/my-new-dialog.component';
import { MyEditFilterDialogComponent } from '../my-edit-filter-dialog/my-edit-filter-dialog.component';
import { Observable, of } from 'rxjs';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';

interface IMyFilterOption extends IFilterOption {
  conditionMaxCount?: number;
  aggregateOptions?: Array<any>;
  aggregateApiCaller?: Observable<any>;
}

@Component({
  selector: 'app-my-table',
  templateUrl: './my-table.component.html',
  styleUrls: ['./my-table.component.css', '../shared/table/abstract-table.css']
})
export class MyTableComponent extends AbstractTable implements OnInit {
  override filterOptions: IMyFilterOption[] = [];
  fromDateError: any;
  toDateError: any;

  ngOnInit(): void {
    this.getTableNames();
    this.initTable();
    this.initFilterOptions();
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

  override initFilterOptions(): void {
    this.filterOptions = [
      {
        columnName: 'id',
        columnLabel: 'ID',
        operators: ["Contains", "Not contains", "Equals"],
      },
      {
        columnName: 'name',
        columnLabel: 'User Name',
        operators: ["Contains", "Not contains", "Equals", 'Not Equals'],
      },
      {
        columnName: 'fruit',
        columnLabel: 'Fruit',
        operators: ["Contains", "Not contains", "Equals", 'Not Equals'],
        valueApiCaller: this.tableService.getFruits(),
      },
      {
        columnName: 'createdDate',
        columnLabel: 'Created Date',
        operators: [],
      },
      {
        columnName: 'addCondition',
        columnLabel: 'Add Condition',
        operators: ["Contains", "Not contains", "Equals"],
        conditionMaxCount: 3
      },
      {
        columnName: 'aggregate',
        columnLabel: 'Aggregate',
        operators: ["Contains", "Not contains", "Equals"],
        conditionMaxCount: 3,
        aggregateOptions: [],
        aggregateApiCaller: this.getAggregates(),
        valueOptions: [],
      },
    ]
  }

  override addFilterGroup(filterOption: IMyFilterOption): void {
    if(filterOption.columnName == 'createdDate') {
      const newFilterGroup = new FormGroup({
        fromDate: new FormControl('', [Validators.required]),
        toDate: new FormControl('', [Validators.required])
      })
      
      this.filterGroups.addControl(filterOption.columnName, newFilterGroup);
    } else {
      super.addFilterGroup(filterOption)
    }
  }

  validateFromDateBeforeToDate(): void {
    if(!this.filterGroups.contains('createdDate')) return;

    this.fromDateError = null;
    this.toDateError = null;
    this.filterGroups.controls['createdDate'].enable();
    const fromDate = NgbDate.from(this.filterGroups.controls['createdDate'].value.fromDate);
    const toDate = NgbDate.from(this.filterGroups.controls['createdDate'].value.toDate);
    if(fromDate?.after(toDate)) {
      this.filterGroups.controls['createdDate'].get('fromDate')?.setErrors({ notBefore: true })

      this.filterGroups.controls['createdDate'].get('toDate')?.setErrors({
        notAfter: true,
        errorMessage: 'Please ensure To Date is after From Date.'
      })

      this.fromDateError = this.filterGroups.controls['createdDate'].get('fromDate')?.errors;
      this.toDateError = this.filterGroups.controls['createdDate'].get('toDate')?.errors;
    }
  }

  validateToDateNotToday(): void {
    if(!this.filterGroups.contains('createdDate')) return;

    const toDate = NgbDate.from(this.filterGroups.controls['createdDate'].value.toDate);
    const tsToDay: Date = new Date();
    const today = new NgbDate(tsToDay.getFullYear(), tsToDay.getMonth() + 1, tsToDay.getDay() + 1);
    if(toDate?.equals(today)) {
      this.filterGroups.controls['createdDate'].get('toDate')?.setErrors({
        isToday: true,
        errorMessage: 'Please ensure To Date is not today.'
      })

      this.toDateError = this.filterGroups.controls['createdDate'].get('toDate')?.errors;
    }
  }

  override applyFilter(): void {
    if(this.isNoFilter()) return;

    this.validateFromDateBeforeToDate();
    this.validateToDateNotToday();

    this.filterGroups.markAllAsTouched();
    if(this.filterGroups.valid) {
      this.tableRequest.filters = Object.values(this.filterGroups.value);
      this.tableRequest.filters = this.tableRequest.filters.flat();
      this.getData();
    }
  }

  isDisplayAddCondition(filterOption: IMyFilterOption): boolean {
    if(filterOption.conditionMaxCount) {
      return this.getFilterFormArray(filterOption.columnName).length < filterOption.conditionMaxCount;
    }
    return false;
  }

  override checkToChangeDisplay(event: any, filterIndex: number): void {
    if(this.filterOptions[filterIndex].columnName == 'addCondition' || this.filterOptions[filterIndex].columnName == 'aggregate') {
      this.filterOptions[filterIndex].isDisplay = event.checked;

      if(event.checked) {
        this.addConditionGroup(this.filterOptions[filterIndex]);
        this.setAggregateOptions();
      } else {
        this.removeFilterGroup(this.filterOptions[filterIndex].columnName);
      }
    } else {
      super.checkToChangeDisplay(event, filterIndex);
    }
  }

  addConditionGroup(filterOption: IMyFilterOption): void {
    let newConditionGroup: FormGroup = new FormGroup({});
    if(filterOption.columnName == 'addCondition') {
      newConditionGroup = new FormGroup({
        columnName: new FormControl(filterOption.columnName),
        operator: new FormControl(filterOption.operators[0]),
        value: new FormControl('', [Validators.required])
      })
    }

    if(filterOption.columnName == 'aggregate') {
      newConditionGroup = new FormGroup({
        columnName: new FormControl(filterOption.columnName),
        aggregate: new FormControl('', [Validators.required]),
        operator: new FormControl(filterOption.operators[0]),
        value: new FormControl('', [Validators.required])
      })
    }

    const conditionArray = this.filterGroups.get(filterOption.columnName) as FormArray;

    if(conditionArray) {
      conditionArray.push(newConditionGroup);
    } else {
      const newConditions = new FormArray([]);
      this.filterGroups.addControl(filterOption.columnName, newConditions);
      const newConditionArray = this.filterGroups.get(filterOption.columnName) as FormArray;
      newConditionArray.push(newConditionGroup);
    }
  }

  removeConditionGroup(filterOption: IMyFilterOption, conditionIndex: number, filterIndex: number): void {
    if(filterOption.conditionMaxCount) {
      if(this.getFilterFormArray(filterOption.columnName).length > 1) {
        const conditionArray = this.filterGroups.controls[filterOption.columnName] as FormArray;
        conditionArray.removeAt(conditionIndex)
      } else {
        this.removeFilterGroup(filterOption.columnName);
        this.uncheckDisplay(filterIndex);
      }

      const AGGREGATE = 5;
      if(filterIndex == AGGREGATE && filterOption.valueOptions) {
        filterOption.valueOptions.splice(conditionIndex, 1);
      }
    }
  }

  setAggregateOptions(): void {
    const AGGREGATE = 5;
    this.getAggregates().subscribe((res) => {
      this.filterOptions[AGGREGATE].aggregateOptions = res;
    })
  }

  getAggregates(): Observable<Array<string>> {
    return of(['Aggregate 1', 'Aggregate 2'])
  }

  getFilterFormArray(columnName: string): Array<any> {
    const filterFormArray = this.filterGroups.controls[columnName] as FormArray;
    return filterFormArray.controls;
  }

  changeToUpdateValueOptions(conditionIndex: number): void {
    const AGGREGATE = 5;
    const conditionArray = this.filterGroups.get('aggregate') as FormArray;
    const change = conditionArray.controls[conditionIndex].value.aggregate;
    this.getValueOptionsForAggregate(change).subscribe((res) => {
      if(this.filterOptions[AGGREGATE].valueOptions) {
        this.filterOptions[AGGREGATE].valueOptions[conditionIndex] = res;
      }
    })
  }

  getValueOptionsForAggregate(aggregate: string): Observable<Array<any>> {
    if(aggregate == 'Aggregate 1') return of(['Value 11', 'Value 12'])
    return of(['Value 21', 'Value 22'])
  }

  override clearAllFilter(): void {
    const AGGREGATE = 5;
    this.filterOptions[AGGREGATE].valueOptions = []
    super.clearAllFilter();
  }
}
