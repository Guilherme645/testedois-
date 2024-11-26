import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DirectoryService {
  // Subject para transmitir dados do diretório selecionado
  private directorySelectedSource = new Subject<{ directory: string; subDirectory: string }>();

  // Observable para permitir que outros componentes ouçam os dados
  directorySelected$ = this.directorySelectedSource.asObservable();

  // Método para emitir o diretório selecionado
  emitDirectorySelected(directory: { directory: string; subDirectory: string }) {
    this.directorySelectedSource.next(directory);
  }
}
