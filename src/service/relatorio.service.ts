import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/app/environments';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Envia um arquivo para um diretório específico no servidor.
   * @param arquivo Arquivo a ser enviado.
   * @param caminhoDiretorio Caminho do diretório.
   */
  enviarArquivoParaDiretorio(arquivo: File, caminhoDiretorio: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', arquivo);
    formData.append('path', caminhoDiretorio);

    return this.http.post(`${this.apiUrl}/report/upload`, formData).pipe(
      catchError(this.tratarErro)
    );
  }

  /**
   * Envia um arquivo para o servidor sem especificar o diretório.
   * @param arquivo Arquivo a ser enviado.
   */
  enviarArquivo(arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', arquivo);

    return this.http.post(`${this.apiUrl}/report/upload`, formData, { responseType: 'text' }).pipe(
      catchError(this.tratarErro)
    );
  }

  /**
   * Obtém a lista de diretórios iniciais disponíveis.
   */
  obterDiretoriosIniciais(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/explorer/directories`).pipe(
      catchError(this.tratarErro)
    );
  }

  /**
   * Obtém o conteúdo (arquivos e subpastas) de um diretório específico.
   * @param caminho Caminho do diretório.
   */
  obterConteudoDoDiretorio(caminho: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/explorer/list?path=${caminho}`).pipe(
      catchError(this.tratarErro)
    );
  }

  /**
   * Gera um arquivo JSON com base nos dados de um diretório específico.
   * @param diretorio Caminho do diretório.
   * @param nomePasta Nome da pasta.
   */
  gerarJson(diretorio: string, nomePasta: string): Observable<any> {
    const directoryName = `${diretorio}/${nomePasta}`;
    console.log('Enviando para o backend:', directoryName);
    return this.http.post(`${this.apiUrl}/report/generate-json`, { directoryName }).pipe(
      tap((response) => console.log('Resposta recebida do backend:', response)),
      catchError(this.tratarErro)
    );
  }
  

  /**
   * Lista todos os diretórios disponíveis no servidor.
   */
  listarDiretorios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/explorer/directories`).pipe(
      catchError(this.tratarErro)
    );
  }

  /**
   * Lista o conteúdo (arquivos e subpastas) de uma pasta específica.
   * @param caminho Caminho da pasta.
   */
  listarConteudoDaPasta(caminho: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/explorer/list`, { params: { path: caminho } }).pipe(
      catchError(this.tratarErro)
    );
  }

  /**
   * Cria uma nova pasta no servidor.
   * @param nomePasta Nome da nova pasta.
   */
  criarPasta(nomePasta: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/explorer/create-directory`, nomePasta).pipe(
      catchError(this.tratarErro)
    );
  }

 /**
   * Gera um relatório PDF com base em um diretório específico.
   * @param directory Caminho do diretório.
   * @param action Ação a ser realizada ('v' para visualizar ou 'd' para download).
   */
 gerarRelatorio(
  subDirectory: string,
  directory: string,
  action: string,
  additionalParams: { [key: string]: any } = {}
): Observable<Blob> {
  // Cria o corpo da requisição com os argumentos obrigatórios e os parâmetros adicionais
  const requestBody = {
      subDirectory,
      directory,
      action,
      ...additionalParams, // Adiciona os parâmetros adicionais dinamicamente
  };

  return this.http.post<Blob>(`${this.apiUrl}/report/generate-report`, requestBody, {
      responseType: 'blob' as 'json', // Define a resposta como um arquivo PDF
  }).pipe(
      catchError((erro: HttpErrorResponse) => {
          const mensagemErro =
              erro.error instanceof ErrorEvent
                  ? `Erro no cliente: ${erro.error.message}`
                  : `Erro no servidor ${erro.status}: ${erro.message}`;
          console.error(`Erro ao gerar relatório: ${mensagemErro}`);
          return throwError(mensagemErro);
      })
  );
}

  /**
   * Manipulador genérico de erros nas requisições HTTP.
   * @param erro Objeto de erro recebido na requisição.
   */
  private tratarErro(erro: HttpErrorResponse): Observable<never> {
    const mensagemErro =
      erro.error instanceof ErrorEvent
        ? `Erro: ${erro.error.message}` // Erro do lado do cliente
        : `Erro ${erro.status}: ${erro.message}`; // Erro do lado do servidor

    console.error(mensagemErro);
    return throwError(mensagemErro);
  }
}
