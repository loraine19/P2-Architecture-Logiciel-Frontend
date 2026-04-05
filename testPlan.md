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

## 3. Scénarios End-to-End (hors périmètre tests unitaires)

- **Flux 1 : Cycle de vie d'un compte** — Inscription → Connexion → Déconnexion
- **Flux 2 : Gestion complète étudiant** — Connexion admin → Création → Modification → Suppression
