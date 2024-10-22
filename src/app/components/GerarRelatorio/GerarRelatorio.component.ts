import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

interface Field {
  name: string;
  type: string;
}

interface Parameters {
  [key: string]: Field;
}

interface JsonData {
  parameters: Parameters;
  fields: { [key: string]: Field };
}

@Component({
  selector: 'app-GerarRelatorio',
  templateUrl: './GerarRelatorio.component.html',
  styleUrls: ['./GerarRelatorio.component.css']
})
export class GerarRelatorioComponent implements OnChanges {
  @Input() jsonData: JsonData | null = null; 
  jsonForm: FormGroup;
  parameterKeys: string[] = []; // Declara a variável parameterKeys

  constructor(private fb: FormBuilder) {
    this.jsonForm = this.fb.group({});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['jsonData'] && this.jsonData) {
      this.parameterKeys = Object.keys(this.jsonData.fields); // Inicializa os parâmetros
      this.generateForm(this.jsonData);
    }
  }

  generateForm(parameters: JsonData) {
    if (!parameters || !parameters.fields) {
      console.warn('Os parâmetros ou campos estão indefinidos.');
      return;
    }

    const formControls: { [key: string]: FormControl } = {}; 

    Object.keys(parameters.fields).forEach(key => {
      const field = parameters.fields[key];
      formControls[key] = new FormControl(null); // Inicializa cada campo com null
    });

    this.jsonForm = this.fb.group(formControls);
  }

  getPlaceholder(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }
}
