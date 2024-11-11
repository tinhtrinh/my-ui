import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySearchNameDialogComponent } from './my-search-name-dialog.component';

describe('MySearchNameDialogComponent', () => {
  let component: MySearchNameDialogComponent;
  let fixture: ComponentFixture<MySearchNameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MySearchNameDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MySearchNameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
