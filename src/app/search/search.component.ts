import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Data } from '@angular/router';
// import { SearchService } from 'src/app/services/search.service'; 
import { MatTableDataSource } from '@angular/material/table';
import { Sort, MatSort } from '@angular/material/sort'

// import { FilterModel } from '../../shared/filter/filter.component';
// import { GetDataTypeOfColumn } from '../../utils/utils';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, AfterViewInit {

  public providerForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  isDate: boolean = false;
  alreadyAddedSearch: boolean = false;
  providerControl: any;
  providerDateControl: any;
  duplicateValues: any[] = [];

  /* New variables*/
  title = 'Mat-Table-Infinite-Scroll';
  dataSource!: MatTableDataSource<Element>;
  @ViewChild(MatSort)
  sort!: MatSort;
  displayedColumns: string[] = ["providerId", "palId",
    "name",
    "billPfinName", "attestationDate"];
  //displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];

  throttle = 10;
  scrollDistance = 1;
  scrollUpDistance = 2;
  direction = "";
  max = 180;
  current = 12;
  rowDataAgGrid!: Element[];
  masterData: Element[] = [];
  filteredData: Element[] = [];
  appliedFIlters = [];
  resetObj = { isReset: false };
  firstNameAdded : boolean = false; //make these empty on radio change  // First name code
  lastNameAdded : boolean = false; //make these empty on radio change   // First name code

  public validationMsgs = {
    'inputField': [{ type: 'input', message: 'Field Cannot be null' }]
  }


  constructor(private formBuilder: FormBuilder) {
    this.getData();
  }

  ngOnInit(): void {
    this.providerForm = this.formBuilder.group({
      providerFields: this.formBuilder.array([this.createProviderFormGroup()])
      //providerSearch: new FormControl('', Validators.required)  
    });
    this.providerControl = (this.providerForm.get('providerFields') as FormArray).controls;
    // this.providerDateControl = x.controls.providerValue as FormGroup;
  }

  providerFieldsDropDown: any = [{ dropDown: 'PROV ID', value: 'provId' },
  { dropDown: 'PFIN', value: 'pfin' }, { dropDown: 'Bill PFIN', value: 'billPfin' },
  { dropDown: 'Bill PFIN Name', value: 'billPfinName' }, { dropDown: 'NPI', value: 'npi' },
  { dropDown: 'Tax ID', value: 'taxId' }, { dropDown: 'PAL ID', value: 'palId' },
  { dropDown: 'First Name', value: 'firstName' }, { dropDown: 'Last Name', value: 'lastName' },
  { dropDown: 'Override Name', value: 'overrideName' }, { dropDown: 'Specialty', value: 'specialty' },
  { dropDown: 'License Number', value: 'licenseNumber' }, { dropDown: 'Corporate Entity Code', value: 'corporateEntityCode' },
  { dropDown: 'Address Line1', value: 'addressLine1' }, { dropDown: 'Address Line2', value: 'addressLine2' },
  { dropDown: 'Street', value: 'street' }, { dropDown: 'City', value: 'city' },
  { dropDown: 'State', value: 'state' }, { dropDown: 'County', value: 'county' },
  { dropDown: 'Country', value: 'country' }, { dropDown: 'ZIP', value: 'zip' },
  { dropDown: 'Phone', value: 'phone' }, { dropDown: 'URL', value: 'url' },
  { dropDown: 'Attestation Date', value: 'attestationDate' }];

  private createProviderFormGroup(): FormGroup {
    return new FormGroup({
      'providerField': new FormControl(''),
      'providerValue': new FormControl('', Validators.required),
      // 'dateV': new FormGroup({
      //   fromDate: new FormControl('', Validators.required),
      //   toDate: new FormControl('', Validators.required)
      // })
    })
  }

  dis() {
    console.log(this.providerForm, this.providerForm.invalid);
    return true;
  }

  public addProviderFormGroup() {
    const providerFields = this.providerForm.get('providerFields') as FormArray
    providerFields.push(this.createProviderFormGroup())
  }

  public removeField(i: number) {
    const providerFields = this.providerForm.get('providerFields') as FormArray
    if (providerFields.length > 1) {
      const deletedElement = providerFields.at(i).value.providerField;
      var firstIndex = this.duplicateValues.findIndex(e => e == deletedElement);
      this.duplicateValues.splice(firstIndex, 1);
      debugger;
      //first name code
      // if(deletedElement == 'firstName' || deletedElement == 'lastName'){  //  || element.providerField == 'billPfinFirstName' || element.providerField == 'billPfinLastName') // add this
      //   this.providerForm.value.providerFields.forEach( (element: { providerField: any; providerValue: any, dateV: any } )=> {
        
      //   });
      // }
      if(deletedElement == 'firstName') {//  || deletedElement == 'billPfinFirstName') // add this
      
        this.firstNameAdded = false;
      } else if(deletedElement == 'lastName'){ //  || deletedElement == 'billPfinLastName') // add this
        this.lastNameAdded = false;
      }// First name code
      providerFields.removeAt(i);
    } else {
      providerFields.reset();
      this.firstNameAdded = false;
      this.lastNameAdded = false;
    }
  }

  submit() {
    this.submitted = true;
    console.log(this.providerForm.value.providerFields);
    debugger;
    const body: ProviderJson = {
      'provId': 0,
      'pfin': 0,
      'billPfin': 0,
      'billPfinName': '',
      'npi': 0,
      'taxId': 0,
      'palId': 0,
      'firstName': '',
      'lastName': '',
      'overrideName': '',
      'specialty': '',
      'licenseNumber': '',
      'corporateEntityCode': '',
      'addressLine1': '',
      'addressLine2': '',
      'street': '',
      'city': '',
      'state': '',
      'county': '',
      'country': '',
      'zip': '',
      'phone': '',
      'url': '',
      'attestationDateFrom': null,
      'attestationDateTo': null

    }

    this.providerForm.value.providerFields.forEach((element: { providerField: any; providerValue: any, dateV: any }) => {

      // First name code
      if(element.providerField == 'firstName') {//  || element.providerField == 'billPfinFirstName') // add this
      
        this.firstNameAdded = true;
      } else if(element.providerField == 'lastName'){ //  || element.providerField == 'billPfinLastName') // add this
        this.lastNameAdded = true;
      }// First name code
        Object.keys(body).forEach(jsonElement => {
        if (jsonElement == element.providerField) {
          body[jsonElement] = element.providerValue;
        }
        else if (element.providerField === 'attestationDate') {
          body['attestationDateFrom'] = this.formatDate(element.dateV.fromDate);
          body['attestationDateTo'] =this.formatDate(element.dateV.toDate);
        }
      })
    });
    console.log('body', body);
    // First name code
    if(this.lastNameAdded != this.firstNameAdded){
      return;
    }
    // this.searchData.getSearchResults(body).subscribe(result =>{

    // })
  }

  formatDate(date: string) {
    let val = new Date(date);
    return (val.getMonth() + 1) + '/' + val.getDate() + '/' + val.getFullYear();
  }

  onSelect(e: any) {

    
    
    // First name code
    this.lastNameAdded = false;
    this.firstNameAdded = false;

    let counterForControls = 0;
    this.providerControl.forEach((x: FormGroup) => {
      // First name code
    debugger;
    if(x.controls.providerField.value == 'firstName') {//  || x.controls.providerField.value == 'billPfinFirstName') // add this
      
      this.firstNameAdded = true;
    } else if(x.controls.providerField.value == 'lastName'){ //  || x.controls.providerField.value == 'billPfinLastName') // add this
      this.lastNameAdded = true;
    }
      if (x.controls.providerField.value === e.value) {
        if (counterForControls > 0) {
          this.alreadyAddedSearch = true;
          this.duplicateValues.push(e.value);
        }
        else {
          //x.controls.providerValue.reset();
          // x.controls.providerValue = new FormControl('', Validators.required);
          this.isDate = false;
          x.removeControl('dateV');
          // x.controls.dateV.removeValidators([Validators.required]);
          // x.controls.dateV.updateValueAndValidity();
          x.controls.providerValue.setValidators([Validators.required]);
          x.controls.providerValue.updateValueAndValidity();
          this.alreadyAddedSearch = false;
          if (x.controls.providerField.value === 'provId' || x.controls.providerField.value === 'pfin' ||
            x.controls.providerField.value === 'billPfin') {
            x.controls.providerValue.setValidators([Validators.required, Validators.pattern('[0-9]+')]);
          }
          else if (x.controls.providerField.value === 'attestationDate') {
            this.isDate = true;
            x.addControl('dateV', new FormGroup({
              fromDate: new FormControl('', Validators.required),
              toDate: new FormControl('', Validators.required)
            }))
            x.controls.providerValue.clearValidators();
            // x.controls.dateV.setValidators([Validators.required]);
            x.controls.providerValue.updateValueAndValidity();
            //  Object.keys(x.controls.dateV).forEach(control => {
            //    control.setValidators([Validators.required]);
            //   });
            this.providerDateControl = x.controls.dateV as FormGroup;
          }
          counterForControls++;
        }
      }
      //this.isDuplicateField();
    })

    console.log(this.providerForm);
  }

  checkDateControl(e: FormGroup) {
    if (e.controls.providerField.value === 'attestationDate') {
      return true;
    }
    else {
      // e.controls.providerValue=new FormControl('',Vali);
      return false;
    }
  }

  isDuplicateField() {
    if (this.duplicateValues.length > 0 && this.alreadyAddedSearch) {
      return true;
    }
    return false;
  }

  /*Infinite scroll starts */
  ngAfterViewInit() {
    this.dataSource = this.dataSource = new MatTableDataSource(this.filteredData);
    this.dataSource.sort = this.sort;
    this.getSubData(this.current);
  }

  getData() {
    this.masterData = ELEMENT_DATA;
    this.filteredData = ELEMENT_DATA;
    this.getSubData(this.current);
  }

  getSubData(index: number) {
    this.dataSource = new MatTableDataSource(this.filteredData.slice(0, index));
    this.dataSource.sort = this.sort;
  }

  onScrollDown() {
    if (this.current < this.max) {
      this.current += 5
      this.getSubData(this.current);
    }
    else {
      console.log("No more data to show");
    }

  }

  getType(column: string) {
    // return GetDataTypeOfColumn(column);
    return 'true';
  }

  resetAll() {
    this.resetObj.isReset = true;
  }

  filterData(event: any) {
    console.log(event);
    this.current = 12;
    this.filteredData = this.masterData;
    this.getSubData(this.masterData.length);
    // if (this.resetObj.isReset) {
    //   this.appliedFIlters = [];
    //   this.resetObj.isReset = false;
    // }
    // else {
    //   if (this.appliedFIlters.length > 0) {

    //     this.appliedFIlters.forEach((filter, index) => {
    //       if (filter.columnName === event.columnName) {
    //         this.appliedFIlters[index] = event;
    //       }
    //       else {
    //         this.appliedFIlters.push(event);
    //       }
    //     })
    //   }
    //   else {
    //     this.appliedFIlters.push(event);
    //   }

    //   for (let i = 0; i < this.appliedFIlters.length; i++) {
    //     this.displayedColumns.forEach(q => {
    //       if (q === this.appliedFIlters[i].columnName && this.appliedFIlters[i].filterValue) {
    //         let filterOpt = this.appliedFIlters[i].filterOpt;
    //         let filterType = this.appliedFIlters[i].columnDataType;
    //         let fromFilter = this.appliedFIlters[i].filterValue;
    //         let toFilter = this.appliedFIlters[i].filterValueTo;
    //         console.log(filterType);
    //         let formatDate = function (date: string) {
    //           let val = new Date(date);
    //           return val.getMonth() + '/' + val.getDate() + '/' + val.getFullYear();
    //         }
    //         this.dataSource.filterPredicate = function (data, filter: string): boolean {
    //           let result = false;
    //           if (filterOpt === FILTER_Criteria.CONTAINS) {
    //             result = data[q].toString().toLowerCase().includes(filter);
    //           }
    //           else if (filterOpt === FILTER_Criteria.NOT_CONTAINS) {
    //             result = !data[q].toString().toLowerCase().includes(filter);
    //           }
    //           else if (filterOpt === FILTER_Criteria.STARTS_WITH) {
    //             result = data[q].toString().toLowerCase().startsWith(filter);
    //           }
    //           else if (filterOpt === FILTER_Criteria.ENDS_WITH) {
    //             result = data[q].toString().toLowerCase().endsWith(filter);
    //           }
    //           else if (filterOpt === FILTER_Criteria.EQUALS) {
    //             result = q === 'attestationDate' ? formatDate(data[q]) === formatDate(filter) : data[q].toString().toLowerCase() == (filter);
    //           }
    //           else if (filterOpt === FILTER_Criteria.NOT_EQUAL) {
    //             result = q === 'attestationDate' ? formatDate(data[q]) != formatDate(filter) : data[q].toString().toLowerCase() != (filter);
    //           }
    //           else if (filterOpt === FILTER_Criteria.GREATER) {
    //             result = q === 'attestationDate' ? new Date(formatDate(data[q])) > new Date(formatDate(filter)) : data[q] > (filter);
    //           }
    //           else if (filterOpt === FILTER_Criteria.GREATER_EQ) {
    //             result = q === 'attestationDate' ? new Date(formatDate(data[q])) >= new Date(formatDate(filter)) : data[q] >= (filter);
    //           }
    //           else if (filterOpt === FILTER_Criteria.LESSER) {
    //             result = q === 'attestationDate' ? new Date(formatDate(data[q])) < new Date(formatDate(filter)) : data[q] < (filter);
    //           }
    //           else if (filterOpt === FILTER_Criteria.LESSER_EQ) {
    //             result = q === 'attestationDate' ? new Date(formatDate(data[q])) <= new Date(formatDate(filter)) : data[q] <= (filter);
    //           }
    //           else if (filterOpt === FILTER_Criteria.IN_RANGE) {
    //             result = q === 'attestationDate' ? (new Date(formatDate(data[q])) >= new Date(formatDate(fromFilter)) &&
    //               new Date(formatDate(data[q])) <= new Date(formatDate(toFilter))) : (data[q] >= (fromFilter)) && (data[q] <= (toFilter));
    //           }
    //           return result;
    //         }
    //         let filterValue = this.appliedFIlters[i].filterValue.trim();
    //         filterValue = filterValue.toLowerCase();
    //         this.dataSource.filter = filterValue;
    //         this.filteredData = this.dataSource.filteredData;
    //         this.getSubData(this.current);
    //         console.log(this.dataSource.filteredData);
    //       }
    //     });
    //   };
    // }

  }

}

