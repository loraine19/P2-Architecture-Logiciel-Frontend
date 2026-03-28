import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { StudentCreateComponent } from './pages/studentCreate/studentCreate.component';
import { StudentListComponent } from './pages/studentList/studentList.component';
import { StudentDetailsComponent } from './pages/studentDetails/studentDetails.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { redirectGuard } from './core/guards/redirect.guard';

/**
 * Application routing configuration
 * Defines all routes with appropriate guards and titles for SEO
 * Separates public routes from protected authentication-required routes
 */
export const routes: Routes = [
  // Root redirect route
  {
    path: '',
    canActivate: [redirectGuard],
    children: []
  },

  // Public routes - accessible to all users
  {
    path: 'home',
    component: HomeComponent,
    title: 'Home - Student Management'
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestGuard],
    title: 'Register - Student Management'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
    title: 'Login - Student Management'
  },

  // Protected routes - authentication required
  {
    path: 'studentCreate',
    component: StudentCreateComponent,
    canActivate: [authGuard],
    title: 'Create Student - Student Management'
  },
  {
    path: 'studentList',
    component: StudentListComponent,
    canActivate: [authGuard],
    title: 'Students List - Student Management'
  },
  {
    path: 'studentEdit/:id',
    component: StudentDetailsComponent,
    canActivate: [authGuard],
    title: 'Edit Student - Student Management'
  },
  {
    path: 'studentDetails/:id',
    component: StudentDetailsComponent,
    canActivate: [authGuard],
    title: 'Student Details - Student Management'
  },

  // Catch-all route - redirects unknown paths
  {
    path: '**',
    redirectTo: 'login'
  }
];
