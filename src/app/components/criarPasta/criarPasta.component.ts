import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RelatorioService } from 'src/service/relatorio.service';
import { TreeNode } from 'primeng/api'; // Importar TreeNode

@Component({
  selector: 'app-criarPasta',
  templateUrl: './criarPasta.component.html',
  styleUrls: ['./criarPasta.component.css']
})
export class CriarPastaComponent implements OnInit {
  @Output() folderCreated = new EventEmitter<string>(); // Emissor de eventos

  files: TreeNode[] = []; // Propriedade para armazenar os arquivos e pastas

  constructor(private relatorioService: RelatorioService) {} // Injeção do serviço

  ngOnInit() {
    this.loadDirectories(); // Carregar diretórios na inicialização
  }

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
              type: 'Pasta de arquivos'
            },
            children: [],
            type: 'folder'
          };
          this.files.push(newFolder); // Adiciona a nova pasta ao array de arquivos
          this.loadDirectories(); // Atualiza a lista de diretórios
        },
        error: (error) => {
          console.error('Erro ao criar a pasta:', error);
        }
      });
    }
  }

  loadDirectories() {
    this.relatorioService.listDirectories().subscribe({
      next: (directories) => {
        this.files = directories; // Assume que a resposta é do tipo TreeNode[]
      },
      error: (error) => {
        console.error('Erro ao carregar diretórios:', error);
      }
    });
  }
}
