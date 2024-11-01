import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyNewDialogComponent } from './my-new-dialog.component';

describe('MyNewDialogComponent', () => {
  let component: MyNewDialogComponent;
  let fixture: ComponentFixture<MyNewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyNewDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyNewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
