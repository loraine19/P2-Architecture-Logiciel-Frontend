import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/service/user.service';

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
  userService = inject(UserService);
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
      description: 'Interface moderne et responsive avec Angular Material'
    },
    {
      icon: 'security',
      color: 'danger',
      title: 'Authentification & Sécurité',
      description: 'Système de connexion sécurisé avec gestion des rôles'
    },

    {
      icon: 'api',
      color: 'success',
      title: 'API RESTful',
      description: 'Communication backend sécurisée via API REST'
    }
  ];

  openRepository(url: string) {
    window.open(url, '_blank');
  }
}
