import { ChangeDetectionStrategy, Component, computed, inject, input, Input, OnInit } from '@angular/core';
import { ProjectInfo, SAMPLE_PROJECT_CUSTOMER_NAME } from '@onigiri-models';
import { SampleProjectChipComponent } from '../../../project-edit-page/components/sample-project-chip.component';
import { CustomersStore } from '@onigiri-store';

@Component({
  selector: 'project-card',
  standalone: true,
  templateUrl: 'project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SampleProjectChipComponent
  ]
})
export class ProjectCardComponent implements OnInit {
  // @Input() data: ProjectInfo;

  #customers = inject(CustomersStore);
  data = input.required<ProjectInfo>();

  customerName = computed(() => {
    const data = this.data();
    const isSample = data.isSample;
    const customers = this.#customers.customers();
    const customeId = data.customerId;

    if (isSample) {
      return SAMPLE_PROJECT_CUSTOMER_NAME;
    }

    const customer = customers.find(x => x.id === customeId);

    return customer ? customer.companyName || customer.contactName : null;
  });

  // get customerName() {
  //   if (this.data?.customer?.name) {
  //     return this.data.customer.name;
  //   }

  //   if (this.data.isSample) {
  //     return SAMPLE_PROJECT_CUSTOMER_NAME;
  //   }

  //   return null;
  // }

  constructor() { }

  ngOnInit() { }
}