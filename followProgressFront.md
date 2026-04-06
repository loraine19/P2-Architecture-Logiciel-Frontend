# Mémo de Soutenance — Projet Front-end Angular

> **Contexte personnel :** CDA passé en React/TS/NestJS. Tu connais les concepts CRUD, controller, service, API REST. Ce mémo part de ce que tu sais déjà pour expliquer ce qui est nouveau : Angular, la POO TypeScript, et les tests Jest.

---

## 1. Vue d'ensemble — Ce qu'on a construit

Une **Single Page Application (SPA)** Angular qui :

1. Authentifie un utilisateur via une API Spring Boot (`/api/login`)
2. Affiche, crée, modifie et supprime des étudiants (CRUD)
3. Protège les routes avec des Guards
4. Intercepte automatiquement toutes les requêtes HTTP (pour joindre le token JWT)
5. Est testée avec Jest (couverture > 80%)

---

## 2. Comparaison React ↔ Angular (ce que tu connais déjà)

| Concept       | React (ton CDA)        | Angular (ce projet)                                |
| ------------- | ---------------------- | -------------------------------------------------- |
| Composant     | Fonction `() => <JSX>` | Classe décorée `@Component`                        |
| État local    | `useState()`           | Propriété de classe `isLoading = false`            |
| Appel HTTP    | `fetch` / `axios`      | `HttpClient` injecté via le constructeur           |
| Routage       | `react-router`         | `@angular/router` avec `app.routes.ts`             |
| Props/Input   | `props.name`           | `@Input() name: string`                            |
| Context/Store | Context API / Redux    | Service injecté (Dependency Injection)             |
| Formulaires   | `useState` + onChange  | `ReactiveFormsModule` (`FormGroup`, `FormControl`) |

---

## 3. Architecture du projet

```
src/app/
│
├── core/                    ← Code "métier" partagé dans toute l'appli
│   ├── DTO/                 ← Objets échangés avec l'API (forme des données)
│   │   ├── Login.ts         ← { login, password, rememberMe, authType }
│   │   ├── LoginResponse.ts ← { success, message, user, token }
│   │   └── InfoMessage.ts   ← { message: string, error: boolean }
│   ├── models/              ← Entités métier (forme des données internes)
│   │   ├── Student.ts       ← classe avec constructeur et 8 propriétés
│   │   └── User.ts
│   ├── service/             ← Logique métier et appels HTTP
│   │   ├── user.service.ts  ← login, logout, register, isLoggedIn
│   │   ├── student.service.ts ← getAllStudents, createStudent, etc.
│   │   ├── error.service.ts ← traduit les codes HTTP en messages lisibles
│   │   ├── adaptiveStorage.service.ts ← JWT en localStorage (dev) ou SecureStorage (mobile)
│   │   ├── platformDetection.service.ts ← détecte mobile vs web
│   │   └── auth.interceptor.ts ← injecte automatiquement le JWT dans les requêtes
│   └── guards/
│       └── auth.guard.ts    ← authGuard, guestGuard, redirectGuard
│
├── pages/                   ← Un dossier par écran
│   ├── login/               ← Formulaire login
│   ├── register/            ← Formulaire inscription
│   ├── home/                ← Page d'accueil publique
│   ├── studentList/         ← Tableau + suppression
│   ├── studentCreate/       ← Formulaire création
│   └── studentDetails/      ← Détail + modification
│
├── shared/
│   ├── material.module.ts   ← Tous les composants Angular Material importés une fois
│   └── navigation/          ← Barre de navigation (affiche login/logout selon état)
│
├── app.routes.ts            ← Définition de toutes les routes
└── app.config.ts            ← Bootstrap de l'appli (providers globaux)
```

---

## 4. POO et Typage TypeScript — Les concepts à expliquer

### 4.1 Pourquoi des classes et pas juste des objets ?

En React tu ferais : `const student = { id: 1, firstName: 'John' }`.
En Angular on utilise des **classes TypeScript** :

```typescript
// src/app/core/models/Student.ts
export class Student {
    id: number;
    firstName: string;
    // ...

    constructor(id: number, firstName: string, ...) {
        this.id = id;
        this.firstName = firstName;
    }
}
```

**Pourquoi ?** La classe donne un **contrat** : impossible de créer un `Student` sans ses 8 champs. Le compilateur TypeScript t'empêche de passer un objet incomplet. C'est la **sécurité du typage fort**.

### 4.2 Les Interfaces vs les Classes

- Une **classe** a un constructeur, peut avoir des méthodes, se compile en JavaScript
- Une **interface** n'existe qu'à la compilation, elle définit juste la forme d'un objet

