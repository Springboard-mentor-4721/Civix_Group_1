import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface CivicReport {
  title: string;
  description: string;
  category: string;
  location: string;
  status: 'OPEN' | 'IN PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  reportedBy: string;
  reportedOn: string;
}

@Component({
  selector: 'app-reports',
  imports: [FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class Reports {

  searchText = '';

  selectedCategory = 'All Categories';

  selectedStatus = 'All Status';

  selectedLocation = 'All Locations';


  categories = [
    'All Categories',
    'Roads',
    'Street Lighting',
    'Waste Management',
    'Water Supply',
    'Public Safety',
    'Environment'
  ];


  statuses = [
    'All Status',
    'OPEN',
    'IN PROGRESS',
    'RESOLVED'
  ];


  locations = [
    'All Locations',
    'Delhi',
    'Mumbai',
    'Nagpur',
    'Pune'
  ];


  reports: CivicReport[] = [

    {
      title: 'Damaged Road Near Main Market',
      description:
        'Large potholes are making this road difficult and unsafe for daily commuters.',
      category: 'Roads',
      location: 'Delhi',
      status: 'IN PROGRESS',
      priority: 'HIGH',
      reportedBy: 'Community Member',
      reportedOn: '28 Aug 2026'
    },

    {
      title: 'Street Light Not Working',
      description:
        'The street light near the residential entrance has not been working for several days.',
      category: 'Street Lighting',
      location: 'Nagpur',
      status: 'OPEN',
      priority: 'MEDIUM',
      reportedBy: 'Community Member',
      reportedOn: '27 Aug 2026'
    },

    {
      title: 'Garbage Collection Delay',
      description:
        'Garbage has not been collected from the area for the last three days.',
      category: 'Waste Management',
      location: 'Mumbai',
      status: 'OPEN',
      priority: 'MEDIUM',
      reportedBy: 'Community Member',
      reportedOn: '26 Aug 2026'
    },

    {
      title: 'Water Leakage on Public Road',
      description:
        'A water pipe appears to be leaking and water is collecting near the roadside.',
      category: 'Water Supply',
      location: 'Pune',
      status: 'RESOLVED',
      priority: 'HIGH',
      reportedBy: 'Community Member',
      reportedOn: '22 Aug 2026'
    },

    {
      title: 'Park Area Needs Cleaning',
      description:
        'The public park requires cleaning and maintenance to make it usable for residents.',
      category: 'Environment',
      location: 'Delhi',
      status: 'RESOLVED',
      priority: 'LOW',
      reportedBy: 'Community Member',
      reportedOn: '20 Aug 2026'
    }

  ];


  get filteredReports(): CivicReport[] {

    const search = this.searchText
      .toLowerCase()
      .trim();


    return this.reports.filter((report) => {

      const matchesSearch =
        !search ||
        report.title
          .toLowerCase()
          .includes(search) ||

        report.description
          .toLowerCase()
          .includes(search) ||

        report.category
          .toLowerCase()
          .includes(search);


      const matchesCategory =
        this.selectedCategory === 'All Categories' ||
        report.category === this.selectedCategory;


      const matchesStatus =
        this.selectedStatus === 'All Status' ||
        report.status === this.selectedStatus;


      const matchesLocation =
        this.selectedLocation === 'All Locations' ||
        report.location === this.selectedLocation;


      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesLocation
      );

    });

  }


  clearFilters(): void {

    this.searchText = '';

    this.selectedCategory =
      'All Categories';

    this.selectedStatus =
      'All Status';

    this.selectedLocation =
      'All Locations';

  }

}
