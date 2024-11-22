import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/app/environments';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Enviar um arquivo para um diretório específico no servidor
  enviarArquivoParaDiretorio(arquivo: File, caminhoDiretorio: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', arquivo); // Adiciona o arquivo ao formulário
    formData.append('path', caminhoDiretorio); // Adiciona o caminho do diretório
    return this.http.post(`${this.apiUrl}/report/upload`, formData)
      .pipe(catchError(this.tratarErro)); // Trata erros na requisição
  }

  // Enviar um arquivo para o servidor (sem diretório específico)
  enviarArquivo(arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', arquivo); // Adiciona o arquivo ao formulário

    return this.http.post(`${this.apiUrl}/report/upload`, formData, { responseType: 'text' })
      .pipe(catchError(this.tratarErro)); // Trata erros na requisição
  }

  // Obter a lista de diretórios iniciais disponíveis
  obterDiretoriosIniciais(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/explorer/directories`);
  }

  // Obter o conteúdo (arquivos e subpastas) de um diretório específico
  obterConteudoDoDiretorio(caminho: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/explorer/list?path=${caminho}`)
      .pipe(catchError(this.tratarErro)); // Trata erros na requisição
  }

  // Gerar um arquivo JSON com base nos dados de um diretório específico
  gerarJson(diretorio: string, nomePasta: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/report/generate-json`, {
        directoryName: `${diretorio}/${nomePasta}` // Envia o nome do diretório completo
    })
    .pipe(catchError(this.tratarErro)); // Trata erros na requisição
  }

  // Listar todos os diretórios disponíveis
  listarDiretorios(): Observable<any> {
    console.log('Chamando a API para listar diretórios');
    return this.http.get<any>(`${this.apiUrl}/explorer/directories`);
  }

  // Listar o conteúdo (arquivos e subpastas) de uma pasta específica
  listarConteudoDaPasta(caminho: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/explorer/list`, { params: { path: caminho } })
      .pipe(catchError(this.tratarErro)); // Trata erros na requisição
  }

  // Manipulador genérico de erros de requisição HTTP
  private tratarErro(erro: HttpErrorResponse) {
    let mensagemErro = 'Erro desconhecido!';
    if (erro.error instanceof ErrorEvent) {
      // Erro do lado do cliente (navegador)
      mensagemErro = `Erro: ${erro.error.message}`;
    } else {
      // Erro do lado do servidor
      mensagemErro = `Erro ${erro.status}: ${erro.message}`;
    }
    return throwError(mensagemErro); // Retorna o erro para quem chamou o método
  }

  // Criar uma nova pasta no servidor
  criarPasta(nomePasta: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/explorer/create-directory`, nomePasta)
      .pipe(catchError(this.tratarErro)); // Trata erros na requisição
  }
}