```typescript
// Interface : seulement pour le typage, disparaît à la compilation
export interface InfoMessage {
  message: string;
  error: boolean;
}

// Utilisation dans un composant
infoMessage: InfoMessage = { message: "", error: false };
```

### 4.3 Les DTO (Data Transfer Object)

> "Un DTO c'est comme un formulaire de douane : il définit exactement quelles données passent la frontière entre le front et le back."

```typescript
// src/app/core/DTO/Login.ts — ce qu'on envoie au back
export class Login {
  login: string = "";
  password: string = "";
  rememberMe: boolean = false;
  authType: AuthType = AuthType.COOKIE;
}
```

Le back-end Java attend exactement ces champs avec ces noms. Si le front envoie `email` à la place de `login` → erreur 400. Les DTO garantissent que front et back parlent le même langage.

### 4.4 Les Décorateurs — la syntaxe `@`

C'est la grande différence avec React. Les décorateurs sont des **métadonnées** qui disent à Angular comment se comporter :

```typescript
@Component({
  // ← "cette classe est un composant Angular"
  selector: "app-login", // ← comment l'appeler en HTML : <app-login>
  standalone: true, // ← Angular 17+ : plus besoin de NgModule
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  // ...
}
```

```typescript
@Injectable({
  // ← "cette classe peut être injectée comme service"
  providedIn: "root", // ← singleton : une seule instance dans toute l'appli
})
export class UserService {}
```

### 4.5 L'Injection de Dépendances (DI)

C'est le coeur d'Angular. Au lieu de `new UserService()`, Angular gère lui-même les instances :

```typescript
// Dans NestJS tu faisais :
constructor(private userService: UserService) {}  // ← même concept !

// En Angular moderne (v17+), on utilise inject() :
private userService = inject(UserService);
```

**Pourquoi c'est important pour les tests ?** Parce qu'on peut remplacer le vrai service par un faux (`mock`) dans les tests sans toucher au composant.

---

## 5. PART 1 — Authentification

### 5.1 Ce qu'on a fait

1. Créé le composant `LoginComponent` avec un `FormGroup` (formulaire réactif)
2. Créé le `UserService` qui appelle `POST /api/login`
3. Stocké le token JWT dans `localStorage` (via `AdaptiveStorageService`)
4. Créé 3 guards pour protéger les routes

### 5.2 Le Formulaire Réactif — ReactiveFormsModule

> "Contrairement aux formulaires HTML classiques, les formulaires réactifs sont entièrement contrôlés par le code TypeScript."

```typescript
// Dans login.component.ts
this.loginForm = this.formBuilder.group({
  login: ["", [Validators.required, Validators.email]],
  password: ["", [Validators.required, Validators.minLength(8)]],
});
```

Chaque champ a des **Validators** qui définissent les règles. Dans le HTML, `*ngIf="loginForm.get('login')?.errors?.['required']"` affiche une erreur si le champ est vide.

### 5.3 Le Service UserService — appel HTTP

```typescript
// user.service.ts
login(login: Login): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>('/api/login', login, { observe: 'response' })
        .pipe(
            switchMap(httpResponse => from(this.processLoginResponse(httpResponse)))
        );
}
```

**À expliquer :**

- `Observable` = comme une `Promise` mais qui peut émettre plusieurs valeurs dans le temps. Ici c'est une seule réponse HTTP
- `pipe()` = chaîne d'opérateurs qui transforment les données (comme `.then()` en Promises)
- `switchMap()` = transforme la réponse HTTP en un autre Observable (ici une `Promise` async convertie)
- `observe: 'response'` = on veut les headers aussi (pour récupérer le token Bearer en mode mobile)

### 5.4 Les Guards — Protéger les routes

```typescript
// auth.guard.ts — 3 guards fonctionnels (pas de classe, juste des fonctions)

export const authGuard = (): boolean | UrlTree => {
  const userService = inject(UserService);
  if (!userService.isLoggedIn()) {
    return inject(Router).createUrlTree(["/home"]); // redirection déclarative
  }
  return true;
};

export const guestGuard = (): boolean | UrlTree => {
  const userService = inject(UserService);
  if (userService.isLoggedIn()) {
    return inject(Router).createUrlTree(["/studentList"]);
  }
  return true;
};

export const redirectGuard = (): UrlTree => {
  const userService = inject(UserService);
  const route = userService.isLoggedIn() ? "/studentList" : "/home";
  return inject(Router).createUrlTree([route]);
};
```

