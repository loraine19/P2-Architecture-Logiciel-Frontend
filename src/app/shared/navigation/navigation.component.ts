import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';

/**
 * Main navigation component for the application
 * Provides responsive navigation menu with authentication-aware content
 */
@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive, CommonModule, MaterialModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['../../pages/pages.css', './navigation.css']
})
export class NavigationComponent {
  isMenuOpen = false;

  constructor(public userService: UserService) {
    console.log('NavigationComponent initialized');
  }

  /**
   * Toggles the mobile menu state
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    console.log('Menu toggled:', this.isMenuOpen);
  }

  /**
   * Closes the mobile menu
   */
  closeMenu(): void {
    this.isMenuOpen = false;
    console.log('Menu closed');
  }

  /**
   * Checks if user is authenticated
   */
  isAuthenticated(): boolean {
    const isAuth = this.userService.isLoggedIn();
    console.log('Navigation auth check:', isAuth);
    return isAuth;
  }
}
