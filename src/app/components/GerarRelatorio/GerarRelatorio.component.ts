import { Component, OnChanges, Input, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

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
  @Input() jsonData: JsonData | null = null; // Allows jsonData to be null
  jsonForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.jsonForm = this.fb.group({});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['jsonData'] && this.jsonData) {
      this.generateForm(this.jsonData);
    }
  }

  generateForm(parameters: JsonData): void {
    if (!parameters || !parameters.parameters) {
      console.error('Os parâmetros estão indefinidos.');
      return; // Exit function if parameters are not defined
    }

    const paramKeys = Object.keys(parameters.parameters);
    const formControls: { [key: string]: FormControl } = {};

    paramKeys.forEach(key => {
      const field = parameters.parameters[key];

      if (field?.type) {
        if (field.type.toLowerCase().includes('timestamp') || field.type.toLowerCase().includes('date')) {
          formControls[key] = new FormControl(null);
        } else if (field.type.toLowerCase().includes('integer')) {
          formControls[key] = new FormControl('');
        } else {
          formControls[key] = new FormControl('');
        }
      }
    });

    this.jsonForm = this.fb.group(formControls);
  }

  getParameterKeys(parameters: Parameters | undefined): string[] {
    return parameters ? Object.keys(parameters) : [];
  }

  getPlaceholder(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }
}
