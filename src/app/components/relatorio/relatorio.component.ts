import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RelatorioService } from 'src/service/relatorio.service';
import { MenuItem, TreeNode } from 'primeng/api';
import { Dialog } from 'primeng/dialog';

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
  selectedUploadFile: File | null = null;
  uploadError: string | null = null;
  errorMessage: string | null = null;
  displayModal: boolean = false;
  selectedJsonData: any;
  selectedRowIndex: number | null = null;

  constructor(private relatorioService: RelatorioService) {}

  ngOnInit() {
    this.initializeMenu();
    this.loadDirectories();

  }

  // Seleciona o arquivo e gera JSON com base no nome e diretório da pasta
  selectFile(file: any, rowIndex: number): void {
    this.selectedRowIndex = rowIndex;
    console.log('Arquivo selecionado na tabela:', file);
    if (this.selectedDirectory && file.data.nome) {
        this.openReportDialog(file.data); 
    } else {
        console.error('Nenhum diretório ou nome da pasta selecionado.');
    }
}

ngAfterViewInit() {
  if (this.dialog) {
    this.dialog.maximize();
  }
}

  // Inicializa o menu com as ações necessárias
  initializeMenu() {
    this.items = [
      { label: 'Nova Pasta', icon: 'pi pi-plus', command: () => this.createNewFolder() },
      { label: 'Excluir', icon: 'pi pi-times', command: () => this.deleteFolder() },
      { label: 'Carregar novo relatório (ZIP)', icon: 'pi pi-file-plus', command: () => this.triggerFileInput() },
    ];
  }

  // Carrega os diretórios iniciais
  loadDirectories() {
    this.relatorioService.getDirectoryContents('').subscribe({
      next: (data) => {
        console.log('dsadsadsadsada', data);
        this.files = data;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar diretórios';
        console.error('Erro ao carregar diretórios', error);
      },
    });
  }

  // Carrega os arquivos do diretório selecionado
  loadFilesInDirectory(directory: string) {
    this.relatorioService.listFolderContents(directory).subscribe({
      next: (files: File[]) => {
        this.files = files.map(file => ({ label: file.name, data: file, type: 'file' }));
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Erro ao carregar arquivos do diretório.';
        console.error(error);
      },
    });
  }

  loadFilesForDirectory(directory: string) {
    this.relatorioService.listFolderContents(directory).subscribe({
      next: (files: any[]) => {
        this.filesInDirectory = files;
        console.log('Arquivos na pasta selecionada:', this.filesInDirectory);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro ao carregar arquivos:', error);
      },
    });
  }

  // Seleciona o nó para exibir o conteúdo do diretório
  onNodeSelect(event: any) {
    const node = event.node;
    this.selectedDirectory = node.label; 
    console.log('Diretório selecionado:', this.selectedDirectory); 
    if (this.selectedDirectory) {
        this.loadFilesForDirectory(this.selectedDirectory); 
    } else {
        console.error('Nenhum diretório selecionado');
    }
}
  // Gera o JSON com base no diretório e pasta selecionados
  handleNodeSelection(event: any) {
    const node = event.node;
    this.selectedDirectory = node.label;
    const folderName = node.data && node.data.name ? node.data.name : '';
    if (this.selectedDirectory && folderName) {
        this.relatorioService.generateJson(this.selectedDirectory, folderName).subscribe({
            next: (response) => {
                console.log('JSON gerado com sucesso:', response);
            },
            error: (error) => {
                console.error('Erro ao gerar JSON:', error);
            }
        });
    } else {
        console.error('Diretório ou nome da pasta não especificado.');
    }
}
  // Expande o diretório no visual da árvore
  onNodeExpand(event: any) {
    const node = event.node;
    const directoryPath = node.label; // Obtém o caminho do diretório do nó expandido

    if (node && node.children.length === 0) { // Verifica se o nó não tem filhos
        this.relatorioService.getDirectoryContents(directoryPath).subscribe({
            next: (subfolders: any[]) => {
              console.log(subfolders)
                node.children = subfolders.map(subfolder => ({
                    label: subfolder.name,
                    data: { 
                        name: subfolder.name, 
                        directory: subfolder.directory 
                    },
                    children: [],
                    type: subfolder.directory ? 'folder' : 'file',
                    icon: subfolder.directory ?   '<img src="src/assets/file.png" alt="">' : 'pi pi-fw pi-file'
                }));
            },
            error: (error: HttpErrorResponse) => {
                console.error('Erro ao carregar subpastas:', error);
            },
        });
    }
}

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLElement;
    fileInput.click();
  }

  uploadFile(event: any) {
    const file = event.target.files[0];
    if (file && this.selectedDirectory) {
      this.uploadFileToDirectory(file, this.selectedDirectory);
    } else {
      console.error('Nenhum arquivo ou diretório selecionado');
    }
  }

  // Cria uma nova pasta no diretório atual
  createNewFolder() {
    const folderName = prompt('Digite o nome da nova pasta:');
    if (folderName) {
      this.relatorioService.createFolder(folderName).subscribe({
        next: (response) => {
          console.log('Nova pasta criada:', response);
          const newFolder: TreeNode = {
            label: folderName,
            data: {
              name: folderName,
              directory: true,
              modifiedDate: new Date().toISOString(),
              type: 'Pasta de arquivos',
            },
            children: [],
            type: 'folder',
          };
          this.files.push(newFolder);
          this.loadDirectories();
        },
        error: (error) => {
          console.error('Erro ao criar a pasta:', error);
        },
      });
    }
  }

  deleteFolder() {
    // Implementação da exclusão de pasta, se necessário
  }

  generateJson(directory: string, folderName: string): void {
    if (!directory || !folderName) {
        console.error('Diretório ou nome da pasta não especificado.', { directory, folderName });
        return; 
    }
    console.log('Gerando JSON para:', { directory, folderName }); 
    this.relatorioService.generateJson(directory, folderName).subscribe({
        next: (jsonResponse: any) => {
            this.jsonResult = jsonResponse;
            console.log('JSON gerado com sucesso:', jsonResponse);
        },
        error: (error) => {
            console.error('Erro ao gerar JSON:', error);
            const errorMessage = error.error || 'Erro ao gerar JSON';
            this.uploadError = `Erro ao gerar JSON: ${errorMessage}`;
        }
    });
}

