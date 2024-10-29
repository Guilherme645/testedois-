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

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/report/upload`, formData, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  getInitialDirectories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/explorer/directories`);
  }

  getDirectoryContents(path: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/explorer/list?path=${path}`)
      .pipe(catchError(this.handleError));
  }

  generateJson(directory: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/report/generate-json`, { directoryName: directory })
      .pipe(catchError(this.handleError));
  }

  listDirectories(): Observable<any> {
    console.log('Chamando a API para listar diretórios');
    return this.http.get<any>(`${this.apiUrl}/explorer/directories`);
  }

  listFolderContents(path: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/explorer/list`, {
      params: { path }
    }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Erro desconhecido!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Erro ${error.status}: ${error.message}`;
    }
    return throwError(errorMessage);
  }

  gerarRelatorio(directory: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/report/generate-json`, { directoryName: directory })
      .pipe(catchError(this.handleError));
  }
}
