import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../core/service/user.service';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../shared/material.module';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive, CommonModule, MaterialModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['../pages/pages.css', './navigation.css']
})
export class NavigationComponent {
  isMenuOpen = false;

  constructor(public userService: UserService) { }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
