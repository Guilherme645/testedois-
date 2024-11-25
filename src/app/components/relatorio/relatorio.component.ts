import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RelatorioService } from 'src/service/relatorio.service'; // Serviço que lida com dados de arquivos e diretórios
import { MenuItem, TreeNode } from 'primeng/api'; // Componentes do PrimeNG usados no menu e na árvore de pastas
import { Dialog } from 'primeng/dialog'; // Componente do PrimeNG usado para exibir modais (janelas flutuantes)

@Component({
  selector: 'app-relatorio',
  templateUrl: './relatorio.component.html',
  styleUrls: ['./relatorio.component.css'],
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
  hiddenFiles: any[] = []; // Armazena os arquivos ocultos
  selectedUploadFile: File | null = null;
  uploadError: string | null = null;
  errorMessage: string | null = null;
  displayModal: boolean = false;
  selectedJsonData: any;
  viewMode: string = 'list';
  selectedRowIndex: number | null = null;

  constructor(private relatorioService: RelatorioService) {}

  ngOnInit() {
    this.inicializarMenu();
    this.carregarDiretorios();
  }

  inicializarMenu() {
    this.items = [
      { label: 'Nova Pasta', icon: 'pi pi-plus', command: () => this.criarNovaPasta() },
      { label: 'Excluir', icon: 'pi pi-times', command: () => this.excluirPasta() },
      { label: 'Carregar novo relatório (ZIP)', icon: 'pi pi-file-plus', command: () => this.dispararEntradaArquivo() },
      { label: 'Lista', icon: 'pi pi-list', command: () => this.toggleView('list') },
      { label: 'Ícones', icon: 'pi pi-th-large', command: () => this.toggleView('icons') },
    ];
  }

  toggleView(mode: string) {
    this.viewMode = mode;
  }

  carregarDiretorios() {
    this.relatorioService.obterConteudoDoDiretorio('').subscribe({
      next: (data) => {
        console.log('Dados carregados:', data);
        this.files = this.transformarParaTreeNodes(data); // Atualiza a árvore com apenas pastas
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Erro ao carregar diretórios.';
        console.error('Erro ao carregar diretórios:', error);
      },
    });
  }

  excluirPasta() {
    // Método de exclusão de pastas (a ser implementado conforme necessário)
  }

  transformarParaTreeNodes(data: any[]): TreeNode[] {
    return data
      .filter((item: any) => item.data.tipo === 'Pasta de arquivos') // Filtra apenas pastas
      .map((item: any) => ({
        label: item.label,
        data: item.data,
        leaf: !item.children || item.children.length === 0, // Nó folha se não houver filhos
        children: item.children ? this.transformarParaTreeNodes(item.children) : [], // Recursão para filhos
      }));
  }

  carregarArquivosParaDiretorio(diretorio: string) {
    this.relatorioService.listarConteudoDaPasta(diretorio).subscribe({
      next: (arquivos: any[]) => {
        this.hiddenFiles = arquivos.filter((item) => item.tipo !== 'Pasta de arquivos'); // Oculta arquivos
        this.filesInDirectory = arquivos.filter((item) => item.tipo === 'Pasta de arquivos');
        console.log('Arquivos ocultos da pasta selecionada:', this.hiddenFiles);
        console.log('Pastas carregadas:', this.filesInDirectory);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro ao carregar arquivos:', error);
      },
    });
  }

  aoSelecionarNo(event: any) {
    const node = event.node;
    this.selectedDirectory = node.data.nome; // Obtém o nome da pasta selecionada
    console.log('Diretório selecionado:', this.selectedDirectory);
    if (this.selectedDirectory) {
      // Chama o serviço para listar o conteúdo da pasta
      this.relatorioService.listarConteudoDaPasta(this.selectedDirectory).subscribe({
        next: (arquivos: any[]) => {
          // Atualiza a lista de subpastas e arquivos na tabela
          this.filesInDirectory = arquivos;
          console.log('Subpastas e arquivos:', this.filesInDirectory);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erro ao carregar arquivos e subpastas:', error);
        },
      });
    }
  }

  criarNovaPasta() {
    const folderName = prompt('Digite o nome da nova pasta:');
    if (folderName) {
      this.relatorioService.criarPasta(folderName).subscribe({
        next: (response) => {
          console.log('Nova pasta criada:', response);
          this.carregarDiretorios();
        },
        error: (error) => {
          console.error('Erro ao criar a pasta:', error);
        },
      });
    }
  }

  enviarArquivo(event: any) {
    const file = event.target.files[0];
    if (file && this.selectedDirectory) {
      this.enviarArquivoParaDiretorio(file, this.selectedDirectory);
    } else {
      console.error('Nenhum arquivo ou diretório selecionado');
    }
  }

  enviarArquivoParaDiretorio(arquivo: File, caminhoDiretorio: string): void {
    if (arquivo && caminhoDiretorio) {
      this.relatorioService.enviarArquivoParaDiretorio(arquivo, caminhoDiretorio).subscribe({
        next: (response) => {
          console.log('Arquivo carregado com sucesso:', response);
          this.carregarArquivosParaDiretorio(caminhoDiretorio);
        },
        error: (error) => {
          console.error('Erro ao carregar o arquivo:', error);
        },
      });
    } else {
      console.error('Arquivo ou diretório não especificados.');
    }
  }

  dispararEntradaArquivo() {
    const fileInput = document.getElementById('fileInput') as HTMLElement;
    fileInput.click();
  }

  selecionarArquivo(arquivo: any, rowIndex: number): void {
    this.selectedRowIndex = rowIndex;
    console.log('Arquivo selecionado na tabela:', arquivo);
    if (this.selectedDirectory && arquivo.data.nome) {
      this.abrirDialogoRelatorio(arquivo.data); // Abre o modal para gerar o relatório
    } else {
      console.error('Nenhum diretório ou nome da pasta selecionado.');
    }
  }

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

  abrirDialogoRelatorio(arquivo: any) {
    console.log('Arquivo selecionado:', arquivo);
    const folderName = arquivo.name || arquivo.label;
    const directory = this.selectedDirectory;
    if (directory && folderName) {
      this.relatorioService.gerarJson(directory, folderName).subscribe({
        next: (jsonResponse) => {
          this.selectedJsonData = jsonResponse;
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
}
