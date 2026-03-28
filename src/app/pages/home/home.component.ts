import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/service/user.service';

/**
 * Home page component displaying application overview and features
 * Shows different content based on user authentication state
 */
@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrl: '../pages.css'
})
export class HomeComponent {
  public userService = inject(UserService);
  // Technology stacks for repository section display
  techStackFrontend = [
    'Angular 18',
    'TypeScript',
    'Angular Material',
    'RxJS',
    'Jest Testing',
    'Docker'
  ];

  techStackBackend = [
    'Java',
    'Spring Boot',
    'Spring Security',
    'JPA/Hibernate',
    'Maven',
    'Docker'
  ];

  // Features for home page display
  features = [
    {
      icon: 'person_add',
      title: 'Gestion des Étudiants',
      color: 'info',
      description: 'Création, modification et suppression des profils étudiants'
    },
    {
      icon: 'list',
      color: 'warning',
      title: 'Interface Utilisateur',
      description: 'Interface moderne et responsive avec Angular Material et CSS personnalisé Material Design (Style MD3 inspiré de Google)'
    },
    {
      icon: 'security',
      color: 'danger',
      title: 'Authentification & Sécurité',
      description: 'Système de connexion sécurisé avec Cookies HTTP Only et JWT(mobile)'
    },
    {
      icon: 'api',
      color: 'success',
      title: 'API RESTful',
      description: 'Communication backend sécurisée via API REST'
    }
  ];

  constructor() {
    console.log('HomeComponent initialized');
  }

  /**
   * Opens external repository URL in new tab
   */
  openRepository(url: string): void {
    console.log('Opening repository:', url);
    window.open(url, '_blank');
  }
}
