import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  @Input() validForm: string;

  navLinks = [
    { path: '/employer-details', name: 'Employer Details' },
    { path: '/employer-details/health', name: 'Health' },
    { path: '/employer-details/dental', name: 'Dental' },
  ];

  constructor() { }

  ngOnInit() { }

  isFormValid(name) {
    if (name === 'Health') {
      return !this.validForm;
    }

    if (name === 'Dental') {
      return !this.validForm;
    }
  }

}