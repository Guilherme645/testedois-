import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RelatorioService } from 'src/service/relatorio.service';

// Interface que representa um campo individual
export interface Field {
  name: string; // Nome do campo
  type: string; // Tipo do campo
}

// Interface que representa todos os campos do JSON
export interface Fields {
  [key: string]: Field; // A chave é o nome do campo, e o valor é o Field
}

// Interface que representa a estrutura do JSON completo
export interface JsonData {
  fields: Fields; // Contém os campos
}

@Component({
  selector: 'app-GerarRelatorio',
  templateUrl: './GerarRelatorio.component.html',
  styleUrls: ['./GerarRelatorio.component.css']
})
export class GerarRelatorioComponent {
  @Input()
  jsonData!: JsonData; // Dados JSON passados do componente pai
  displayModal: boolean = true; // Controla a visibilidade do modal
  reportForm: FormGroup; // Formulário para os parâmetros do relatório

  constructor(private fb: FormBuilder, private relatorioService: RelatorioService) {
    this.reportForm = this.fb.group({
      tipoLegislacao: ['', Validators.required],
      formato: ['', Validators.required],
      dataPublicacaoInicial: ['', Validators.required],
      dataPublicacaoFinal: ['', Validators.required],
    });
  }

// Método para extrair os campos do JSON
getFields() {
  if (this.jsonData && this.jsonData.fields) {
      return Object.values(this.jsonData.fields); // Retorna um array de fields
  } else {
      console.warn('jsonData ou fields está indefinido');
      return []; // Ou outro valor padrão
  }
}

  generateReport() {
    if (this.reportForm.valid) {
      console.log('Gerando relatório com os seguintes parâmetros:', this.reportForm.value);
      this.displayModal = false; // Fecha o modal após gerar o relatório
      // Adicione lógica para enviar os dados do formulário ao serviço
      // this.relatorioService.generateReport(this.reportForm.value).subscribe(...);
    } else {
      console.error('Formulário inválido');
    }
  }
}