openReportDialog(file: any) {
  console.log('Arquivo selecionado:', file); 
  const folderName = file.name || file.label; 
  const directory = this.selectedDirectory; 
  console.log('Tentando gerar JSON com:', { directory, folderName }); 
  if (directory && folderName) {
    this.relatorioService.generateJson(directory, folderName).subscribe({
      next: (jsonResponse) => {
        this.selectedJsonData = jsonResponse;
        this.displayModal = true;
        setTimeout(() => {
          if (this.dialog) {
            this.dialog.maximize();
          }
        }, 0);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro ao gerar JSON:', error);
      }
    });
  } else {
    console.error('Diretório ou nome da pasta não especificado.', { directory, folderName }); 
  }
}

  handleReportGeneration(event: any) {
    console.log('Relatório gerado com os dados:', event);
  }

  uploadFileToDirectory(file: File, directoryPath: string): void {
    if (file && directoryPath) {
      this.relatorioService.uploadFileToDirectory(file, directoryPath).subscribe({
        next: (response) => {
          console.log('Arquivo carregado com sucesso:', response);
          this.loadFilesForDirectory(directoryPath);
        },
        error: (error) => {
          console.error('Erro ao carregar o arquivo:', error);
        },
      });
    } else {
      console.error('Arquivo ou diretório não especificados.');
    }
  }

  openDialog() {
    this.displayModal = true; // Certifique-se de que 'true' é boolean e não uma string
  }
  
  closeDialog() {
    this.displayModal = false;
  }
}
