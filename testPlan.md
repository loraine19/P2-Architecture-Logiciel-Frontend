# Plan de Tests Stratégique - Projet EtuBibliothèque

Ce document définit la stratégie de test pour atteindre l'objectif de 80% de couverture minimum sur le Front-end (Jest).

---

## 1. Front-end (Angular 18+ / Jest)

**Objectif de couverture : > 80%**  
**Résultat atteint : Statements 92.54% | Branches 80.5% | Functions 92.91% | Lines 92.85%**

> **Note technique :** Le projet utilise Jest (non Karma/Jasmine). Toutes les APIs utilisées sont Jest : `jest.fn()`, `jest.Mocked<T>`, `.mockReturnValue()`, `.mockResolvedValue()`, `.mockImplementation()`. Ne jamais utiliser `provideNoopAnimations()` : cette fonction importe `@angular/animations/browser` qui n'est pas résolu par Jest.

---

### Priorité 1 : Tests Unitaires des Services (14 suites — 145 tests)

#### `src/app/core/service/user.service.spec.ts` — 24 tests ✅

- `register()` : POST vers `/api/register`, lève une erreur si login ou password manquants
- `login()` : POST vers `/api/login`, appelle `setAuthState` en cas de succès, pas en cas d'échec ; lève une erreur si credentials manquants ; mode mobile avec stockage du refreshToken via `fakeAsync` et `flushMicrotasks()`
- `logout()` : POST vers `/api/logout`, nettoie le storage et navigue vers `/home` même en cas d'erreur API
- `isLoggedIn()` : délègue à `adaptiveStorage.getAuthState()`
- `getCurrentUser()` : délègue à `adaptiveStorage.getAuthStateUser()`
- `getAuthToken()` : retourne `null` sur web, délègue au storage sur mobile
- `setAuthToken()` : n'agit pas sur web, délègue au storage sur mobile
- `refreshAccessToken()` : POST web sans corps, POST mobile avec refreshToken ; erreur si pas de refreshToken

#### `src/app/core/service/adaptiveStorage.service.spec.ts` — 15 tests ✅

- `getAuthToken()` / `setAuthToken()` : lecture/écriture via `localStorage` en DEV_MODE
- `getAuthRefreshToken()` / `setAuthRefreshToken()` : lecture/écriture via `localStorage`
- `setAuthState()` / `getAuthState()` : sérialisation/désérialisation JSON dans `localStorage` ; retourne `false` si JSON corrompu
- `getAuthStateUser()` : retourne l'utilisateur stocké ou `null`
- `clearAuthData()` : supprime l'état auth ; supprime aussi les tokens en mode mobile

#### `src/app/core/service/student.service.spec.ts` — 5 tests ✅

- `getAllStudents()`, `getStudentById()`, `createStudent()`, `updateStudent()`, `deleteStudent()` : vérifient la méthode HTTP, l'URL et le corps envoyé via `HttpTestingController`

#### `src/app/core/service/error.service.spec.ts` — 6 tests ✅

- `handleError()` : mappe les codes 0, 401, 403, 404, 500 vers des messages lisibles ; utilise `err.error.message` si disponible ; met `infoMessage.error = true`

#### `src/app/core/service/platformDetection.service.spec.ts` — 4 tests ✅

- `isMobile()`, `isWeb()`, `getPlatform()` : vérifient le comportement en mockant `navigator.userAgent`

---

### Priorité 2 : Tests des Guards

#### `src/app/core/guards/auth.guard.spec.ts` — 6 tests ✅

- `authGuard` : redirige vers `/login` si non connecté, laisse passer si connecté
- `guestGuard` : redirige vers `/home` si connecté, laisse passer si non connecté
- `redirectGuard` : redirige toujours vers `/studentList`
- Utilise `TestBed.runInInjectionContext()` pour exécuter les guards fonctionnels

---

### Priorité 3 : Tests des Composants

#### `src/app/app.component.spec.ts` — 2 tests ✅

- Création du composant, valeur de `title`

#### `src/app/pages/login/login.component.spec.ts` — 8 tests ✅

- Création, validation `required` sur login et password, appel du service, gestion succès/erreur, redirection

#### `src/app/pages/register/register.component.spec.ts` — 6 tests ✅

- Création, invalidité d'un formulaire vide, appel du service, redirection après succès, message d'erreur

#### `src/app/pages/home/home.component.spec.ts` — 4 tests ✅

- Création, listes `techStack` et `features` non vides

#### `src/app/pages/studentCreate/studentCreate.component.spec.ts` — 19 tests ✅

- Initialisation du formulaire, validation (`required`, email, pattern zipCode 5 chiffres)
- `onSubmit()` : appelle `createStudent`, affiche le message de succès, navigue après 2s (spy avec `mockResolvedValue(true)`)
- `onReset()` : réinitialise le formulaire et le flag `submitted`

#### `src/app/pages/studentList/studentList.component.spec.ts` — 10 tests ✅

- Chargement des étudiants au `ngOnInit`, gestion d'erreur avec `mockImplementation` sur `errorService.handleError`
- `deleteStudent()`, `confirmDelete()`, `cancelDelete()`, `viewStudent()`, `editStudent()`

#### `src/app/pages/studentDetails/studentDetails.component.spec.ts` — 14 tests ✅

- Chargement via route param, formulaire désactivé en mode vue, mode édition, `onSubmit()`, `onCancel()`, `goBackToList()`
- Test "pas d'ID" : utilise `TestBed.resetTestingModule()` avant de re-configurer avec `id = null`

