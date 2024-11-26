import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'teste2';
  selectedDirectory: string = '';
  selectedSubDirectory: string = '';

  updateSelectedDirectories(event: { directory: string; subDirectory: string }) {
    this.selectedDirectory = event.directory;
    this.selectedSubDirectory = event.subDirectory;
  }

}
