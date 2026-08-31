import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Official {
  name: string;
  role: string;
  department: string;
  location: string;
  email: string;
  phone: string;
  initials: string;
  status: 'ACTIVE' | 'OFFICE CLOSED';
}

@Component({
  selector: 'app-officials',
  imports: [FormsModule],
  templateUrl: './officials.html',
  styleUrl: './officials.css'
})
export class Officials {

  searchText = '';

  selectedDepartment = 'All Departments';

  selectedLocation = 'All Locations';


  departments = [
    'All Departments',
    'Municipal Corporation',
    'Public Works',
    'Transportation',
    'Education',
    'Health',
    'Environment'
  ];


  locations = [
    'All Locations',
    'Delhi',
    'Mumbai',
    'Nagpur',
    'Pune'
  ];


  officials: Official[] = [

    {
      name: 'Rajesh Kumar',
      role: 'Municipal Commissioner',
      department: 'Municipal Corporation',
      location: 'Delhi',
      email: 'rajesh.kumar@civix.org',
      phone: '+91 98765 43210',
      initials: 'RK',
      status: 'ACTIVE'
    },

    {
      name: 'Anita Sharma',
      role: 'Public Works Officer',
      department: 'Public Works',
      location: 'Nagpur',
      email: 'anita.sharma@civix.org',
      phone: '+91 98765 43211',
      initials: 'AS',
      status: 'ACTIVE'
    },

    {
      name: 'Vikram Singh',
      role: 'Transportation Officer',
      department: 'Transportation',
      location: 'Pune',
      email: 'vikram.singh@civix.org',
      phone: '+91 98765 43212',
      initials: 'VS',
      status: 'ACTIVE'
    },

    {
      name: 'Priya Mehta',
      role: 'Education Officer',
      department: 'Education',
      location: 'Mumbai',
      email: 'priya.mehta@civix.org',
      phone: '+91 98765 43213',
      initials: 'PM',
      status: 'ACTIVE'
    },

    {
      name: 'Amit Deshmukh',
      role: 'Environmental Officer',
      department: 'Environment',
      location: 'Nagpur',
      email: 'amit.deshmukh@civix.org',
      phone: '+91 98765 43214',
      initials: 'AD',
      status: 'ACTIVE'
    },

    {
      name: 'Neha Patel',
      role: 'Public Health Officer',
      department: 'Health',
      location: 'Delhi',
      email: 'neha.patel@civix.org',
      phone: '+91 98765 43215',
      initials: 'NP',
      status: 'ACTIVE'
    }

  ];


  get filteredOfficials(): Official[] {

    const search = this.searchText
      .toLowerCase()
      .trim();


    return this.officials.filter((official) => {

      const matchesSearch =
        !search ||
        official.name
          .toLowerCase()
          .includes(search) ||

        official.role
          .toLowerCase()
          .includes(search) ||

        official.department
          .toLowerCase()
          .includes(search);


      const matchesDepartment =
        this.selectedDepartment === 'All Departments' ||
        official.department === this.selectedDepartment;


      const matchesLocation =
        this.selectedLocation === 'All Locations' ||
        official.location === this.selectedLocation;


      return (
        matchesSearch &&
        matchesDepartment &&
        matchesLocation
      );

    });

  }


  clearFilters(): void {

    this.searchText = '';

    this.selectedDepartment =
      'All Departments';

    this.selectedLocation =
      'All Locations';

  }

}
