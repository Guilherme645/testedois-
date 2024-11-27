import { Component, OnInit, Output,ViewChild, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RelatorioService } from 'src/service/relatorio.service'; // Serviço que lida com dados de arquivos e diretórios
import { MenuItem, TreeNode } from 'primeng/api'; // Componentes do PrimeNG usados no menu e na árvore de pastas
import { Dialog } from 'primeng/dialog'; // Componente do PrimeNG usado para exibir modais (janelas flutuantes)
import { DirectoryService } from 'src/app/shared/directory.service';

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
  selectedSubDirectory: string = '';
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
  @Output() directorySelected = new EventEmitter<{ directory: string; subDirectory: string }>();

  constructor(private relatorioService: RelatorioService, private directoryService: DirectoryService) {}

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

aoSelecionarNo(event: any): void {
    const node = event.node;

    // Verifica se o nó tem um pai, ou seja, se é um subdiretório
    if (node.parent) {
        // Diretório principal (pai do nó)
        this.selectedDirectory = node.parent.data.nome;
        // Subdiretório (o nó atual)
        this.selectedSubDirectory = node.data.nome;
    } else {
        // Caso seja um nó de diretório sem subdiretório, exibe alerta
        alert('Selecione um subdiretório válido.');
        console.error('Erro: Subdiretório é obrigatório.');
        return; // Sai da função, pois não há subdiretório
    }

    console.log('Diretório selecionado:', this.selectedDirectory);
    console.log('Subdiretório selecionado:', this.selectedSubDirectory);

    // Emite os valores para o serviço (envia apenas se ambos forem válidos)
    if (this.selectedDirectory && this.selectedSubDirectory) {
        this.directoryService.emitDirectorySelected({
            directory: this.selectedDirectory,
            subDirectory: this.selectedSubDirectory,
        });

        console.log('Evento emitido pelo serviço:', {
            directory: this.selectedDirectory,
            subDirectory: this.selectedSubDirectory,
        });

        // Atualiza a lista de arquivos/subpastas
        this.relatorioService.listarConteudoDaPasta(this.selectedDirectory).subscribe({
            next: (arquivos: any[]) => {
                this.filesInDirectory = arquivos;
                console.log('Arquivos e subpastas carregados:', this.filesInDirectory);
            },
            error: (error: HttpErrorResponse) => {
                console.error('Erro ao carregar arquivos e subpastas:', error);
            },
        });
    } else {
        alert('Tanto o diretório quanto o subdiretório são obrigatórios.');
    }
}


  onDirectorySelected(event: { directory: string; subDirectory: string }): void {
    console.log('Diretório selecionado:', event.directory);
    console.log('Subdiretório selecionado:', event.subDirectory);
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

  abrirDialogoRelatorio(file: any): void {
    const directory = this.selectedDirectory;
    const subDirectory = file.data.nome;
  
    if (directory && subDirectory) {
      // Emitir evento para o DirectoryService
      this.directoryService.emitDirectorySelected({
        directory,
        subDirectory,
      });
  
      console.log('Evento emitido para o DirectoryService:', { directory, subDirectory });
  
      // Exibir o modal
      this.displayModal = true;
    } else {
      console.error('Diretório ou subdiretório não especificados.');
    }
  }
}
