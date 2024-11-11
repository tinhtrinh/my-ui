import { Component, OnInit } from '@angular/core';
import { AbstractSearchDialog } from '../shared/search-dialog/abstract-search-dialog';

@Component({
  selector: 'app-my-search-name-dialog',
  templateUrl: './my-search-name-dialog.component.html',
  styleUrl: './my-search-name-dialog.component.css'
})
export class MySearchNameDialogComponent extends AbstractSearchDialog implements OnInit {
  override title: string = 'Search Users';
  
  ngOnInit(): void {
    this.initDialog();
  }

}
