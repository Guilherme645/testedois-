import { Component, EventEmitter, Output } from '@angular/core';
import { RelatorioService } from 'src/service/relatorio.service';

@Component({
  selector: 'app-criarPasta',
  templateUrl: './criarPasta.component.html',
  styleUrls: ['./criarPasta.component.css']
})
export class CriarPastaComponent {
  display: boolean = false; // Para controle da visibilidade do diálogo
  folderName: string = ''; // Armazena o nome da nova pasta

  constructor(private relatorioService: RelatorioService) {}

  openDialog() {
    this.display = true; // Abre o diálogo
  }

  closeDialog() {
    this.display = false; // Fecha o diálogo
  }

  createNewFolder() {
    if (this.folderName) {
      this.relatorioService.createFolder(this.folderName).subscribe({
        next: (response) => {
          console.log('Nova pasta criada:', response);
          this.closeDialog(); // Fecha o diálogo após criar a pasta
          // Você pode adicionar lógica aqui para atualizar a lista de pastas, se necessário
        },
        error: (error) => {
          console.error('Erro ao criar a pasta:', error);
        }
      });
    } else {
      alert('Por favor, insira um nome para a pasta.'); // Validação simples
    }
  }
}
