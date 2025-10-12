import { Component, computed, input, OnInit } from "@angular/core";

@Component({
  standalone: true,
  imports: [],
  selector: "progress-counter",
  templateUrl: "progress-counter.component.html",
  styleUrl: "progress-counter.component.scss"
})
export class ProgressCounterComponent implements OnInit {
  emptyColor = input<string>("#E6E6E6");
  filledColor = input<string>("#666666");
  maxValue = input(100);
  currentValue = input(0);

  progress = computed(() => {
    const max = this.maxValue();
    const current = this.currentValue();

    return Math.min(current / max, 1) * 100;
  });

  numbersText = computed(() => {
    const max = this.maxValue();
    const current = this.currentValue();

    return `${Math.min(max, current)}/${max}`;
  });

  constructor() {}

  ngOnInit() {}
}
