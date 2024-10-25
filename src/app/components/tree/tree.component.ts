import { Component, OnInit } from '@angular/core';
import { RelatorioService } from 'src/service/relatorio.service';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css']
})
export class TreeComponent implements OnInit {

  files: any[] = [];
  selectedNode: any = null;  // O nó selecionado

  constructor(private relatorioService: RelatorioService) {}

  ngOnInit() {
  
  }

  // Transformar os dados recebidos da API em formato de árvore
  transformToTreeData(data: any[]): any[] {
    return data.map(item => this.transformNode(item));
  }

  transformNode(item: any): any {
    const node: any = {
      label: item.name,
      children: []
    };

    // Verifica se há subdiretórios
    if (item.directories && item.directories.length > 0) {
      node.children = item.directories.map((child: any) => this.transformNode(child));
    }

    // Verifica se há arquivos e os adiciona como nós folha
    if (item.files && item.files.length > 0) {
      node.children = node.children.concat(
        item.files.map((file: any) => ({ label: file.name, leaf: true }))
      );
    }

    return node;
  }

  // Ação quando um nó é selecionado
  nodeSelect(event: any) {
    this.selectedNode = event.node;  // Atualiza o nó selecionado
    console.log('Nó selecionado:', this.selectedNode);
  }

  novaPasta() {
    const newFolderName = prompt('Digite o nome da nova pasta:');
    
    if (newFolderName) {
      if (this.selectedNode) {
        // Adiciona a nova pasta como filha do nó selecionado
        this.selectedNode.children = this.selectedNode.children || [];
        this.selectedNode.children.push({ label: newFolderName, children: [] });
      } else {
        // Se nenhum nó estiver selecionado, adiciona a pasta na raiz
        this.files.push({ label: newFolderName, children: [] });
      }
    }
  }
  
  excluirPasta() {
    if (this.selectedNode) {
      const confirmDelete = confirm('Tem certeza de que deseja excluir a pasta selecionada?');
  
      if (confirmDelete) {
        this.removeNode(this.files, this.selectedNode);
        this.selectedNode = null; // Limpa a seleção após a exclusão
      }
    } else {
      alert('Nenhum nó selecionado para exclusão.');
    }
  }

  // Função auxiliar para remover um nó da árvore
  removeNode(nodes: any[], nodeToRemove: any) {
    const index = nodes.findIndex(node => node === nodeToRemove);
  
    if (index !== -1) {
      nodes.splice(index, 1);
    } else {
      nodes.forEach(node => {
        if (node.children) {
          this.removeNode(node.children, nodeToRemove);
        }
      });
    }
  }
  
  carregarRelatorio(event: any) {
    const file = event.target.files[0];
  
    if (file && this.selectedNode) {
      // Adiciona o arquivo como um nó filho do diretório selecionado
      this.selectedNode.children = this.selectedNode.children || [];
      this.selectedNode.children.push({ label: file.name, leaf: true });
    } else if (!this.selectedNode) {
      alert('Nenhuma pasta selecionada para carregar o arquivo.');
    }
  }
}
