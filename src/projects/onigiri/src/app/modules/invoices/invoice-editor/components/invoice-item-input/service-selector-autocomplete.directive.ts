import { Directive, inject } from '@angular/core';
import { AutoComplete } from 'primeng/autocomplete';
import { ItemSuggestion } from './models';


@Directive({
  selector: '[serviceSelectorAutocomplete]',
  standalone: true
})
export class ServiceSelectorAutocompleteDirective {
  constructor() {
    // const baseResolver = this._cmp.resolveFieldData.bind(this._cmp);

    // Due to specific nature of value for autocomplete in this case we 
    // need to override string value resolve 
    this._cmp.getOptionLabel = function (value: null | string | ItemSuggestion) {

      if (!value) { return '' }
      if (typeof value === 'string') { return value; }

      return value.name;
    }

  }

  private _cmp = inject(AutoComplete);
}

// @Directive({
//   selector: '[serviceSelectorAutocomplete]',
//   standalone: true
// })
// export class ServiceSelectorAutocompleteDirective {
//   constructor() {
//     // const baseResolver = this._cmp.resolveFieldData.bind(this._cmp);

//     // Due to specific nature of value for autocomplete in this case we
//     // need to override string value resolve
//     // this._cmp.resolveFieldData = function (value: null | string | ItemSuggestion) {

//     //   if (!value) { return '' }
//     //   if (typeof value === 'string') { return value; }

//     //   return value.name;
//     // }

//     this._cmp.getOptionLabel = function (value: null | string | ItemSuggestion) {

//       if (!value) { return '' }
//       if (typeof value === 'string') { return value; }

//       return value.name;
//     }

//   }

//   private _cmp = inject(AutoComplete);
// }