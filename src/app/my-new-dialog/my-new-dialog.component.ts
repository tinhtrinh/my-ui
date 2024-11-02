import { Component, inject, OnInit } from '@angular/core';
import { AbstractDialog } from '../shared/abstract-dialog/abstract-dialog';
import { Observable } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { TableService } from '../shared/table/table.service';

@Component({
  selector: 'app-my-new-dialog',
  templateUrl: './my-new-dialog.component.html',
  styleUrl: './my-new-dialog.component.css'
})
export class MyNewDialogComponent extends AbstractDialog implements OnInit {
  override title: string = 'New User';
  override formGroup = new FormGroup({
    name: new FormControl('test'),
    id: new FormControl(''),
    fruit: new FormControl('')
  });
  fruits: Array<string> = [];

  private tableService = inject(TableService);

  ngOnInit(): void {
    this.initDialog();
    this.getFruits();
  }

  onChangeNameToGenId(): void {
    this.formGroup.controls.name.valueChanges.subscribe((value) => {
      this.formGroup.controls.id.setValue(`id-${value}`);
    })
  }

  getFruits(): void {
    this.tableService.getFruits().subscribe((res) => {
      this.fruits = res;
    })
  }

  createNewUser(url: string, param: any): Observable<{ id: string, name: string }> {
    return new Observable((subscriber) => {
      subscriber.next({ id: 'test', name: 'test' })
      // subscriber.error({
      //   title: 'ValidationError',
      //   type: 'ValidationError',
      //   status: 400,
      //   detail: 'ValidationError',
      //   errors: [ { code: 'name', message: 'Test name error message' } ]
      // })
    })
  }

  onSubmit(): void {
    console.log(this.formGroup.controls['fruit'].value)
    this.submit(this.createNewUser('test', {}), (res: { id: string, name: string }) => {
      this.openSnackBar(`Submit sucess: id ${res.id}, name ${res.name}`)
    })
  }
}
