import { Parameters } from '../model/parameters.model';
import { Field } from './field.model';

export interface JsonData {
  parameters: Parameters;
  fields: { [key: string]: Field };
}
