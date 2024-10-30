/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CriarPastaComponent } from './criarPasta.component';

describe('CriarPastaComponent', () => {
  let component: CriarPastaComponent;
  let fixture: ComponentFixture<CriarPastaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CriarPastaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CriarPastaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
