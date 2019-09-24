import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployerDetailsService } from './../services/employer-details.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { NgbDateStruct, NgbCalendar, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import zipcodes from '../../settings/zipcode.json';
import sics from '../../settings/sic.json';

@Component({
  selector: 'app-employer-details',
  templateUrl: './employer-details.component.html',
  styleUrls: ['./employer-details.component.css'],
  providers: [NgbModal, EmployerDetailsService],
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      transition('void <=> *', animate(400)),
    ])
  ]
})
export class EmployerDetailsComponent implements OnInit {
  rows = [];
  model: NgbDateStruct;
  date: {month: number, day: number, year: number};
  sicKeyword = 'standardIndustryCodeCode';
  zipKeyword = 'zipCode';
  sics = sics;
  zipcodes = zipcodes;
  defaultSelect: boolean;
  uploadData: any;
  employee: any;
  employeeIndex: any;
  public counties: any;
  public quoteForm: FormGroup;
  public showEmployeeRoster = false;
  public showHouseholds = true;
  public employeeRoster: any;
  public employees: any;

  relationOptions = [
    {key: 'spouse', value: 'Spouse'},
    {key: 'domestic partner', value: 'Domestic Partner'},
    {key: 'child', value: 'Child'},
    {key: 'disabled child', value: 'Disabled Child'},
  ];

  constructor(private fb: FormBuilder, private modalService: NgbModal, private employerDetailsService: EmployerDetailsService,
    private calendar: NgbCalendar, private config: NgbDatepickerConfig) {

    this.quoteForm = this.fb.group({
      effectiveDate: ['', Validators.required],
      sic: ['', Validators.required],
      zip: ['', Validators.required],
      county: [{value: '', disabled: true}],
      employees: this.fb.array([])
    });

    const year = new Date().getFullYear();

    config.minDate = {year: year - 110, month: 1, day: 1};
    config.maxDate = {year: year + 1, month: 12, day: 31};
  }

  ngOnInit() {
    this.employeeRoster = localStorage.getItem('employerDetails');
    if (this.employeeRoster) {
      this.showEmployeeRoster = true;
      const details = JSON.parse(this.employeeRoster);
      this.quoteForm.get('effectiveDate').setValue(new Date(Date.parse(details.effectiveDate)));
      this.quoteForm.get('sic').setValue(details.sic.standardIndustryCodeCode);
      this.quoteForm.get('zip').setValue(details.zip.zipCode);
      this.loadEmployeesFromStorage();
    }
  }

  addEmployee() {
    const control = <FormArray>this.quoteForm.controls.employees;
    control.push(
      this.fb.group({
        firstName: [''],
        lastName: [''],
        dob: ['', Validators.required],
        coverageKind: [''],
        dependents: this.fb.array([])
      })
    );
  }

  deleteEmployee(index) {
    const control = <FormArray>this.quoteForm.controls.employees;
    control.removeAt(index);
  }

  addDependent(control) {
    control.push(
      this.fb.group({
        firstName: [''],
        lastName: [''],
        dob: ['', Validators.required],
        relationship: [''],
      })
    );
  }

  deleteDependent(control, index) {
    control.removeAt(index);
  }

  onSubmit() {
    console.log(this.quoteForm.value);
  }

  open(content) {
    this.modalService.open(content);
  }

  fileUploaded(fileInfo) {

    const input = new FormData();
    input.append('file', fileInfo.files[0]);
    this.employerDetailsService.postUpload(input)
      .subscribe(
        data => {
          // this.censusDatatable.rows = data['census_records'];
        }
      );
      // Below is used to display in the UI
      const reader = new FileReader();
      const csvData = [];
      this.uploadData = csvData;
      reader.readAsBinaryString(fileInfo.files[0]);
      reader.onload = function () {
       csvData.push(reader.result);
      };
      setTimeout(() => {
        this.parseResults(this.uploadData[0]);
      }, 800);
  }

  zipChangeSearch(event) {
    if (event.length === 5) {
      this.counties = zipcodes.filter(zipcode => zipcode.zipCode === event);
      this.enableCounty();
    }
  }

  selectEvent(item) {
    this.getCounties(item);
  }

  getCounties(item) {
    this.counties = zipcodes.filter(zipcode => zipcode.zipCode === item.zipCode);
    this.enableCounty();
  }

  enableCounty() {
    const countyField = document.getElementById('countyField');
    if (this.counties.length === 1) {
      this.defaultSelect = true;
    }

    if (this.counties.length > 1) {
      countyField.removeAttribute('disabled');
    }
  }

  onChangeSearch(val: string) {
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  saveEmployerDetails(form) {
    localStorage.setItem('employerDetails', form);
  }

  onFocused(e) {
    // do something when input is focused
  }

  parseResults(data) {
    this.modalService.dismissAll();
    const rows = data.split(/\r\n|\n/);
    let count = 0;
    rows.map((row, index) => {
      const control = <FormArray>this.quoteForm.controls.employees;
      // ignore the header row
      if (index > 0) {
        const firstName = row.split(',')[0];
        const lastName = row.split(',')[1];
        const dobValues = row.split(',')[2].split('/');
        const relationship = row.split(',')[3];
        // create employees from csv
        if (relationship === 'employee') {
          this.employee = row;
          count ++;
           control.push(
            this.fb.group({
              firstName: [firstName],
              lastName: [lastName],
              dob: [this.formatDOB(dobValues)],
              coverageKind: ['both'],
              dependents: this.fb.array([])
            })
          );
        } else {
          // Add dependents to employee if dependents
          control['controls'][count - 1]['controls']['dependents'].push(
            this.fb.group({
              firstName: [firstName],
              lastName: [lastName],
              dob: [this.formatDOB(dobValues)],
              relationship: [relationship],
            })
          );
        }
      }
    });
  }

  createRoster() {
    // Adds the uploaded roster to localStorage
    localStorage.setItem('employerDetails', JSON.stringify(this.quoteForm.value));
    this.showHouseholds = false;
    this.ngOnInit();
  }

  resetForm() {
    // Removes the roster from localStorage
    localStorage.removeItem('employerDetails');
    this.showEmployeeRoster = false;
    this.quoteForm.reset();
  }

  loadEmployeesFromStorage() {
    // Loads the roster from localStorage if present
    const roster = JSON.parse(this.employeeRoster);
    this.employees = roster;
    this.rows = roster.employees;
  }

  formatDOB(value) {
    // Formats dob to valid format for datepicker
    return new Date(parseInt(value[2]), parseInt(value[0]), parseInt(value[1]));
  }
}