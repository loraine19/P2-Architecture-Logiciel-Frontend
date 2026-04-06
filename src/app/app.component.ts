import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from "./shared/navigation/navigation.component";

/**
 * Component - Root application shell
 * Renders the navigation bar and the router outlet for all page components
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    RouterOutlet,
    NavigationComponent
  ],
  styleUrl: './app.component.css'
})
export class AppComponent {
  /** Application title for identification */
  title = 'etudiant-frontend';

  /** LIFECYCLE */
  /* APP COMPONENT */
  constructor() {
    console.log('AppComponent initialized - Application root loaded');
    console.log('Application title:', this.title);
  }
}
