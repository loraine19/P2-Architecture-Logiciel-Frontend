import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { UserDTO } from '../../core/models/User';
import { MaterialModule } from '../../shared/material.module';

/**
 * Component - Main navigation bar with authentication-aware menu items
 * Exposes a responsive hamburger menu for mobile and a full navbar for desktop
 */
@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MaterialModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.css']
})
export class NavigationComponent {

  public userService = inject(UserService);

  isMenuOpen = false;

  constructor() { }

  /** PUBLIC */
  /* USER FIRST NAME */
  public userFirstName(): string {
    const user: UserDTO | null = this.userService.getCurrentUser();
    return user ? `Hi ${user.firstName} !` : 'Welcome in Student Management';
  }

  /* TOGGLE MENU */
  // flip the menu open/closed state
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /* CLOSE MENU */
  // close the menu when a link is clicked
  closeMenu(): void {
    this.isMenuOpen = false;
  }

  /* IS AUTHENTICATED */
  // used by the template to show/hide the logout button
  isAuthenticated(): boolean {
    return this.userService.isLoggedIn();
  }
}