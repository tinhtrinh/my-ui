import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyEditFilterDialogComponent } from './my-edit-filter-dialog.component';

describe('MyEditFilterDialogComponent', () => {
  let component: MyEditFilterDialogComponent;
  let fixture: ComponentFixture<MyEditFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyEditFilterDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyEditFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
