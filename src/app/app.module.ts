import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// PrimeNG Modules
import { TreeModule } from 'primeng/tree';
import { MenubarModule } from 'primeng/menubar';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';

// Components
import { AppComponent } from './app.component';
import { RelatorioComponent } from './components/relatorio/relatorio.component';
import { MenuBarComponent } from './components/menu-bar/menu-bar.component';
import { TreeComponent } from './components/tree/tree.component';
import { GerarRelatorioComponent } from './components/GerarRelatorio/GerarRelatorio.component';
import { CriarPastaComponent } from './components/criarPasta/criarPasta.component';


@NgModule({
  declarations: [
    AppComponent,
    RelatorioComponent,
    GerarRelatorioComponent,
    MenuBarComponent,
    TreeComponent,
    CriarPastaComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TreeModule,
    MenubarModule,
    DialogModule,
    CalendarModule,
    CardModule,
    InputTextModule,
    TableModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    DynamicDialogModule,
    DialogModule 
 
  ],
  providers: [DialogService],
  bootstrap: [AppComponent],
})
export class AppModule {}
