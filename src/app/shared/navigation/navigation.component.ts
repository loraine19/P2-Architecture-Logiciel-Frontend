import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { UserDTO } from '../../core/models/User';
import { Observable, map } from 'rxjs';

import { MaterialModule } from '../material.module';

/**
 * Main navigation component for the application
 * Provides responsive navigation menu with authentication-aware content
 */
@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive, MaterialModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['../../pages/pages.css', './navigation.css']
})
export class NavigationComponent {
  isMenuOpen = false;

  constructor(public userService: UserService) { }

  public userFirstName(): string {
    const user: UserDTO | null = this.userService.getCurrentUser();
    return user ? user.firstName : 'Student Management';
  }

  /**
   * Toggles the mobile menu state
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /**
   * Closes the mobile menu
   */
  closeMenu(): void {
    this.isMenuOpen = false;
  }

  /**
   * Checks if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.userService.isLoggedIn();
  }
}
