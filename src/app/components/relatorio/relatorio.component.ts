import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RelatorioService } from 'src/service/relatorio.service';
import { MenuItem, TreeNode } from 'primeng/api';  // Importar TreeNode do PrimeNG

@Component({
  selector: 'app-relatorio',
  templateUrl: './relatorio.component.html',
  styleUrls: ['./relatorio.component.css']
})
export class RelatorioComponent implements OnInit {

  // Diretórios disponíveis
  directories: string[] = [];
  items: MenuItem[] | undefined;
  selectedFileName: string | null = null; // Nome do arquivo selecionado
  selectedDirectory: string | null = null; // Diretório selecionado

  // Arquivos na pasta selecionada
  files: TreeNode<any>[] = [];
  selectedFile: TreeNode<any> | TreeNode<any>[] | null = null; 
  jsonResult: any = null;
  showJson: boolean = false;
  filesInDirectory: any[] = []; // Arquivos dentro do diretório selecionado
  // Outras propriedades...
  
  // Controle de upload
  selectedUploadFile: File | null = null;
  uploadError: string | null = null;
  errorMessage: string | null = null;
  
  // Propriedades para o diálogo de geração de relatórios
  displayModal: boolean = false; // Controle do modal
  selectedJsonData: any; // Dados do arquivo selecionado
  constructor(private relatorioService: RelatorioService) {}

  ngOnInit() {
    this.initializeMenu();
    this.loadDirectories(); // Carrega os diretórios ao iniciar o componente

  }

  // Inicializa os itens do menu
  initializeMenu() {
    this.items = [
      {
        label: 'Nova Pasta',
        icon: 'pi pi-plus',
        command: () => this.createNewFolder()  // Chama a função de criar pasta
      },
      {
        label: 'Excluir',
        icon: 'pi pi-times',
        command: () => this.deleteFolder()  // Chama a função de exclusão
      },
      {
        label: 'Carregar novo relatório (ZIP)',
        icon: 'pi pi-file-plus',
        command: () => this.triggerFileInput()  // Dispara o input de upload de arquivo
      }
    ];
  }

  // Função para carregar os arquivos em um diretório e transformá-los em TreeNode[]
  loadFilesInDirectory(directory: string) {
    this.relatorioService.listFilesInDirectory(directory).subscribe({
      next: (files: File[]) => {
        this.files = files.map(file => ({
          label: file.name,  // Atribui o nome do arquivo à propriedade 'label'
          data: file,        // O arquivo original fica armazenado em 'data'
          type: 'file'       // Tipo do nó, pode ser 'file' ou 'directory'
        }));
        console.log('Arquivos carregados:', this.files);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Erro ao carregar arquivos do diretório.';
        console.error(error);
      }
    });
  }
// Carrega os arquivos dentro de um diretório quando ele for selecionado
loadFilesForDirectory(directory: string) {
  this.relatorioService.listFilesInDirectory(directory).subscribe({
    next: (files: any[]) => {
      this.filesInDirectory = files;
    },
    error: (error: HttpErrorResponse) => {
      console.error('Erro ao carregar arquivos:', error);
    }
  });
}

  // Função chamada ao clicar no botão de visualização
  previewFile(file: any) {
    const fileUrl = file.url || file.path; // Supondo que o arquivo tem uma URL ou caminho
    window.open(fileUrl, '_blank'); // Abre o arquivo em uma nova aba
  }
  
  // Função chamada ao selecionar um diretório
  onNodeSelect(event: any) {
    const node = event.node;
    this.selectedDirectory = node.label; // Define o diretório selecionado
    
    // Verifica se o diretório selecionado não é null antes de carregar os arquivos
    if (this.selectedDirectory) {
      this.loadFilesForDirectory(this.selectedDirectory); // Carrega os arquivos do diretório
    } else {
      console.error('Nenhum diretório selecionado');
    }
  }



  // Função para disparar o input de arquivo
  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLElement;
    fileInput.click();  // Simula o clique no input de arquivo
  }

  // Função para fazer upload de arquivo
  uploadFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.relatorioService.uploadFile(file).subscribe({
        next: (response) => {
          console.log('Arquivo carregado com sucesso:', response);
          this.loadDirectories();  // Recarrega os diretórios após o upload
        },
        error: (error) => {
          console.error('Erro ao carregar o arquivo:', error);
        }
      });
    }
  }

  
  // Carrega a lista de diretórios
  loadDirectories() {
    this.relatorioService.listDirectories().subscribe({
      next: (directories) => {
        this.files = directories.map((dir: string) => ({
          label: dir, 
          expanded: true,
          children: []
        }));
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar diretórios';
        console.error('Erro ao carregar diretórios', error);
      }
    });
  }


  // Seleciona um diretório e carrega seus arquivos
  onDirectorySelected(directory: string) {
    this.selectedDirectory = directory; // Define o diretório selecionado
    this.loadFilesInDirectory(directory); // Carrega os arquivos do diretório
  }

  // Função para visualizar o JSON gerado
  showJsonContent() {
    this.showJson = !this.showJson;
  }

  // Função para criar nova pasta
  createNewFolder() {
    const folderName = prompt('Digite o nome da nova pasta:');
    if (folderName) {
      console.log('Nova pasta criada:', folderName);
      this.loadDirectories();  // Recarrega a lista de diretórios
    }
  }

  // Função para excluir pasta
  deleteFolder() {
    if (this.selectedDirectory) {
      const confirmation = confirm(`Deseja realmente excluir a pasta ${this.selectedDirectory}?`);
      if (confirmation) {
        console.log('Pasta excluída:', this.selectedDirectory);
        this.selectedDirectory = null;
        this.loadDirectories();  // Recarrega a lista de diretórios
      }
    } else {
      alert('Nenhuma pasta selecionada para exclusão.');
    }
  }
  generateJson(selectedFile: any) {
    if (selectedFile) {
      // Aqui, você pode decidir se quer gerar o JSON com base no arquivo ou no diretório.
      // Exemplo: chamando a API para gerar JSON para o arquivo clicado
      this.relatorioService.generateJson(selectedFile.name).subscribe({
        next: (jsonResponse) => {
          console.log('JSON gerado com sucesso:', jsonResponse);
          // Aqui você pode armazenar o JSON gerado em uma variável para exibição
          this.jsonResult = jsonResponse; // Supondo que você tenha uma propriedade para armazenar o JSON
          this.showJson = true; // Exibe o JSON
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = 'Erro ao gerar JSON. Tente novamente.';
          console.error(error);
        }
      });
    } else {
      this.errorMessage = 'Nenhum arquivo selecionado.';
    }
  }
  openReportDialog(file: any) {
    // Chame o serviço para gerar JSON do arquivo selecionado
    this.relatorioService.generateJson(file.name).subscribe({
      next: (jsonResponse) => {
        this.selectedJsonData = jsonResponse; // Armazena os dados JSON
        this.displayModal = true; // Abre o modal
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro ao gerar JSON:', error);
      }
    });
  }

  handleReportGeneration(event: any) {
    // Lógica após a geração do relatório, se necessário
    console.log('Relatório gerado com os dados:', event);
  }

}