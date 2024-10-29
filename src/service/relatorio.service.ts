import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Upload de arquivo ZIP
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/report/upload`, formData, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }
  getInitialDirectories(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/explorer/directories');
  }
  getDirectoryContents(path: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/explorer/list?path=${path}`)
      .pipe(catchError(this.handleError));
  }
  // Gera JSON de um diretório específico
  generateJson(directory: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/report/generate-json`, { directoryName: directory })
      .pipe(catchError(this.handleError));
  }

  // Lista os diretórios disponíveis
  listDirectories(): Observable<any> {
    console.log('Chamando a API para listar diretórios');
    return this.http.get<any>(`${this.apiUrl}/explorer/directories`);
  }

  // Lista os arquivos em um diretório
  listFolderContents(path: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/explorer/list`, {
      params: { path }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Manipulador de erros
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Erro desconhecido!';
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      errorMessage = `Erro ${error.status}: ${error.message}`;
    }
    return throwError(errorMessage);
  }

  gerarRelatorio(directory: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/report/generate-json`, { directoryName: directory })
      .pipe(
        catchError(this.handleError)
      );
  }
}
