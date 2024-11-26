import { DirectoryService } from './../../shared/directory.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RelatorioService } from 'src/service/relatorio.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  styleUrls: ['./GerarRelatorio.component.css'],
})
export class GerarRelatorioComponent implements OnInit {
  jsonData: JsonData | null = null; // Dados do JSON recebidos como entrada
  jsonForm: FormGroup; // Formulário para os parâmetros do relatório
  selectedAction: string = ''; // Ação selecionada ('v' para visualizar ou 'd' para download)
  selectedDirectory: string = ''; // Diretório recebido do DirectoryService
  selectedSubDirectory: string = ''; // Subdiretório recebido do DirectoryService
  displayPdfModal: boolean = false; // Controla a exibição do modal
  pdfUrl: SafeResourceUrl | null = null;

  constructor(
    private relatorioService: RelatorioService,
    private fb: FormBuilder,
    private directoryService: DirectoryService,
    private sanitizer: DomSanitizer
  ) {
    this.jsonForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.directoryService.directorySelected$.subscribe({
      next: (selected) => {
        // Corrigir a captura do diretório e subdiretório
        this.selectedDirectory = selected.directory;
        this.selectedSubDirectory = selected.subDirectory;
        console.log('Recebido no GerarRelatorioComponent:', selected);
      },
      error: (error) => {
        console.error('Erro ao receber evento de diretório:', error);
      },
    });
  }

  /**
   * Baixar ou visualizar o relatório baseado no diretório selecionado e ação.
   * @param action Ação ('v' para visualizar, 'd' para download).
   */
  baixarOuVisualizarRelatorio(action: string): void {
    if (!this.selectedDirectory || !this.selectedSubDirectory) {
      alert('Tanto o diretório quanto o subdiretório são obrigatórios.');
      return;
    }

    // Faz a chamada para gerar o relatório
    this.relatorioService.gerarRelatorio(
      this.selectedDirectory,
      this.selectedSubDirectory,
      action
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);

        if (action === 'v') {
          const blobUrl = window.URL.createObjectURL(blob);
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl); // Torna a URL segura
          this.displayPdfModal = true;
        } else if (action === 'd') {
          // Faz o download do arquivo
          const a = document.createElement('a');
          a.href = url;
          a.download = `${this.selectedDirectory}_${this.selectedSubDirectory}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      },
      error: (error) => {
        console.error('Erro ao gerar o relatório:', error);
        alert('Erro ao gerar o relatório. Verifique o console para mais detalhes.');
      },
    });
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
    return key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
