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
 * Home page component - Technical Showcase
 * Designed to demonstrate full-stack mastery to mentors:
 * Hybrid Security, DevOps orchestration, and Reactive Architecture.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule,
    MatIconModule, MatDividerModule, MatChipsModule, RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrls: ['../../../styles.css']
})
export class HomeComponent {

  // Dependency Injections
  public userService = inject(UserService);

  /* FRONTEND DEEP STACK */
  public readonly techStackFrontend = [
    'Angular 18 (Standalone)',
    'TypeScript & RxJS Streams',
    'Material Design 3 (MD3)',
    'Responsive CSS (Mobile First)',
    'Capacitor Native Bridge',
    'Jest & Integration Testing'
  ];

  /* BACKEND & SECURITY STACK */
  public readonly techStackBackend = [
    'Java 21 & Spring Boot 3',
    'Spring Security 6 (Stateless)',
    'JWT & HttpOnly Cookies',
    'JPA Hibernate / PostgreSQL',
    'Flyway Database Migration',
    'Docker Multi-stage Builds'
  ];

  /* DETAILED FEATURES FOR MENTOR REVIEW */
  public readonly features = [
    {
      icon: 'security',
      title: 'Sécurité Hybride Avancée',
      color: 'danger',
      description: 'Double stratégie : Cookies HttpOnly (protection XSS) pour le Web et JWT Headers pour le Mobile natif.'
    },
    {
      icon: 'sync_alt',
      title: 'Gestion Réactive des Tokens',
      color: 'info',
      description: 'Intercepteur HTTP gérant silencieusement les erreurs 401 et le rafraîchissement automatique des jetons.'
    },
    {
      icon: 'devices',
      title: 'Expérience Responsive & Mobile',
      color: 'warning',
      description: 'Design adaptatif MD3 avec détection automatique de plateforme pour l\'accès au stockage sécurisé natif.'
    },
    {
      icon: 'settings_ethernet',
      title: 'Écosystème Dockerisé',
      color: 'success',
      description: 'Orchestration complète : Containers pour le Front (Nginx), le Back (Spring) et la Database (Postgres).'
    }
  ];
  /* GO BACK */
  goDocker(): void {
    window.open('https://hub.docker.com/repositories/lorainep', '_blank');
  }
  constructor() { }

  /** PUBLIC METHODS */

  /* OPEN REPOSITORY */
  openRepository(url: string): void {
    window.open(url, '_blank');
  }

  /* LOGGED IN STATE */
  isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }
}