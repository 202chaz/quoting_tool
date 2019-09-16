import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiRequestService } from './../services/api-request.service';

@Component({
  selector: 'app-employer-details',
  templateUrl: './employer-details.component.html',
  styleUrls: ['./employer-details.component.css'],
  providers: [NgbModal]
})
export class EmployerDetailsComponent implements OnInit {
  public quoteForm: FormGroup;

  constructor(private fb: FormBuilder, private modalService: NgbModal, private api: ApiRequestService) {
    this.quoteForm = this.fb.group({
      effectiveDate: ['', Validators.required],
      sic: ['', Validators.required],
      zip: ['', Validators.required],
      county: [''],
      employees: this.fb.array([])
    });
  }

  ngOnInit() {
    this.addEmployee();
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

  fileUploaded(fileInfo){
    debugger
    this.api.authedPost("/api/v1/employees/upload", {})
    // this.file = fileInfo.files[0]
    // let fileReader = new FileReader();
    // fileReader.onload = (fileData) => {
    //   // let data = fileData.target.result.split("\r\n")
    //   // data.shift()
    //   // data.forEach(ele => {
    //   // })
    // }
    // fileReader.readAsText(this.file);
  }
}