> **Pourquoi `UrlTree` et pas `navigate()` ?** Retourner un `UrlTree` est la méthode recommandée depuis Angular 7.1 : le router gère lui-même la redirection de façon synchrone, ce qui est plus prévisible, testable (`result instanceof UrlTree`) et qui évite les effets de bord liés à un appel `navigate()` hors du cycle du router.

Dans `app.routes.ts` :

```typescript
{
    path: 'studentList',
    component: StudentListComponent,
    canActivate: [authGuard]  // ← Angular appelle authGuard avant d'afficher la page
}
```

**Analogie :** Le guard c'est le videur de boîte de nuit. Avant que tu entres dans la "page", il vérifie ton bracelet (= ton token). Si tu n'en as pas, il te renvoie à l'accueil.

### 5.5 L'Intercepteur HTTP

```typescript
// auth.interceptor.ts
intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Sur mobile : ajoute "Authorization: Bearer <token>" à chaque requête
    // Sur web : ajoute withCredentials: true (cookies HttpOnly)
    // Gère automatiquement les 401 (token expiré → refresh automatique)
}
```

**Analogie :** L'intercepteur est comme un péage automatique. Chaque voiture (requête HTTP) passe automatiquement par lui avant de prendre l'autoroute (l'API). Il colle le ticket (JWT) sans que tu aies à le faire manuellement dans chaque composant.

---

## 6. PART 1 — CRUD Étudiants

### 6.1 StudentService — les 5 opérations CRUD

```typescript
// student.service.ts
getAllStudents(): Observable<Student[]>              // GET  /api/students
getStudentById(id: number): Observable<Student>     // GET  /api/students/:id
createStudent(data): Observable<Student>            // POST /api/students
updateStudent(id, data): Observable<Student>        // PUT  /api/students/:id
deleteStudent(id: number): Observable<void>         // DELETE /api/students/:id
```

C'est exactement le même pattern que tes controllers NestJS, mais côté consommateur.

### 6.2 Gestion des états dans les composants

Chaque composant de page gère 3 états :

```typescript
isLoading: boolean = true;                              // en cours de chargement
students: Student[] = [];                               // les données
infoMessage: InfoMessage = { message: '', error: false }; // succès ou erreur
```

```typescript
ngOnInit(): void {
    this.studentService.getAllStudents().subscribe({
        next: (data) => {
            this.students = data;      // succès
            this.isLoading = false;
        },
        error: (err) => {
            this.errorService.handleError(err, this.infoMessage);  // erreur
            this.isLoading = false;
        }
    });
}
```

### 6.3 La route paramétrée — ActivatedRoute

```typescript
// Dans app.routes.ts : path: 'studentDetails/:id'

// Dans studentDetails.component.ts
private route = inject(ActivatedRoute);

ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');  // récupère l'id dans l'URL
    if (id) this.studentService.getStudentById(+id).subscribe(...);
}
```

`+id` convertit le string de l'URL en number. Équivalent de `parseInt(id)` en JS.

---

## 7. PART 2 — Tests Jest

### 7.1 Pourquoi tester ?

> "Un test unitaire vérifie qu'une pièce du code fait exactement ce qu'elle est censée faire, indépendamment du reste."

Sans tests : tu dois relancer l'appli entière et cliquer à la main pour vérifier. Avec tests : 144 vérifications automatiques en 30 secondes.

### 7.2 Structure d'un test Jest

```typescript
describe('UserService', () => {         // groupe de tests
    let service: UserService;

    beforeEach(() => {                   // se répète avant chaque test
        TestBed.configureTestingModule({ // configure l'environnement de test Angular
            providers: [UserService, ...]
        });
        service = TestBed.inject(UserService);
    });

    it('should return true when logged in', () => {   // un test
        adaptiveStorage.getAuthState.mockReturnValue(true);  // on simule le storage
        expect(service.isLoggedIn()).toBe(true);             // on vérifie le résultat
    });
});
```

### 7.3 Les Mocks — simuler les dépendances

> "Un mock remplace une vraie dépendance par un faux contrôlable. On ne teste pas le service HTTP dans le test du composant — on fait semblant qu'il répond ce qu'on veut."

```typescript
// Au lieu du vrai StudentService qui ferait un vrai appel HTTP :
const studentSpy = {
    getAllStudents: jest.fn().mockReturnValue(of([mockStudent1, mockStudent2]))
};

// On l'injecte à la place du vrai :
{ provide: StudentService, useValue: studentSpy }
```

**Analogie :** C'est comme tester un distributeur de café avec une machine à café en carton. Tu contrôles ce qu'elle "renvoie" pour tester comment le distributeur réagit.

### 7.4 HttpTestingController — tester les appels HTTP

```typescript
it("should POST to /api/login", () => {
  service.login(credentials).subscribe();

  const req = httpMock.expectOne("/api/login"); // intercepte la vraie requête
  expect(req.request.method).toBe("POST"); // vérifie la méthode

  req.flush({ success: true, user: mockUser }); // simule la réponse du serveur
});
```

### 7.5 fakeAsync / fakeAsync + flushMicrotasks — tester le code asynchrone

```typescript
it("should call setAuthState on login", fakeAsync(() => {
  service.login(credentials).subscribe();
  httpMock.expectOne("/api/login").flush({ success: true });

  flushMicrotasks(); // "avance" toutes les Promises/async en attente

  expect(adaptiveStorage.setAuthState).toHaveBeenCalled();
}));
```

**Pourquoi ?** Le code de login a des `async/await` internes. `fakeAsync` + `flushMicrotasks()` fait tourner ces opérations asynchrones de façon synchrone dans le test.

### 7.6 La couverture de code

```
Lines       92.86%  (442/476)  ← % de lignes de code exécutées par les tests
Functions   92.91%  (118/127)  ← % de fonctions appelées
Branches    80.51%  (95/118)   ← % de if/else/ternaires couverts
```

Généré par : `npm test` → rapport HTML dans `coverage/index.html` + `coverage/lcov.info` (pour l'extension VS Code Coverage Gutters)

---

## 8. Récapitulatif — Ce que tu peux dire en soutenance

### Sur l'architecture

> "J'ai structuré l'application en couches : la couche `core` contient la logique métier pure (services, guards, DTOs), la couche `pages` contient les composants d'affichage, et la couche `shared` centralise les modules partagés. Cette séparation respecte le principe de responsabilité unique : chaque fichier a un seul rôle."

### Sur les DTOs

> "Les DTOs définissent le contrat entre le front et le back. Le `Login.ts` côté Angular doit avoir exactement les mêmes champs que le `LoginDTO.java` côté Spring. Si un champ diffère, l'API renvoie une erreur 400. Les DTOs garantissent que les deux équipes parlent le même langage."

### Sur les Guards

> "Les guards sont des fonctions que le router Angular appelle avant d'afficher une page. `authGuard` vérifie que l'utilisateur est connecté — sinon il redirige vers `/home`. `guestGuard` fait l'inverse : si tu es déjà connecté, tu ne peux pas aller sur `/login`. `redirectGuard` sur la route racine redirige intelligemment selon l'état de connexion."

### Sur l'Intercepteur

> "L'intercepteur `AuthInterceptor` écoute toutes les requêtes HTTP sortantes. Sur web, il ajoute `withCredentials: true` pour que le navigateur envoie automatiquement les cookies d'authentification. Sur mobile, il lit le JWT dans le storage et l'injecte dans le header `Authorization: Bearer <token>`. Ça évite de répéter ce code dans chaque service."

### Sur les tests

> "J'ai utilisé Jest, pas Jasmine, car Jest est indépendant du navigateur et s'exécute dans Node.js — c'est plus rapide pour un CI/CD. Les services sont testés avec `HttpTestingController` qui intercepte les vrais appels HTTP. Les composants sont testés avec des mocks : je remplace le vrai service par un faux avec `jest.fn()` pour ne tester que la logique du composant, pas celle du service. J'ai atteint 92% de couverture de statements."

### Sur la POO / typage

> "TypeScript ajoute le typage statique à JavaScript. Concrètement, si j'écris `id: number` dans ma classe `Student`, le compilateur m'empêche de passer une chaîne là où un nombre est attendu. Ça détecte des bugs à la compilation plutôt qu'à l'exécution. Les classes Angular utilisent les décorateurs — la syntaxe `@Component`, `@Injectable` — qui sont de la métadonnée que le framework lit pour savoir comment instancier et connecter les classes entre elles."

---

## 9. Questions pièges possibles et réponses

**Q : Pourquoi `standalone: true` dans les composants ?**

> Avant Angular 14, chaque composant devait être déclaré dans un `NgModule`. Depuis Angular 17, standalone = le composant gère lui-même ses imports. C'est plus simple et plus proche de la logique React.

**Q : Différence entre `Observable` et `Promise` ?**

> Une Promise émet une seule valeur puis se termine. Un Observable peut émettre plusieurs valeurs dans le temps (ex: WebSocket). Pour du HTTP, c'est pareil en pratique — mais Angular utilise les Observables pour pouvoir `pipe()` des opérateurs de transformation (`map`, `filter`, `switchMap`).

**Q : Pourquoi `inject()` plutôt que le constructeur ?**

> Les deux fonctionnent. `inject()` est la syntaxe moderne Angular 14+, recommandée car elle fonctionne aussi avec les guards fonctionnels (pas de classe). Le constructeur reste valide dans les services avec `@Injectable`.

**Q : Qu'est-ce que `takeUntil(this.destroy$)` dans les composants ?**

> Quand un composant est détruit, ses subscriptions Observable restent actives et causent des fuites mémoire. `takeUntil(destroy$)` annule automatiquement les subscriptions quand le composant est détruit (au moment de `ngOnDestroy`).

**Q : Pourquoi `UrlTree` dans les guards plutôt que `router.navigate()` ?**

> Retourner un `UrlTree` est la façon recommandée depuis Angular 7.1 : le router reçoit une instruction de redirection déclarative qu'il peut gérer en une seule passe, sans déclencher un second cycle de navigation. C'est aussi directement vérifiable dans les tests : `expect(result).toBeInstanceOf(UrlTree)`.

**Q : Pourquoi multi-stage dans le Dockerfile ?**

> Le stage 1 (Node) fait tourner les tests et compile l'appli. Si les tests échouent, l'image ne se crée pas. Le stage 2 (nginx) ne contient que le dossier `dist/` — pas Node, pas `node_modules`. L'image finale fait ~25 Mo au lieu de ~400 Mo.

---

## 10. Vidéos courtes pour révision rapide

### Angular & TypeScript

| Sujet                                   | Chaîne    | Lien                                                                                                     |
| --------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| Angular en 100 secondes                 | Fireship  | [youtube.com](https://www.youtube.com/watch?v=Ata9cSC2WpM)                                               |
| TypeScript en 100 secondes              | Fireship  | [youtube.com](https://www.youtube.com/watch?v=zQnBQ4tB3ZA)                                               |
| Angular Signals & Standalone (overview) | Fireship  | [youtube recherche](https://www.youtube.com/results?search_query=angular+signals+fireship)               |
| Angular Reactive Forms en pratique      | recherche | [youtube recherche](https://www.youtube.com/results?search_query=angular+reactive+forms+tutorial+short)  |
| Dependency Injection en 10 min          | recherche | [youtube recherche](https://www.youtube.com/results?search_query=angular+dependency+injection+explained) |

### RxJS

| Sujet                                        | Chaîne    | Lien                                                                                                 |
| -------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| RxJS en 100 secondes                         | Fireship  | [youtube.com](https://www.youtube.com/watch?v=ewcoEYS85Co)                                           |
| `switchMap` vs `mergeMap` vs `concatMap`     | recherche | [youtube recherche](https://www.youtube.com/results?search_query=rxjs+switchmap+mergemap+explained)  |
| Éviter les fuites mémoire RxJS (`takeUntil`) | recherche | [youtube recherche](https://www.youtube.com/results?search_query=rxjs+memory+leak+takeuntil+angular) |

### Tests Jest / Angular Testing

| Sujet                                    | Chaîne    | Lien                                                                                                     |
| ---------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| Jest en 100 secondes                     | Fireship  | [youtube.com](https://www.youtube.com/watch?v=r9HdJ8P6GQI)                                               |
| Angular Testing (unit + integration)     | recherche | [youtube recherche](https://www.youtube.com/results?search_query=angular+unit+testing+jest+tutorial)     |
| `fakeAsync` et tests asynchrones Angular | recherche | [youtube recherche](https://www.youtube.com/results?search_query=angular+fakeasync+testing+explained)    |
| HttpTestingController expliqué           | recherche | [youtube recherche](https://www.youtube.com/results?search_query=angular+httptestingcontroller+tutorial) |

### Sécurité (JWT / Guards / Interceptors)

| Sujet                        | Chaîne    | Lien                                                                                                    |
| ---------------------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| JWT expliqué en 100 secondes | Fireship  | [youtube.com](https://www.youtube.com/watch?v=P2CPd9ynFLg)                                              |
| Angular Route Guards         | recherche | [youtube recherche](https://www.youtube.com/results?search_query=angular+route+guards+tutorial+urltree) |
| Angular HTTP Interceptors    | recherche | [youtube recherche](https://www.youtube.com/results?search_query=angular+http+interceptor+jwt+tutorial) |

> **Stratégie de révision :** Fireship pour la vue d'ensemble (2 min max), puis les résultats de recherche pour approfondir le point précis à expliquer en soutenance.
