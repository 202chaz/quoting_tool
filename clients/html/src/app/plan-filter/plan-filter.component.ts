import { Component, OnInit, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import tooltips from '../../settings/tooltips.json';

@Component({
  selector: 'app-plan-filter',
  templateUrl: './plan-filter.component.html',
  styleUrls: ['./plan-filter.component.css'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      transition('void <=> *', animate(400)),
    ])
  ]
})
export class PlanFilterComponent implements OnInit {
  public tooltips = tooltips;
  public isCollapsed: any;
  public metalLevelOptions: any;
  public carriers: any;
  public products: any;
  public filteredCarriers: any;
  public employerDetails: any;
  public effectiveDate: any;
  public erEmployees: any;
  public costShownText: any;
  public clearAll: boolean;
  selectedMetalLevels = [];
  selectedProductTypes = [];
  selectedInsuranceCompanies = [];
  filterCarriersResults = [];

  public planOptions = [
    {key: 'one_carrier', value: 'One Carrier'},
    {key: 'one_level', value: 'One Level'},
    {key: 'one_plan', value: 'One Plan'}
  ];

  @Input() carrierPlans: any;

  constructor() { }

  ngOnInit() {
    this.metalLevelOptions = this.carrierPlans.map(plan => {
      if (plan['Metal Level']) {
        return plan['Metal Level'];
      } else {
        // Dental uses Coverage level as a key instead of Metal level
        return plan['Coverage Level'];
      }
    })
      .reduce((unique, item) =>
        unique.includes(item) ? unique : [...unique, item], []);

    this.carriers = this.carrierPlans.map(plan => plan['Carrier'])
      .reduce((unique, item) =>
        unique.includes(item) ? unique : [...unique, item], []);

    this.products = this.carrierPlans.map(plan => plan['Product'])
      .reduce((unique, item) =>
        unique.includes(item) ? unique : [...unique, item], []);

    this.filteredCarriers = this.carrierPlans;

    const erDetails = localStorage.getItem('employerDetails');
    this.employerDetails = JSON.parse(erDetails);
    this.erEmployees = this.employerDetails.employees;

    if (this.erEmployees.length > 1) {
      this.costShownText = `${this.erEmployees.length} people`;
    } else {
      this.costShownText = `${this.erEmployees.length} person`;
    }
  }

  selectedFilter(value, event, type) {
    switch (type) {
      case 'metalLevel' :
        if (event.target.checked) {
          this.selectedMetalLevels.push(value);
        } else {
          const index = this.selectedMetalLevels.indexOf(value);
          this.selectedMetalLevels.splice(index, 1);
        }
        break;
      case 'productType' :
        if (event.target.checked) {
          this.selectedProductTypes.push(value);
        } else {
          const index = this.selectedProductTypes.indexOf(value);
          this.selectedProductTypes.splice(index, 1);
        }
        break;
      case 'insuranceCompany' :
        if (event.target.checked) {
          this.selectedInsuranceCompanies.push(value);
        } else {
          const index = this.selectedInsuranceCompanies.indexOf(value);
          this.selectedInsuranceCompanies.splice(index, 1);
        }
        break;
    }
    this.filterCarriers();
  }

  filterCarriers() {
    const tempArray = [];
    this.carrierPlans.map(plan => {
      if (this.selectedMetalLevels) {
        this.selectedMetalLevels.filter(metalLevel => {
          if (plan['Metal Level']) {
            if (metalLevel === plan['Metal Level']) {
              tempArray.push(plan);
            }
          } else {
            // Dental uses Coverage level as a key instead of Metal level
            if (metalLevel === plan['Coverage Level']) {
              tempArray.push(plan);
            }
          }
        });
      }

      if (this.selectedProductTypes) {
        this.selectedProductTypes.filter(product => {
          if (product === plan['Product']) {
            tempArray.push(plan);
          }
        });
      }

      if (this.selectedInsuranceCompanies) {
        this.selectedInsuranceCompanies.filter(carrier => {
          if (carrier === plan['Carrier']) {
            tempArray.push(plan);
          }
        });
      }
    });
    this.filterCarriersResults = tempArray;
  }

  displayResults() {
    this.filteredCarriers = this.filterCarriersResults;
  }

  resetAll() {
    this.clearAll = false;
    this.filteredCarriers = this.carrierPlans;
  }

}