interface IObjectKeys {
  [key: string]: string | number | any;
}

export interface ProviderJson extends IObjectKeys {
  provId: number;
  pfin: number;
  billPfin: number;
  billPfinName: string;
  npi: number,
  taxId: number,
  palId: number,
  firstName: string,
  lastName: string,
  overrideName: string,
  specialty: string,
  licenseNumber: string,
  corporateEntityCode: string,
  addressLine1: string,
  addressLine2: string,
  street: string,
  city: string,
  state: string,
  county: string,
  country: string,
  zip: string,
  phone: string,
  url: string,
  attestationDateFrom: any
  attestationDateTo: any
}

interface Element extends IObjectKeys {
  providerId: number;
  palId: number;
  name: string;
  billPfinName: string;
  attestationDate: string;
}

export const FILTER_Criteria = {
  CONTAINS: 'Contains',
  NOT_CONTAINS: 'Not contains',
  EQUALS: 'Equals',
  NOT_EQUAL: 'Not equal',
  STARTS_WITH: 'Starts with',
  ENDS_WITH: 'Ends with',
  GREATER: 'Greater than',
  GREATER_EQ: 'Greater than or equals',
  LESSER: 'Less than',
  LESSER_EQ: 'Less than or equals',
  IN_RANGE: 'In range'
};



