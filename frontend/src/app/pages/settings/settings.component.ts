import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class Settings {

  fullName = 'Civix User';

  email = 'user@civix.org';

  phone = '';

  city = 'Delhi';

  state = 'Delhi';

  emailNotifications = true;

  pollNotifications = true;

  petitionNotifications = true;

  reportNotifications = true;

  privateAccount = false;


  saveChanges(): void {
    alert('Settings saved successfully.');
  }


  resetChanges(): void {
    this.fullName = 'Civix User';
    this.email = 'user@civix.org';
    this.phone = '';
    this.city = 'Delhi';
    this.state = 'Delhi';

    this.emailNotifications = true;
    this.pollNotifications = true;
    this.petitionNotifications = true;
    this.reportNotifications = true;

    this.privateAccount = false;
  }

}