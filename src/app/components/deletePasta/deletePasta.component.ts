import { Component, Input } from '@angular/core';
import { RelatorioService } from 'src/service/relatorio.service';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-deletePasta',
  templateUrl: './deletePasta.component.html',
  styleUrls: ['./deletePasta.component.css'],
})
export class DeletePastaComponent {
  folderName: string = '';

  constructor(
    private relatorioService: RelatorioService,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private messageService: MessageService, 
  ) {}

  ngOnInit(): void {
    this.folderName = this.config.data?.folderName || '';
  }

  excluirPasta(): void {
    if (!this.folderName) {
      alert('Nenhuma pasta foi selecionada para exclusão.');
      return;
    }
    this.relatorioService.deletarPasta(this.folderName).subscribe({
      next: () => {
        console.log(`Pasta "${this.folderName}" excluída com sucesso.`);
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Pasta excluida com sucesso!' });
        this.dialogRef.close(true); // Fecha o modal e informa o sucesso
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro ao excluir a pasta:', error);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir a pasta. Clique na pasta que deseja.' });
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close(false); 
  }
}
