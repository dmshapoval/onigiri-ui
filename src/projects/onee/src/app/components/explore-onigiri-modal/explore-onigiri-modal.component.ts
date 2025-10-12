import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { OnigiriButtonComponent, OnigiriIconComponent } from '@oni-shared';
import { Carousel, CarouselModule, CarouselPageEvent } from 'primeng/carousel';
import { openOnigiriSignUp } from '../../onigiri-redirects';
import { AccountApiService } from '../../services/account-api.service';

interface FeatureCard {
  img: string;
  title: string;
  description: string;
}

interface Slide {
  left: FeatureCard;
  right: FeatureCard;
}

@Component({
  selector: 'explore-onigiri-modal',
  standalone: true,
  templateUrl: 'explore-onigiri-modal.component.html',
  styleUrl: './explore-onigiri-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CarouselModule, OnigiriIconComponent,
    OnigiriButtonComponent
  ]
})
export class ExploreOnigiriModalComponent implements OnInit {

  #dialogRef = inject(DialogRef);
  #api = inject(AccountApiService);

  @ViewChild(Carousel) carousel: Carousel;


  slides = getSlides();

  canMoveBack = signal<boolean>(false);
  canMoveForward = signal<boolean>(true);

  ngOnInit() { }

  showNextSlide(ev: MouseEvent | TouchEvent) {
    if (!this.canMoveForward) { return; }

    this.carousel.navForward(ev);
  }

  showPrevSlide(ev: MouseEvent | TouchEvent) {
    if (!this.canMoveBack) { return; }

    this.carousel.navBackward(ev);
  }


  onCancel() {
    this.#dialogRef.close();
  }


  onMoveToOnigiri() {
    openOnigiriSignUp();
    this.#dialogRef.close();
  }

  onSlideChanged(ev: CarouselPageEvent) {
    this.canMoveBack.set(ev.page! > 0);
    this.canMoveForward.set(ev.page! < 2);
  }
}

function getSlides(): Slide[] {
  const features = getFeatureCards();

  return [{
    left: features[0],
    right: features[1]
  }, {
    left: features[2],
    right: features[3]
  }, {
    left: features[3],
    right: features[4]
  }]
}

function getFeatureCards(): FeatureCard[] {
  return [{
    img: '#invoicing_img',
    title: 'Invoicing',
    description: 'Easily make, send, and share invoices — get paid faster than ever.'
  }, {
    img: '#clients_img',
    title: 'Clients',
    description: 'Keep track of your clients. Handle all the contacts, invoices, contracts & tasks with ease.'
  }, {
    img: '#projects_img',
    title: 'Project Management',
    description: 'Keep track of all your project work with simple & effective project management.'
  }, {
    img: '#proposals_img',
    title: 'Proposals',
    description: 'Create proposals in minutes with pre-built, customisable templates.'
  }, {
    img: '#clients_portal_img',
    title: 'Client Portal',
    description: 'Keep your clients posted with one click setup portal.'
  }]
}