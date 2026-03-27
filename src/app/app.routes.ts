import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { StudentCreateComponent } from './pages/studentCreate/studentCreate.component';
import { StudentListComponent } from './pages/studentList/studentList.component';
import { StudentDetailsComponent } from './pages/studentDetails/studentDetails.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'studentCreate',
    component: StudentCreateComponent
  },
  {
    path: 'studentList',
    component: StudentListComponent
  },
  {
    path: 'studentEdit/:id',
    component: StudentDetailsComponent
  },
  {
    path: 'studentDetails/:id',
    component: StudentDetailsComponent
  }

];
