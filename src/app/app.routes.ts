import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { StudentCreateComponent } from './pages/studentCreate/studentCreate.component';
import { StudentListComponent } from './pages/studentList/studentList.component';
import { StudentDetailsComponent } from './pages/studentDetails/studentDetails.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { redirectGuard } from './core/guards/redirect.guard';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [redirectGuard],
    children: []
  },
  // Public routes accessible to all users
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
  // Protected routes (authentication required)
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

  {
    path: '**',
    redirectTo: 'login'
  }
];
