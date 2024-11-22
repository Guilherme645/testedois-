import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RelatorioService } from 'src/service/relatorio.service'; // Serviço que lida com dados de arquivos e diretórios
import { MenuItem, TreeNode } from 'primeng/api'; // Componentes do PrimeNG usados no menu e na árvore de pastas
import { Dialog } from 'primeng/dialog'; // Componente do PrimeNG usado para exibir modais (janelas flutuantes)

@Component({
  selector: 'app-relatorio', // Identificador do componente
  templateUrl: './relatorio.component.html', // Arquivo HTML que define a interface gráfica
  styleUrls: ['./relatorio.component.css'], // Arquivo CSS que define o estilo do componente
})
export class RelatorioComponent implements OnInit {
  @ViewChild('dialog') dialog: Dialog | undefined;
  directories: string[] = [];
  items: MenuItem[] | undefined;
  selectedFileName: string | null = null;
  selectedDirectory: string = '';
  files: TreeNode<any>[] = [];
  selectedFile: TreeNode<any> | TreeNode<any>[] | null = null;
  jsonResult: any = null;
  showJson: boolean = false;
  filesInDirectory: any[] = [];
  selectedUploadFile: File | null = null;
  uploadError: string | null = null;
  errorMessage: string | null = null;
  displayModal: boolean = false;
  selectedJsonData: any;
  selectedRowIndex: number | null = null;
  constructor(private relatorioService: RelatorioService) {} // Injeta o serviço para gerenciar diretórios e arquivos

  // Método chamado assim que o componente é carregado
  ngOnInit() {
    this.inicializarMenu(); // Configura o menu superior
    this.carregarDiretorios(); // Carrega os diretórios iniciais
  }

  // Quando um arquivo é selecionado na tabela, tenta gerar o JSON correspondente
  selecionarArquivo(arquivo: any, rowIndex: number): void {
    this.selectedRowIndex = rowIndex;
    console.log('Arquivo selecionado na tabela:', arquivo);
    if (this.selectedDirectory && arquivo.data.nome) {
      this.abrirDialogoRelatorio(arquivo.data); // Abre o modal para gerar o relatório
    } else {
      console.error('Nenhum diretório ou nome da pasta selecionado.');
    }
  }

  // Após a interface ser totalmente carregada, maximiza o modal de diálogo, se existir
  ngAfterViewInit() {
    if (this.dialog) {
      this.dialog.maximize();
    }
  }

  excluirPasta(){

  }

  // Configura o menu superior com as opções de criar pasta, excluir e carregar arquivo
  inicializarMenu() {
    this.items = [
      { label: 'Nova Pasta', icon: 'pi pi-plus', command: () => this.criarNovaPasta() },
      { label: 'Excluir', icon: 'pi pi-times', command: () => this.excluirPasta() },
      { label: 'Carregar novo relatório (ZIP)', icon: 'pi pi-file-plus', command: () => this.dispararEntradaArquivo() },
    ];
  }

  // Carrega a lista de diretórios do sistema
  carregarDiretorios() {
    this.relatorioService.obterConteudoDoDiretorio('').subscribe({
      next: (data) => {
        console.log('Diretórios carregados:', data);
        this.files = data; // Atualiza a árvore de diretórios
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar diretórios';
        console.error('Erro ao carregar diretórios', error);
      },
    });
  }

  // Carrega os arquivos de um diretório específico selecionado na árvore
  carregarArquivosParaDiretorio(diretorio: string) {
    this.relatorioService.listarConteudoDaPasta(diretorio).subscribe({
      next: (arquivos: any[]) => {
        this.filesInDirectory = arquivos; // Exibe os arquivos na tabela
        console.log('Arquivos na pasta selecionada:', this.filesInDirectory);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro ao carregar arquivos:', error);
      },
    });
  }

  // Quando um nó (diretório ou arquivo) é selecionado na árvore
  aoSelecionarNo(event: any) {
    const node = event.node;
    this.selectedDirectory = node.label; // Atualiza o diretório selecionado
    console.log('Diretório selecionado:', this.selectedDirectory);
    if (this.selectedDirectory) {
      this.carregarArquivosParaDiretorio(this.selectedDirectory); // Exibe os arquivos no diretório
    } else {
      console.error('Nenhum diretório selecionado');
    }
  }

  // Gera JSON com base no diretório e nome da pasta
  lidarComSelecaoDeNo(event: any) {
    const node = event.node;
    this.selectedDirectory = node.label;
    const folderName = node.data && node.data.name ? node.data.name : '';
    if (this.selectedDirectory && folderName) {
      this.relatorioService.gerarJson(this.selectedDirectory, folderName).subscribe({
        next: (response) => {
          console.log('JSON gerado com sucesso:', response);
        },
        error: (error) => {
          console.error('Erro ao gerar JSON:', error);
        },
      });
    } else {
      console.error('Diretório ou nome da pasta não especificado.');
    }
  }

  // Abre o modal para mostrar o relatório de um arquivo
  abrirDialogoRelatorio(arquivo: any) {
    console.log('Arquivo selecionado:', arquivo);
    const folderName = arquivo.name || arquivo.label;
    const directory = this.selectedDirectory;
    if (directory && folderName) {
      this.relatorioService.gerarJson(directory, folderName).subscribe({
        next: (jsonResponse) => {
          this.selectedJsonData = jsonResponse; // Exibe os dados do JSON no modal
          this.displayModal = true;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erro ao gerar JSON:', error);
        },
      });
    } else {
      console.error('Diretório ou nome da pasta não especificado.');
    }
  }

  // Cria uma nova pasta no diretório atual
  criarNovaPasta() {
    const folderName = prompt('Digite o nome da nova pasta:'); // Pede o nome da nova pasta ao usuário
    if (folderName) {
      this.relatorioService.criarPasta(folderName).subscribe({
        next: (response) => {
          console.log('Nova pasta criada:', response);
          this.carregarDiretorios(); // Atualiza a lista de diretórios
        },
        error: (error) => {
          console.error('Erro ao criar a pasta:', error);
        },
      });
    }
  }

  // Envia um arquivo para upload no diretório selecionado
  enviarArquivo(event: any) {
    const file = event.target.files[0];
    if (file && this.selectedDirectory) {
      this.enviarArquivoParaDiretorio(file, this.selectedDirectory); // Faz o upload
    } else {
      console.error('Nenhum arquivo ou diretório selecionado');
    }
  }

  dispararEntradaArquivo() {
    const fileInput = document.getElementById('fileInput') as HTMLElement;
    fileInput.click();
  }

  // Carrega um arquivo e exibe os dados no modal
  enviarArquivoParaDiretorio(arquivo: File, caminhoDiretorio: string): void {
    if (arquivo && caminhoDiretorio) {
      this.relatorioService.enviarArquivoParaDiretorio(arquivo, caminhoDiretorio).subscribe({
        next: (response) => {
          console.log('Arquivo carregado com sucesso:', response);
          this.carregarArquivosParaDiretorio(caminhoDiretorio); // Atualiza os arquivos no diretório
        },
        error: (error) => {
          console.error('Erro ao carregar o arquivo:', error);
        },
      });
    } else {
      console.error('Arquivo ou diretório não especificados.');
    }
  }
}
