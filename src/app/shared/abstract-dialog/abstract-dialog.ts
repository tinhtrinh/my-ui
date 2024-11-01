import { inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

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

  private dialogRef = inject(MatDialogRef<AbstractDialog>);
  public inputData = inject (MAT_DIALOG_DATA);
  private snackBar = inject(MatSnackBar);

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
}
