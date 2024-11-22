import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RelatorioService } from 'src/service/relatorio.service';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent implements OnInit {
  items: MenuItem[] | undefined;
  viewMode: string = 'list';

  constructor(
    private relatorioService: RelatorioService,
  ) {}

  ngOnInit() {
    this.items = [
      {
        label: 'Nova Pasta',
        icon: 'pi pi-plus',
        command: () => this.novaPasta()  // Chama a função de criar pasta
      },
      {
        label: 'Excluir',
        icon: 'pi pi-times',
        command: () => this.excluir()  // Chama a função de exclusão
      },
      {
        label: 'Carregar novo relatório (ZIP)',
        icon: 'pi pi-file-plus',
        command: () => this.triggerFileInput()  // Dispara o input de upload de arquivo
      },
      {
        label: 'Lista',
        icon: ' pi pi-list',
        command: () => this.toggleView('list')
      },
      {
        label: 'Ícones',
        icon: ' pi pi-list',
        command: () => this.toggleView('Ícones')
      }
    ];
  }

  // Função para criar nova pasta
  novaPasta() {
    console.log('Criar nova pasta');
    // Adicionar a lógica de criação de pasta aqui
  }

  toggleView(mode: string) {
    this.viewMode = mode;
  }

  // Função para excluir
  excluir() {
    console.log('Excluir item');
    // Adicionar a lógica de exclusão aqui
  }

  // Função para disparar o input de arquivo
  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLElement;
    fileInput.click();  // Simula o clique no input de arquivo
  }

 // Função de upload de arquivo
 uploadFile(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.relatorioService.enviarArquivo(file).subscribe({
      next: (response) => {
        console.log('Arquivo carregado com sucesso:', response);
        // Recarrega os diretórios após o upload
        // Você pode adicionar a função para recarregar diretórios aqui
      },
      error: (error) => {
        console.error('Erro ao carregar o arquivo:', error);
      }
    });
  }
}
}
