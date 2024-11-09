import { AbstractDialog } from '../dialog/abstract-dialog';
import { Observable } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { IFilter } from '../table/abstract-table';

interface IFilterOption {
  columnName: string;
  operators: Array<string>;
  valueApiCaller?: Observable<Array<any>>;
}

export abstract class AbstractEditFilterDialog extends AbstractDialog {
  override title = 'Edit Filter';
  override formGroup = new FormGroup({
    columnName: new FormControl(''),
    operator: new FormControl(''),
    value: new FormControl('')
  });
  filter: IFilter = {} as IFilter;
  filterOptions: Array<IFilterOption> = [];
  operators: Array<string> = [];
  values: Array<any> = [];
  
  override initDialog(): void {
    this.initFormGroup();
  }

  initFormGroup(): void {
    this.filter = this.inputData;
    if(this.filter.columnName) {
      this.formGroup.controls.columnName.setValue(this.filter.columnName);
      this.formGroup.controls.operator.setValue(this.filter.operator);
      this.formGroup.controls.value.setValue(this.filter.value);
    } else {
      this.formGroup.controls.columnName.setValue(this.filterOptions[0].columnName);
      this.formGroup.controls.operator.setValue(this.filterOptions[0].operators[0]);
      this.formGroup.controls.value.setValue('');
    }

    this.setFilterOption();
  }

  setFilterOption(): void {
    const selectedColumn = this.formGroup.controls.columnName.value;
    if(selectedColumn) {
      const seletedOption = this.filterOptions.find((option) => option.columnName === selectedColumn);
      if(seletedOption) {
        this.setOperators(seletedOption.operators);
        this.setValues(seletedOption.valueApiCaller);
      }
    }
  }

  setOperators(operators: Array<string>): void {
    this.operators = operators;
  }

  setValues(valueApiCaller?: Observable<Array<any>>): void {
    if(valueApiCaller) {
      valueApiCaller.subscribe((res) => {
        this.values = res;
      })
    }
  }

  onChangeToUpdateFilterOption(): void {
    this.formGroup.controls.value.setValue('');
    this.setFilterOption();
  }

  submitDone(): void {
    const result = {
      columnName: this.formGroup.controls.columnName.value,
      operator: this.formGroup.controls.operator.value,
      value: this.formGroup.controls.value.value
    } as IFilter;

    this.onClose(result);
  }
}
