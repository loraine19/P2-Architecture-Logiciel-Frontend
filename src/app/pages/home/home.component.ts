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
 * Component - Landing page showing the project tech stack and features
 * Content is static so no service calls are needed
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

  public userService = inject(UserService);

  public readonly techStackFrontend = [
    'Angular 18 (Standalone)',
    'TypeScript & RxJS Streams',
    'Material Design 3 (MD3)',
    'Responsive CSS (Mobile First)',
    'Capacitor Native Bridge',
    'Jest & Integration Testing'
  ];

  public readonly techStackBackend = [
    'Java 21 & Spring Boot 3',
    'Spring Security 6 (Stateless)',
    'JWT & HttpOnly Cookies',
    'JPA Hibernate / PostgreSQL',
    'Flyway Database Migration',
    'Docker Multi-stage Builds'
  ];

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
  goDocker(): void {
    window.open('https://hub.docker.com/repositories/lorainep', '_blank');
  }
  constructor() { }

  openRepository(url: string): void {
    window.open(url, '_blank');
  }

  isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }
}