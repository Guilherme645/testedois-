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
export class GerarRelatorioComponent {
  @Input() jsonData: JsonData | null = null; // Dados do JSON recebidos como entrada
  jsonForm: FormGroup; // Formulário para os parâmetros do relatório
  selectedDirectory: string = ''; // Diretório selecionado
  selectedAction: string = ''; // Ação selecionada ('v' para visualizar ou 'd' para download)

  constructor(private relatorioService: RelatorioService, private fb: FormBuilder) {
    this.jsonForm = this.fb.group({});
  }

  /**
   * Baixar ou visualizar o relatório baseado no diretório selecionado e ação.
   * @param directory Diretório do relatório.
   * @param action Ação ('v' para visualizar, 'd' para download).
   */
  baixarOuVisualizarRelatorio(directory: string, action: string): void {
    if (!directory) {
      alert('Selecione um diretório antes de continuar.');
      return;
    }

    this.relatorioService.gerarRelatorio(directory, action).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);

        if (action === 'v') {
          // Abrir relatório no navegador
          window.open(url, '_blank');
        } else if (action === 'd') {
          // Baixar relatório como arquivo
          const a = document.createElement('a');
          a.href = url;
          a.download = `${directory}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      },
      error: (error) => {
        console.error('Erro ao gerar o relatório:', error);
        alert('Erro ao gerar o relatório. Verifique o console para mais detalhes.');
      }
    });
  }

  /**
   * Atualiza o diretório selecionado.
   * @param directory Nome do diretório.
   */
  selecionarDiretorio(directory: string): void {
    this.selectedDirectory = directory;
  }

  /**
   * Obtém as chaves dos parâmetros do JSON.
   * @param parameters Parâmetros do JSON.
   * @returns Lista de chaves.
   */
  getParameterKeys(parameters: Parameters | undefined): string[] {
    return parameters ? Object.keys(parameters) : [];
  }

  /**
   * Gera um placeholder amigável para os parâmetros baseados na chave.
   * @param key Chave do parâmetro.
   * @returns Placeholder formatado.
   */
  getPlaceholder(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }
}