const ELEMENT_DATA: Element[] = [
  {
    "providerId": 1,
    "billPfinName": "bPfinName1",
    "name": "nameVal0",
    "palId": 11,
    "attestationDate": "04/05/2020"
  },
  {
    "providerId": 2,
    "billPfinName": "bPfinName2",
    "name": "nameVal1",
    "palId": 12,
    "attestationDate": "14/05/2020"
  },
  {
    "providerId": 3,
    "billPfinName": "3bPfinName",
    "name": "name3Val",
    "palId": 33,
    "attestationDate": "02/05/2018"
  },
  {
    "providerId": 4,
    "billPfinName": "bPfinName3",
    "name": "nameVa4l",
    "palId": 14,
    "attestationDate": "04/05/2017"
  },
  {
    "providerId": 1,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 101,
    "attestationDate": "04/03/2020"
  },
  {
    "providerId": 2,
    "billPfinName": "bPf1inName",
    "name": "nameVal",
    "palId": 22,
    "attestationDate": "24/05/2018"
  },
  {
    "providerId": 3,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 33,
    "attestationDate": "06/08/2019"
  },
  {
    "providerId": 14,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 44,
    "attestationDate": "04/02/2019"
  },
  {
    "providerId": 1,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 11,
    "attestationDate": "04/05/2019"
  },
  {
    "providerId": 29,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 22,
    "attestationDate": "04/01/2020"
  },
  {
    "providerId": 30,
    "billPfinName": "bPf2inName",
    "name": "name9Val",
    "palId": 93,
    "attestationDate": "19/05/2020"
  },
  {
    "providerId": 4,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 44,
    "attestationDate": "09/12/2018"
  },
  {
    "providerId": 1,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 11,
    "attestationDate": "04/12/2020"
  },
  {
    "providerId": 2,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 22,
    "attestationDate": "19/05/2020"
  },
  {
    "providerId": 3,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 33,
    "attestationDate": "08/10/2017"
  },
  {
    "providerId": 4,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 44,
    "attestationDate": "04/05/2020"
  },
  {
    "providerId": 1,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 11,
    "attestationDate": "07/10/2018"
  },
  {
    "providerId": 72,
    "billPfinName": "b2PfinName",
    "name": "nameV2al",
    "palId": 822,
    "attestationDate": "01/01/2019"
  },
  {
    "providerId": 12,
    "billPfinName": "1bPfinName",
    "name": "nameVal1",
    "palId": 22,
    "attestationDate": "04/05/2020"
  },
  {
    "providerId": 2,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 22,
    "attestationDate": "04/11/2019"
  },
  {
    "providerId": 2,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 22,
    "attestationDate": "30/12/2017"
  },
  {
    "providerId": 2,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 22,
    "attestationDate": "04/05/2019"
  },
  {
    "providerId": 1,
    "billPfinName": "bPfinName1",
    "name": "nameVal0",
    "palId": 11,
    "attestationDate": "04/05/2020"
  },
  {
    "providerId": 2,
    "billPfinName": "bPfinName2",
    "name": "nameVal1",
    "palId": 12,
    "attestationDate": "14/05/2020"
  },
  {
    "providerId": 3,
    "billPfinName": "3bPfinName",
    "name": "name3Val",
    "palId": 33,
    "attestationDate": "02/05/2018"
  },
  {
    "providerId": 4,
    "billPfinName": "bPfinName3",
    "name": "nameVa4l",
    "palId": 14,
    "attestationDate": "04/05/2017"
  },
  {
    "providerId": 1,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 101,
    "attestationDate": "04/03/2020"
  },
  {
    "providerId": 2,
    "billPfinName": "bPf1inName",
    "name": "nameVal",
    "palId": 22,
    "attestationDate": "24/05/2018"
  },
  {
    "providerId": 3,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 33,
    "attestationDate": "06/08/2019"
  },
  {
    "providerId": 14,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 44,
    "attestationDate": "04/02/2019"
  },
  {
    "providerId": 1,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 11,
    "attestationDate": "04/05/2019"
  },
  {
    "providerId": 29,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 22,
    "attestationDate": "04/01/2020"
  },
  {
    "providerId": 30,
    "billPfinName": "bPf2inName",
    "name": "name9Val",
    "palId": 93,
    "attestationDate": "19/05/2020"
  },
  {
    "providerId": 4,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 44,
    "attestationDate": "09/12/2018"
  },
  {
    "providerId": 1,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 11,
    "attestationDate": "04/12/2020"
  },
  {
    "providerId": 2,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 22,
    "attestationDate": "19/05/2020"
  },
  {
    "providerId": 3,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 33,
    "attestationDate": "08/10/2017"
  },
  {
    "providerId": 4,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 44,
    "attestationDate": "04/05/2020"
  },
  {
    "providerId": 1,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 11,
    "attestationDate": "07/10/2018"
  },
  {
    "providerId": 72,
    "billPfinName": "b2PfinName",
    "name": "nameV2al",
    "palId": 822,
    "attestationDate": "01/01/2019"
  },
  {
    "providerId": 12,
    "billPfinName": "1bPfinName",
    "name": "nameVal1",
    "palId": 22,
    "attestationDate": "04/05/2020"
  },
  {
    "providerId": 2,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 22,
    "attestationDate": "04/11/2019"
  },
  {
    "providerId": 2,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 22,
    "attestationDate": "30/12/2017"
  },
  {
    "providerId": 2,
    "billPfinName": "bPfinName",
    "name": "nameVal",
    "palId": 22,
    "attestationDate": "04/05/2019"
  }
];
