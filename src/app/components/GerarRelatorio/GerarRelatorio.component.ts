import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RelatorioService } from 'src/service/relatorio.service';
import { DirectoryService } from './../../shared/directory.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { Parameters } from 'src/app/model/parameters.model';

@Component({
  selector: 'app-GerarRelatorio',
  templateUrl: './GerarRelatorio.component.html',
  styleUrls: ['./GerarRelatorio.component.css'],
})

export class GerarRelatorioComponent implements OnInit {
  jsonData: any | null = null; // JSON com dados do relatório
  jsonForm: FormGroup; // Formulário para parâmetros
  selectedDirectory: string = ''; // Diretório selecionado
  selectedSubDirectory: string = ''; // Subdiretório selecionado
  displayPdfModal: boolean = false; // Controla a exibição do modal
  pdfUrl: SafeResourceUrl | null = null; // URL segura do PDF
  linkDoRelatorioGerado: string | null = null; // URL do relatório gerado para compartilhamento
  opcoesDeCompartilhamento: any[] = []; // Opções de compartilhamento

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
        this.selectedDirectory = selected.directory;
        this.selectedSubDirectory = selected.subDirectory;
        console.log('Diretório selecionado:', selected);
        this.carregarParametrosJson();
      },
      error: (error) => {
        console.error('Erro ao receber evento de diretório:', error);
      },
    });

    this.opcoesDeCompartilhamento = [
      {
        label: 'Email',
        icon: 'pi pi-envelope',
        command: () => this.compartilharEmail(),
      },
    ];
  }

  carregarParametrosJson(): void {
    if (this.selectedDirectory && this.selectedSubDirectory) {
      this.relatorioService.gerarJson(this.selectedDirectory, this.selectedSubDirectory).subscribe({
        next: (jsonResponse) => {
          console.log('JSON carregado com sucesso:', jsonResponse);
          this.jsonData = jsonResponse;
          this.atualizarFormulario();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erro ao carregar JSON:', error);
        },
      });
    } else {
      console.error('Diretório ou subdiretório não especificados.');
    }
  }

  atualizarFormulario(): void {
    if (this.jsonData && this.jsonData.parameters) {
      const controls = Object.keys(this.jsonData.parameters).reduce((acc: { [key: string]: any }, key: string) => {
        acc[key] = [''];
        return acc;
      }, {});
      this.jsonForm = this.fb.group(controls);
      console.log('Formulário atualizado com os parâmetros:', this.jsonForm.value);
    } else {
      console.error('Nenhum dado JSON ou parâmetros disponíveis.');
    }
  }

  baixarOuVisualizarRelatorio(action: string): void {
    if (!this.selectedDirectory || !this.selectedSubDirectory) {
      alert('Tanto o diretório quanto o subdiretório são obrigatórios.');
      return;
    }
  
    const additionalParams: { [key: string]: any } = {};
    if (this.jsonForm && this.jsonForm.value) {
      Object.entries(this.jsonForm.value).forEach(([key, value]) => {
        if (value) {
          additionalParams[key] = value;
        }
      });
    }
  
    console.log('Parâmetros adicionais enviados para o backend:', additionalParams);
  
    this.relatorioService.gerarRelatorio(
      this.selectedDirectory,
      this.selectedSubDirectory,
      action,
      additionalParams
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  
        if (action === 'v') {
          this.displayPdfModal = true;
        } else if (action === 'd') {
          const a = document.createElement('a'); 
          a.href = url;
          a.download = `${this.selectedDirectory}_${this.selectedSubDirectory}.pdf`; 
          document.body.appendChild(a); 
          a.click(); 
          document.body.removeChild(a); 
          window.URL.revokeObjectURL(url); 
        }
      },
      error: (error) => {
        console.error('Erro ao gerar o relatório:', error);
        alert('Erro ao gerar o relatório. Verifique o console para mais detalhes.');
      },
    });
  }

  abrirMenuCompartilhar(event: Event): void {
    const menu = document.querySelector('p-menu');
    if (menu) {
      (menu as any).toggle(event);
    }
  }

  compartilharEmail(): void {
    if (!this.linkDoRelatorioGerado) {
      alert('O relatório ainda não foi gerado para compartilhamento.');
      return;
    }
    const assunto = encodeURIComponent('Relatório Gerado');
    const corpo = encodeURIComponent(`Olá,%0D%0A%0D%0ACheck este relatório: ${this.linkDoRelatorioGerado}`);
    window.open(`mailto:?subject=${assunto}&body=${corpo}`, '_blank');
  }

  getParameterKeys(parameters: Parameters | undefined): string[] {
    return parameters ? Object.keys(parameters) : [];
  }

  getPlaceholder(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
