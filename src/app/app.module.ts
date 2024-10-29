import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { RelatorioComponent } from './components/relatorio/relatorio.component';
import { MenuBarComponent } from './components/menu-bar/menu-bar.component';
import { TreeComponent } from './components/tree/tree.component';
import { TreeModule } from 'primeng/tree';
import { ReactiveFormsModule } from '@angular/forms';  // Importe isso aqui
import { MenubarModule } from 'primeng/menubar';
import { DialogModule } from 'primeng/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule } from 'primeng/calendar';
import { GerarRelatorioComponent } from './components/GerarRelatorio/GerarRelatorio.component';
import {CardModule} from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

@NgModule({
  declarations: [
    AppComponent,
 RelatorioComponent,
 GerarRelatorioComponent,
 MenuBarComponent,
 TreeComponent,

        // Declara o MenuBarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    TreeModule,
    ReactiveFormsModule,
    MenubarModule,
    DialogModule,
    BrowserAnimationsModule,
    CalendarModule,
    CardModule,
    InputTextModule,
    TableModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
