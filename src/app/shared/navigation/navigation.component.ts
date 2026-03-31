import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { UserDTO } from '../../core/models/User';
import { MaterialModule } from '../../shared/material.module';

/**
 * Main navigation component for the application
 * Provides responsive navigation menu with authentication-aware content
 */
@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MaterialModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.css']
})
export class NavigationComponent {

  // Dependency Injection
  public userService = inject(UserService);

  // Component State
  isMenuOpen = false;

  constructor() { }

  /** PUBLIC METHODS */

  /* GET USER DISPLAY NAME */
  public userFirstName(): string {
    // Utilise la méthode existante de ton service pour récupérer l'utilisateur
    const user: UserDTO | null = this.userService.getCurrentUser();
    return user ? `Hi ${user.firstName} !` : 'Welcome in Student Management';
  }

  /* TOGGLE MOBILE MENU */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /* CLOSE MOBILE MENU */
  closeMenu(): void {
    this.isMenuOpen = false;
  }

  /* CHECK AUTHENTICATION STATUS */
  isAuthenticated(): boolean {
    return this.userService.isLoggedIn();
  }
}