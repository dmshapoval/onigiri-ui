import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { map } from "rxjs";
import * as A from "fp-ts/es6/Array";
import { Customer, NOT_NAMED } from "@onigiri-models";
import { EditCustomerDialogComponent } from "../edit-customer-dialog/edit-customer-dialog.component";
import isEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";
import { Dialog } from "@angular/cdk/dialog";
import { CustomControlBase } from "@oni-shared";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AutoCompleteModule } from "primeng/autocomplete";
import { CustomersStore } from "@onigiri-store";
import { toObservable } from "@angular/core/rxjs-interop";

interface CustomerSuggestion {
  id: string;
  name: string;
}

@UntilDestroy()
@Component({
  selector: "customer-selector",
  templateUrl: "./customer-selector.component.html",
  styleUrls: ["./customer-selector.component.scss"],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, AutoCompleteModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerSelectorComponent
  extends CustomControlBase<string>
  implements OnInit
{
  #customersStore = inject(CustomersStore);

  // private _store = inject(Store<AppState>);
  private _dialogs = inject(Dialog);
  private _cdr = inject(ChangeDetectorRef);

  private _selectedCustomerId: string | null = null;
  private _allSuggestions: CustomerSuggestion[] = [];
  private _search: string | null = null;

  constructor() {
    super();
    this.#setupSuggestionCalculation();
  }

  filteredSuggestions: CustomerSuggestion[] = [];

  disabled = false;

  get selectedValue() {
    return this._selectedCustomerId
      ? this._allSuggestions.find(x => x.id === this._selectedCustomerId) ||
          null
      : null;
  }

  set selectedValue(v: CustomerSuggestion | null) {
    if (this._selectedCustomerId === v) return;

    this._selectedCustomerId = v?.id || null;
    this.onChange(this._selectedCustomerId);
    this._cdr.markForCheck();
  }

  ngOnInit(): void {}

  override writeValue(value: string | null): void {
    this._selectedCustomerId = value;
    this._cdr.markForCheck();
  }

  override setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this._cdr.markForCheck();
  }

  onCreateNew() {
    const dialogRef = this._dialogs.open<Customer | null>(
      EditCustomerDialogComponent,
      {
        data:
          isNil(this._search) || isEmpty(this._search)
            ? null
            : { name: this._search }
      }
    );

    dialogRef.closed.pipe(untilDestroyed(this)).subscribe(v => {
      if (v) {
        this._selectedCustomerId = v.id;
        this.onChange(v.id);
      }
    });
  }

  onSearch(ev: { originalEvent: Event; query: string }) {
    this._search = ev.query;
    this._recalculateSuggestions();
    this._cdr.markForCheck();
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

  #setupSuggestionCalculation() {
    // TODO refactor to signals
    toObservable(this.#customersStore.customers)
      .pipe(map(A.map(toSuggestion)), untilDestroyed(this))
      .subscribe(suggestions => {
        this._allSuggestions = suggestions;
        this._recalculateSuggestions();
        this._cdr.markForCheck();
      });
  }
}

function toSuggestion(customer: Customer): CustomerSuggestion {
  return {
    id: customer.id,
    name: customer.contactName || NOT_NAMED
  };
}
