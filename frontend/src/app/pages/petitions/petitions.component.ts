import { Component } from '@angular/core';

interface Petition {
  title: string;
  category: string;
  location: string;
  status: 'ACTIVE' | 'UNDER REVIEW' | 'CLOSED';
  description: string;
  signatures: number;
  goal: number;
  createdBy: string;
  createdDate: string;
}

@Component({
  selector: 'app-petitions',
  imports: [],
  templateUrl: './petitions.component.html',
  styleUrl: './petitions.component.css'
})
export class Petitions {

  activeTab = 'all';
  searchText = '';
  selectedCategory = 'All Categories';
  selectedLocation = 'All Locations';
  selectedStatus = 'All';

  categories = [
    'All Categories',
    'Infrastructure',
    'Education',
    'Environment',
    'Public Safety',
    'Healthcare',
    'Transportation',
    'Housing'
  ];

  locations = [
    'All Locations',
    'Delhi',
    'Mumbai',
    'Nagpur',
    'Pune'
  ];

  statuses = [
    'All',
    'ACTIVE',
    'UNDER REVIEW',
    'CLOSED'
  ];

  petitions: Petition[] = [
    {
      title: 'Improve Local Road Safety',
      category: 'Infrastructure',
      location: 'Delhi',
      status: 'ACTIVE',
      description: 'Request better lighting, road markings and pedestrian safety measures in our local area.',
      signatures: 68,
      goal: 100,
      createdBy: 'Community Member',
      createdDate: '29 Aug 2026'
    },
    {
      title: 'Create More Green Spaces',
      category: 'Environment',
      location: 'Nagpur',
      status: 'ACTIVE',
      description: 'We request additional trees and public green spaces for residents and children.',
      signatures: 42,
      goal: 100,
      createdBy: 'Community Member',
      createdDate: '28 Aug 2026'
    },
    {
      title: 'Improve Public Street Lighting',
      category: 'Public Safety',
      location: 'Pune',
      status: 'UNDER REVIEW',
      description: 'Better street lighting can improve safety for residents travelling at night.',
      signatures: 91,
      goal: 100,
      createdBy: 'Community Member',
      createdDate: '27 Aug 2026'
    }
  ];

  get filteredPetitions(): Petition[] {
    return this.petitions.filter(petition => {

      const matchesSearch =
        petition.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        petition.description.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesCategory =
        this.selectedCategory === 'All Categories' ||
        petition.category === this.selectedCategory;

      const matchesLocation =
        this.selectedLocation === 'All Locations' ||
        petition.location === this.selectedLocation;

      const matchesStatus =
        this.selectedStatus === 'All' ||
        petition.status === this.selectedStatus;

      return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchText = input.value;
  }

  onCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedCategory = select.value;
  }

  onLocationChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedLocation = select.value;
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus = select.value;
  }

  getProgress(petition: Petition): number {
    return Math.min(
      Math.round((petition.signatures / petition.goal) * 100),
      100
    );
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCategory = 'All Categories';
    this.selectedLocation = 'All Locations';
    this.selectedStatus = 'All';
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }
}