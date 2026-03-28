import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from "./shared/navigation/navigation.component";

/**
 * Root application component
 * Provides the main application shell with navigation and router outlet
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

  constructor() {
    console.log('AppComponent initialized - Application root loaded');
    console.log('Application title:', this.title);
  }
}
