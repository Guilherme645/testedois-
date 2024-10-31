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

  // Upload de arquivo para um diretório específico
  uploadFileToDirectory(file: File, directoryPath: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', directoryPath); 
    return this.http.post(`${this.apiUrl}/report/upload`, formData)
      .pipe(catchError(this.handleError));
  }
  // Upload de arquivo
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/report/upload`, formData, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  // Obtém diretórios iniciais
  getInitialDirectories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/explorer/directories`);
  }

  // Obtém conteúdo de um diretório
  getDirectoryContents(path: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/explorer/list?path=${path}`)
      .pipe(catchError(this.handleError));
  }

  // Gera JSON de um diretório específico
  generateJson(directory: string, folderName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/report/generate-json`, {
        directoryName: `${directory}/${folderName}` // Certifique-se de concatenar corretamente
    })
    .pipe(catchError(this.handleError));
}
  // Lista diretórios
  listDirectories(): Observable<any> {
    console.log('Chamando a API para listar diretórios');
    return this.http.get<any>(`${this.apiUrl}/explorer/directories`);
  }

  // Lista conteúdos de uma pasta
  listFolderContents(path: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/explorer/list`, { params: { path } })
      .pipe(catchError(this.handleError));
  }

  // Manipulador de erros
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Erro desconhecido!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Erro ${error.status}: ${error.message}`;
    }
    return throwError(errorMessage);
  }
  // Cria nova pasta
  createFolder(folderName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/explorer/create-directory`, folderName)
      .pipe(catchError(this.handleError));
  }
}
