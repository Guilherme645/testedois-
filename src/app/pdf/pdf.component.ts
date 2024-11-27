import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.css']
})
export class PdfComponent  {

  pdfUrl = 'URL_DO_SEU_PDF.pdf'; // Pode ser um arquivo local ou gerado dinamicamente
}