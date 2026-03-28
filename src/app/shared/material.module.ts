import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

// Angular CDK imports
import { OverlayModule } from '@angular/cdk/overlay';
import { CdkTreeModule } from '@angular/cdk/tree';
import { PortalModule } from '@angular/cdk/portal';

// Angular Material imports (alphabetical order)
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTreeModule } from '@angular/material/tree';

/**
 * Centralized Angular Material components module
 * Imports and exports all necessary Material Design components and Angular CDK modules
 * for consistent UI throughout the application
 */

// Core modules (Forms and CDK)
const coreModules = [
  ReactiveFormsModule,
  OverlayModule,
  CdkTreeModule,
  PortalModule
];

// Material Design components (alphabetical order)
const materialComponents = [
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTreeModule
];

// Combined modules for export
const allMaterialModules = [
  ...coreModules,
  ...materialComponents
];

/**
 * Material Design module providing all necessary Angular Material components
 * Centralizes material imports to avoid duplication across components
 */
@NgModule({
  imports: allMaterialModules,
  exports: allMaterialModules
})
export class MaterialModule {

  constructor() {
    console.log('MaterialModule initialized - All Angular Material components loaded');
  }
}
