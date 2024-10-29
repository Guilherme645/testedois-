import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RelatorioComponent } from './components/relatorio/relatorio.component';
import { GerarRelatorioComponent } from './components/GerarRelatorio/GerarRelatorio.component';

const routes: Routes = [
  { path: '', redirectTo: '/relatorio', pathMatch: 'full' }, 
  { path: 'relatorio', component: RelatorioComponent },
  { path: 'gerar-relatorio', component: GerarRelatorioComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