#### `src/app/shared/navigation/navigation.component.spec.ts` — 8 tests ✅

- Affichage conditionnel selon `isLoggedIn`, nom d'utilisateur, appel `logout()`

---

## 2. Décisions Techniques

| `ErrorService.handleError` est un mock → ne modifie pas `infoMessage`  
| Utiliser `mockImplementation((_e, msg) => { msg.error = true; })` dans le test  
|
| `TestBed.configureTestingModule()` deux fois en même suite  
| Appeler `TestBed.resetTestingModule()` dans le test concerné avant la 2ème configuration  
|
| Router réel sans routes → `NG04002` lors de `navigate()`  
| Utiliser `jest.spyOn(router, 'navigate').mockResolvedValue(true)` pour court-circuiter la navigation
|
| Chaîne `async/await` dans `fakeAsync`  
| Appeler `flushMicrotasks()` une fois par `await` dans la chaîne  
|

---

## 3. Tests E2E — Cypress 15.13.0

**Objectif de couverture : 100% des parcours utilisateur**  
**Résultat atteint : 61 tests répartis sur 5 fichiers**

> Les tests E2E tournent dans un vrai navigateur (Chrome). Ils ne dépendent pas d'un backend actif : chaque requête HTTP est interceptée via `cy.intercept()` et retourne des données de fixture.

### Configuration

- **`cypress.config.ts`** : `baseUrl: http://localhost:4200`, `defaultCommandTimeout: 8000`
- **`cypress/tsconfig.json`** : `moduleResolution: node`, types `["cypress", "node"]`
- **`cypress/support/commands.ts`** : `cy.login()` (UI complète) et `cy.logout()` (via menu nav)
- **`cypress/support/e2e.ts`** : `beforeEach(() => cy.clearLocalStorage())`
- **Fixtures** : `user.json`, `student.json`, `students.json`

### Scripts disponibles

```bash
npm run cy:open          # interface graphique Cypress
npm run cy:run           # headless CI
npm run cy:run:headed    # navigateur visible
```

### `cypress/e2e/auth/register.cy.ts` — 11 tests ✅

- Affichage du formulaire, bouton submit désactivé si vide
- guestGuard : redirection d'un utilisateur déjà connecté
- Erreurs required sur les 4 champs, erreur minlength firstName
- Submit désactivé si invalide, activé si tous les champs valides
- POST 201 → redirection `/login` + message de succès
- Vérification du corps de la requête POST
- Erreur 400 (email déjà pris), erreur 500 (serveur)

### `cypress/e2e/auth/login.cy.ts` — 13 tests ✅

- Affichage du formulaire, bouton désactivé si vide
- guestGuard : redirection d'un utilisateur déjà connecté
- Erreurs required, format email, minlength password, pattern (majuscule)
- Submit activé si valide
- POST succès → redirection `/studentList` + message
- Vérification du corps POST
- 401 (credentials invalides), erreur réseau
- Toggle visibilité mot de passe, reset formulaire
- Déconnexion → redirection `/home`, masquage des liens protégés

### `cypress/e2e/students/studentList.cy.ts` — 12 tests ✅

- authGuard : redirection vers `/home` si non authentifié
- Affichage header, cards, noms et emails depuis fixture
- État vide quand API retourne `[]`
- Navigation : View Details → `/studentDetails/:id`, Edit → `/studentEdit/:id`, Create via menu
- Suppression : dialogue de confirmation, confirm → DELETE + retrait de la liste, cancel → liste intacte
- Erreur de chargement (500)

### `cypress/e2e/students/studentCreate.cy.ts` — 12 tests ✅

- authGuard : redirection vers `/home` si non authentifié
- Affichage formulaire vide, submit désactivé
- Erreurs required, format email, pattern zipCode (5 chiffres)
- POST 201 → message de succès + redirection `/studentList` après 2s
- Vérification du corps POST
- Erreur 409 (conflit), reset formulaire, retour à la liste

### `cypress/e2e/students/studentDetails.cy.ts` — 13 tests ✅

- authGuard : redirection vers `/home` si non authentifié
- Mode vue : nom dans le header, formulaire pré-rempli, désactivé, bouton Edit présent
- Mode édition : formulaire activé, header "Edit Student", cancel restaure les valeurs
- PUT 200 → message de succès + retour au mode vue
- Vérification du corps PUT
- Erreur 409 (conflit lors de la mise à jour)
- Retour à la liste (Back to List, Cancel en mode vue)
- 404 → état "not found"

---

## 4. Décisions Techniques

| Problème                                                              | Solution                                                                           |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `ErrorService.handleError` est un mock → ne modifie pas `infoMessage` | `mockImplementation((_e, msg) => { msg.error = true; })` dans le test              |
| `TestBed.configureTestingModule()` deux fois en même suite            | `TestBed.resetTestingModule()` avant la 2ème configuration                         |
| Router réel sans routes → `NG04002` lors de `navigate()`              | `jest.spyOn(router, 'navigate').mockResolvedValue(true)`                           |
| Chaîne `async/await` dans `fakeAsync`                                 | `flushMicrotasks()` une fois par `await` dans la chaîne                            |
| E2E : guards Angular bloquent avant le rendu                          | `cy.window().then(win => win.localStorage.setItem(...))` via `cy.login()` UI       |
| E2E : fixture JSON typée sans `import`                                | `cy.fixture('students.json')` (string ref) — pas de `resolveJsonModule` nécessaire |
