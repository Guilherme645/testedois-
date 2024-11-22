import { Component, OnChanges, Input, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { RelatorioService } from 'src/service/relatorio.service';

interface Field {
  name: string;
  type: string;
}

interface Parameters {
  [key: string]: Field;
}

interface JsonData {
  parameters: Parameters;
  fields: { [key: string]: Field };
}

@Component({
  selector: 'app-GerarRelatorio',
  templateUrl: './GerarRelatorio.component.html',
  styleUrls: ['./GerarRelatorio.component.css']
})
export class GerarRelatorioComponent  {
  @Input() jsonData: JsonData | null = null; 
  jsonForm: FormGroup;

  constructor(private relatorioService: RelatorioService, private fb: FormBuilder) {
    this.jsonForm = this.fb.group({});
  }



  gerarRelatorio(diretorio: string, acao: string): void {
    this.relatorioService.gerarRelatorio(diretorio, acao).subscribe(response => {
      const blob = new Blob([response], { type: 'application/pdf' });
  
      if (acao === 'v') {
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      } else if (acao === 'd') {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${diretorio}.pdf`;
        link.click();
      }
    }, error => {
      console.error('Erro ao gerar o relatório:', error);
    });
  }

  

  getParameterKeys(parameters: Parameters | undefined): string[] {
    return parameters ? Object.keys(parameters) : [];
  }

  getPlaceholder(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }
}
