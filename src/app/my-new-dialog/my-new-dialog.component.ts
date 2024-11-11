import { Component, inject, OnInit } from '@angular/core';
import { AbstractDialog } from '../shared/dialog/abstract-dialog';
import { Observable } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { TableService } from '../shared/table/table.service';
import { MySearchNameDialogComponent } from '../my-search-name-dialog/my-search-name-dialog.component';

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
    fruit: new FormControl(''),
    userName: new FormControl(null as unknown as {name : string})
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

  searchRecentlyUser(searchTerm?: string): Observable<Array<{name: string}>> {
    return new Observable((subscriber) => {
      subscriber.next([{name: 'Test 1'}, {name: 'Test 2'}]);
    })
  }

  searchAllUser(searchTerm?: string): Observable<Array<{name: string}>> {
    return new Observable((subscriber) => {
      subscriber.next([{name: 'Test 3'}, {name: 'Test 4'}, {name: 'Test 5'}]);
    })
  }

  searchUsers(searchTerm?: string): void {
    this.search(this.searchRecentlyUser(searchTerm), this.searchAllUser(searchTerm), searchTerm)
  }

  openSearchUserDialog(searchTerm: string): void {
    this.openSearchDialog(MySearchNameDialogComponent, searchTerm, 'userName');
  }
}
