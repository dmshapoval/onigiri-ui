import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import * as A from "fp-ts/es6/Array";
import {
  CustomServiceInvoiceItem,
  InvoiceItem,
  NOT_NAMED,
  PredefinedServiceInvoiceItem,
  Service,
  ServiceListItem
} from "@onigiri-models";
import isNil from "lodash/isNil";
import isEmpty from "lodash/isEmpty";

import { AutoCompleteModule } from "primeng/autocomplete";
import { Subject, debounceTime, map, distinctUntilChanged, filter } from "rxjs";
import * as Eq from "fp-ts/es6/Eq";
import { Dialog } from "@angular/cdk/dialog";
import { FormsModule } from "@angular/forms";
import { ServiceSelectorAutocompleteDirective } from "./service-selector-autocomplete.directive";
import { EditServiceDialogComponent } from "../../../../services/edit-service-dialog/edit-service-dialog.component";
import { exhaustiveCheck, withNullCheck, CustomControlBase } from "@oni-shared";
import { ServicesStore } from "@onigiri-store";
import { toObservable } from "@angular/core/rxjs-interop";

interface ItemSuggestion {
  id: string;
  name: string;
}

type InvoiceItemType = InvoiceItem["type"];

@UntilDestroy()
@Component({
  selector: "invoice-item-input",
  standalone: true,
  templateUrl: "./invoice-item-input.component.html",
  styleUrls: ["./invoice-item-input.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AutoCompleteModule,
    EditServiceDialogComponent,
    ServiceSelectorAutocompleteDirective
  ]
})
export class InvoiceItemInputComponent
  extends CustomControlBase<InvoiceItem>
  implements OnInit
{
  #servicesStore = inject(ServicesStore);
  private _dialogs = inject(Dialog);
  private _cdr = inject(ChangeDetectorRef);

  private _itemType: InvoiceItemType | null = null;
  private _predefinedServiceId: string | null = null;
  private _customService: string | null = null;

  private _allSuggestions: ItemSuggestion[] = [];
  private _search: string | null = null;

  private _initValue: InvoiceItem | null = null;
  private _changes$ = new Subject<void>();

  filteredSuggestions: ItemSuggestion[] = [];

  disabled = false;

  get selectedValue() {
    if (!this._itemType) {
      return null;
    }

    switch (this._itemType) {
      case "custom": {
        return this._customService;
      }
      case "predefined": {
        return (
          this._allSuggestions.find(x => x.id === this._predefinedServiceId) ||
          null
        );
      }
      default: {
        exhaustiveCheck(this._itemType);
        return null;
      }
    }
  }

  set selectedValue(v: string | ItemSuggestion | null) {
    //console.log('Selected', v);

    if (!v) {
      this._itemType = null;
      this._predefinedServiceId = null;
      this._customService = null;
      this._changes$.next();
    } else if (typeof v === "string") {
      this._itemType = "custom";
      this._customService = v;
    } else {
      this._itemType = "predefined";
      this._predefinedServiceId = v.id;
      this._changes$.next();
    }
  }

  constructor() {
    super();
    this.#setupSuggestionsCalculation();
  }

  ngOnInit(): void {
    this._changes$
      .pipe(
        debounceTime(200),
        map(() => this._buildInvoiceItem()),
        filter(v => !withNullCheck(comparer).equals(v, this._initValue)),
        distinctUntilChanged(withNullCheck(comparer).equals),
        untilDestroyed(this)
      )
      .subscribe(v => {
        //console.log('Invoice item Changed');
        this._initValue = v;
        this.onChange(v);
      });
  }

  override writeValue(value: InvoiceItem | null): void {
    this._initValue = value;

    if (value) {
      switch (value.type) {
        case "custom": {
          this._itemType = "custom";
          this._customService = value.value;
          break;
        }
        case "predefined": {
          this._itemType = "predefined";
          this._predefinedServiceId = value.serviceId;
          break;
        }
        default: {
          exhaustiveCheck(value);
          break;
        }
      }
    } else {
      this._itemType = null;
      this._predefinedServiceId = null;
      this._customService = null;
    }

    this._cdr.markForCheck();
  }

  override setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this._cdr.markForCheck();
  }

  onCreateNew() {
    const dialogRef = this._dialogs.open<Service | null>(
      EditServiceDialogComponent,
      {
        data:
          isNil(this._search) || isEmpty(this._search)
            ? null
            : { name: this._search }
      }
    );

    dialogRef.closed.pipe(untilDestroyed(this)).subscribe(v => {
      if (v) {
        this._itemType = "predefined";
        this._predefinedServiceId = v.id;
        this._changes$.next();
      }
    });
  }

  onSearch(ev: { originalEvent: Event; query: string }) {
    this._search = ev.query;
    this._recalculateSuggestions();
    this._cdr.markForCheck();
  }

  onBlur() {
    this._changes$.next();
  }

  private _recalculateSuggestions() {
    const search = this._search?.trim().toLowerCase() || null;

    if (isNil(search) || isEmpty(search)) {
      this.filteredSuggestions = [...this._allSuggestions];
      return;
    }

    this.filteredSuggestions = this._allSuggestions.filter(
      x => x.name.toLowerCase().indexOf(search) >= 0
    );
  }

  private _buildInvoiceItem(): InvoiceItem | null {
    if (!this._itemType) {
      return null;
    }

    switch (this._itemType) {
      case "custom": {
        return {
          type: "custom",
          value: this._customService!
        };
      }
      case "predefined": {
        return {
          type: "predefined",
          serviceId: this._predefinedServiceId!
        };
      }
      default: {
        exhaustiveCheck(this._itemType);
        return null;
      }
    }
  }

  #setupSuggestionsCalculation() {
    // TODO refactor to signals
    toObservable(this.#servicesStore.services)
      .pipe(map(A.map(toSuggestion)), untilDestroyed(this))
      .subscribe(suggestions => {
        this._allSuggestions = suggestions;
        this._recalculateSuggestions();
        this._cdr.markForCheck();
      });
  }
}

function toSuggestion(service: ServiceListItem): ItemSuggestion {
  return {
    id: service.id,
    name: service.name || NOT_NAMED
  };
}

const predefinedServiceComparer = Eq.struct<PredefinedServiceInvoiceItem>({
  serviceId: Eq.eqStrict,
  type: Eq.eqStrict
});

const customServiceComparer = Eq.struct<CustomServiceInvoiceItem>({
  type: Eq.eqStrict,
  value: Eq.eqStrict
});

const comparer: Eq.Eq<InvoiceItem> = {
  equals(x, y) {
    if (x.type !== y.type) return false;

    switch (x.type) {
      case "custom": {
        return customServiceComparer.equals(x, <CustomServiceInvoiceItem>y);
      }
      case "predefined": {
        return predefinedServiceComparer.equals(
          x,
          <PredefinedServiceInvoiceItem>y
        );
      }
      default: {
        exhaustiveCheck(x);
        return false;
      }
    }
  }
};

// private _handleValueChanged() {
//   let result: InvoiceItem | null = null;

//   if (this._itemType) {
//     switch (this._itemType) {
//       case 'custom': {
//         result = {
//           type: 'custom',
//           value: this._customService!
//         };
//         break
//       }
//       case 'predefined': {
//         result = {
//           type: 'predefined',
//           serviceId: this._predefinedServiceId!
//         };
//         break;
//       }
//       default: {
//         exhaustiveCheck(this._itemType);
//         break;
//       }
//     }
//   }

//   this._changes$.next(result)
// }
