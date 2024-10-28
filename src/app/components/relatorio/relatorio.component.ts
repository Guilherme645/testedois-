import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RelatorioService } from 'src/service/relatorio.service';
import { MenuItem, TreeNode } from 'primeng/api';

interface FileItem {
  name: string;
  directory: boolean;
  modifiedDate?: string;
  size?: string;
  type?: string;
}

interface TreeNodeData {
  label: string;
  data: FileItem;
  children: TreeNode[];
  type: 'file' | 'folder';
  expandedIcon?: string;
  collapsedIcon?: string;
}

@Component({
  selector: 'app-relatorio',
  templateUrl: './relatorio.component.html',
  styleUrls: ['./relatorio.component.css']
})
export class RelatorioComponent implements OnInit {
  directories: string[] = [];
  items: MenuItem[] | undefined;
  selectedFileName: string | null = null;
  selectedDirectory: string | null = null;
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

  constructor(private relatorioService: RelatorioService) {}

  ngOnInit() {
    this.initializeMenu();
    this.loadDirectories();
  }

  initializeMenu() {
    this.items = [
      { label: 'Nova Pasta', icon: 'pi pi-plus', command: () => this.createNewFolder() },
      { label: 'Excluir', icon: 'pi pi-times', command: () => this.deleteFolder() },
      { label: 'Carregar novo relatório (ZIP)', icon: 'pi pi-file-plus', command: () => this.triggerFileInput() }
    ];
  }

  loadDirectories() {
    this.relatorioService.listDirectories().subscribe({
      next: (directories) => {
        this.files = directories.map((dir: string) => ({ label: dir, expanded: false, children: [] }));
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar diretórios';
        console.error('Erro ao carregar diretórios', error);
      }
    });
  }

  loadFilesInDirectory(directory: string) {
    this.relatorioService.listFolderContents(directory).subscribe({
      next: (files: File[]) => {
        this.files = files.map(file => ({ label: file.name, data: file, type: 'file' }));
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Erro ao carregar arquivos do diretório.';
        console.error(error);
      }
    });
  }

  loadFilesForDirectory(directory: string) {
    this.relatorioService.listFolderContents(directory).subscribe({
      next: (files: any[]) => {
        this.filesInDirectory = files;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro ao carregar arquivos:', error);
      }
    });
  }

  onNodeSelect(event: any) {
    const node = event.node;
    this.selectedDirectory = node.label;
    if (this.selectedDirectory) {
      this.loadFilesForDirectory(this.selectedDirectory);
    } else {
      console.error('Nenhum diretório selecionado');
    }
  }

  onNodeExpand(event: any) {
    const node = event.node;
    const directoryPath = node.label;
    if (node && node.children.length === 0) {
      this.relatorioService.getDirectoryContents(directoryPath).subscribe({
        next: (subfolders: any[]) => {
          node.children = subfolders.map(subfolder => ({
            label: subfolder.name,
            data: { name: subfolder.name, directory: subfolder.directory },
            children: [],
            type: subfolder.directory ? 'folder' : 'file',
            expandedIcon: 'pi pi-chevron-down',
            collapsedIcon: 'pi pi-chevron-right'
          }));
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erro ao carregar subpastas:', error);
        }
      });
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLElement;
    fileInput.click();
  }

  uploadFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.relatorioService.uploadFile(file).subscribe({
        next: (response) => {
          console.log('Arquivo carregado com sucesso:', response);
          this.loadDirectories();
        },
        error: (error) => {
          console.error('Erro ao carregar o arquivo:', error);
        }
      });
    }
  }

  createNewFolder() {
    const folderName = prompt('Digite o nome da nova pasta:');
    if (folderName) {
      console.log('Nova pasta criada:', folderName);
      this.loadDirectories();
    }
  }

  deleteFolder() {
    if (this.selectedDirectory) {
      const confirmation = confirm(`Deseja realmente excluir a pasta ${this.selectedDirectory}?`);
      if (confirmation) {
        console.log('Pasta excluída:', this.selectedDirectory);
        this.selectedDirectory = null;
        this.loadDirectories();
      }
    } else {
      alert('Nenhuma pasta selecionada para exclusão.');
    }
  }

  generateJson(directory: string): void {
    this.relatorioService.generateJson(directory).subscribe({
      next: (jsonResponse: any) => {
        this.jsonResult = jsonResponse;
        console.log('JSON gerado com sucesso', jsonResponse);
      },
      error: (error) => {
        const errorMessage = error.error || 'Erro ao gerar JSON';
        this.uploadError = `Erro ao gerar JSON: ${errorMessage}`;
      }
    });
  }

  openReportDialog(file: any) {
    this.relatorioService.generateJson(file.name).subscribe({
      next: (jsonResponse) => {
        this.selectedJsonData = jsonResponse;
        this.displayModal = true;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro ao gerar JSON:', error);
      }
    });
  }

  handleReportGeneration(event: any) {
    console.log('Relatório gerado com os dados:', event);
  }
}
