import { Component, EventEmitter, Output } from '@angular/core';
import { RelatorioService } from 'src/service/relatorio.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-criarPasta',
  templateUrl: './criarPasta.component.html',
  styleUrls: ['./criarPasta.component.css']
})
export class CriarPastaComponent {
  folderName: string = ''; // Nome da nova pasta
  @Output() pastaCriada = new EventEmitter<string>(); // Evento para emitir o nome da nova pasta
  @Output() cancelarCriacao = new EventEmitter<void>(); // Evento para cancelar a criação

  constructor(private relatorioService: RelatorioService,
    private messageService: MessageService, // Injeta o MessageService
    private dialogRef: DynamicDialogRef // Gerencia o modal

  ) {}

  criarPasta(): void {
    const nomePasta = this.folderName.trim();
  
    if (!nomePasta) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'O nome da pasta não pode estar vazio.' });
      return;
    }
  
    this.relatorioService.criarPasta(nomePasta).subscribe({
      next: (response: string) => {
        console.log(response); // Exibe a mensagem de sucesso do backend
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Pasta criada com sucesso!' });
        this.dialogRef.close(true); // Fecha o modal e informa o sucesso
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro ao criar a pasta:', error);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao criar a pasta. Verifique o console para mais detalhes.' });
      }
    });
  }
  

  cancelar(): void {
    this.dialogRef.close(false); 
  }
}
