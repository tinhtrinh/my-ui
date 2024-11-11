import { inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { ComponentType } from '@angular/cdk/portal';
import { AbstractSearchDialog } from '../search-dialog/abstract-search-dialog';

export interface IError {
  code: string;
  message: string;
}

export interface IErrorResponse {
  title: string;
  type: string;
  status: number;
  detail: string;
  errors: Array<IError>;
}

export abstract class AbstractDialog {
  title: string = '';
  formGroup: FormGroup = new FormGroup({});
  originalValue: any = {};
  searchValues: Array<any> = [];

  private dialogRef = inject(MatDialogRef<AbstractDialog>);
  public inputData = inject (MAT_DIALOG_DATA);
  private snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  initDialog(): void {
    this.initOriginalValue();
  }

  initOriginalValue(): void {
    Object.keys(this.formGroup.controls).forEach((controlName) => {
      this.originalValue[controlName] = this.formGroup.controls[controlName].value;
    })
  }

  isDirty(controlName: string): boolean {
    return this.formGroup.controls[controlName].dirty;
  }

  undo(controlName: string): void {
    this.formGroup.controls[controlName].reset(this.originalValue[controlName]);
  }
  
  setError(error: IErrorResponse): void {
    if(error.type == 'ValidationError') {
      error.errors.forEach((error) => {
        this.formGroup.controls[error.code].markAsTouched();
        this.formGroup.controls[error.code].setErrors({ message: error.message });
      })
    }
  }

  getErrorMessage(controlName: string): string {
    return this.formGroup.controls[controlName].getError('message');
  }

  onClose(result?: any): void {
    this.dialogRef.close(result);
  }

  submit(apiCaller: Observable<any>, callback?: Function): void {
    apiCaller.subscribe({
      next: (res: any) => {
        if(res && callback) {
          callback(res);
        }
        this.onClose(res);
      },
      error: (error: any) => { this.setError(error) }
    })
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, 'close', { 
      verticalPosition: 'top',
      duration: 3000
    })
  }

  isDisplaySearchBox(controlName: string): boolean {
    return !this.formGroup.controls[controlName].value;
  }

  removeSelection(controlName: string): void {
    this.formGroup.controls[controlName].setValue('');
  }

  selected(event: MatAutocompleteSelectedEvent, controlName: string): void {
    this.formGroup.controls[controlName].setValue(event.option.value);
  }

  clearSearchBox(event: MatAutocompleteSelectedEvent, searchTemplateVar: any) {
    if(event.option.value) searchTemplateVar.value = '';
  }

  isSearchRecently(searchTerm?: string): boolean {
    return !searchTerm || searchTerm.length <= 3
  }

  search(
    searchRecentlyApiCaller: Observable<Array<any>>, 
    searchAllApiCaller:  Observable<Array<any>>, 
    searchTerm?: string
  ): void {
    if(this.isSearchRecently(searchTerm)) {
      searchRecentlyApiCaller.subscribe(res => this.searchValues = res);
    } else {
      searchAllApiCaller.subscribe(res => this.searchValues = res);
    }
  }

  openChildDialog(dialogComponent: ComponentType<AbstractDialog>, inputData?: any, callback?: Function) {
    const dialogRef = this.dialog.open(dialogComponent, {
      width: '500px',
      disableClose: true,
      data: inputData
    });

    dialogRef.afterClosed().subscribe((res: any) => {
      if(res && callback) callback(res);
    })
  }

  openSearchDialog(
    searchDialogComponent: ComponentType<AbstractSearchDialog>, 
    searchTerm: string, 
    controlName: string
  ) {
    this.openChildDialog(searchDialogComponent, searchTerm, (row: any) => {
      this.formGroup.controls[controlName].setValue(row);
    })
  }
}
