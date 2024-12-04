import { Component, EventEmitter, Output } from '@angular/core';
import { RelatorioService } from 'src/service/relatorio.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-criarPasta',
  templateUrl: './criarPasta.component.html',
  styleUrls: ['./criarPasta.component.css']
})
export class CriarPastaComponent {
  folderName: string = ''; // Nome da nova pasta
  @Output() pastaCriada = new EventEmitter<string>(); // Evento para emitir o nome da nova pasta
  @Output() cancelarCriacao = new EventEmitter<void>(); // Evento para cancelar a criação

  constructor(private relatorioService: RelatorioService) {}

  criarPasta(): void {
    const nomePasta = this.folderName.trim();
  
    if (!nomePasta) {
      alert('O nome da pasta não pode estar vazio.');
      return;
    }
  
    this.relatorioService.criarPasta(nomePasta).subscribe({
      next: (response: string) => {
        console.log(response); // Exibe a mensagem de sucesso do backend
        alert('Pasta criada com sucesso!');
        this.pastaCriada.emit(nomePasta); // Emite o evento com o nome da pasta criada
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro ao criar a pasta:', error);
        alert('Erro ao criar a pasta. Verifique o console para mais detalhes.');
      }
    });
  }
  

  cancelar(): void {
    this.cancelarCriacao.emit(); // Emite o evento de cancelamento
  }
}
