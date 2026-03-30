# Plan de Tests Stratégique - Projet EtuBibliothèque

Ce document définit la stratégie de test pour atteindre l'objectif de 80% de couverture minimum sur le Front-end (Jest) et le Back-end (JUnit/Mockito), en respectant une progression du simple (Unitaire) vers le complexe (Intégration).

---

## 1. Front-end (Angular 18+ / Jest)

**Objectif de couverture : > 80%**

### Priorité 1 : Tests Unitaires des Services (Simple)

Les services contiennent la logique métier et les appels HTTP. Ils doivent être testés isolément avec `HttpTestingController`.

- **`src/app/core/service/user.service.spec.ts`**
  - _Test 1 :_ Vérifier la connexion réussie (Entrée : `LoginDTO` valide / Sortie : Stockage du token, retour `true`).
  - _Test 2 :_ Vérifier l'échec de connexion (Entrée : `LoginDTO` invalide / Sortie : Erreur 401 interceptée, retour `false`).
  - _Test 3 :_ Vérifier la déconnexion (Entrée : Action utilisateur / Sortie : Nettoyage du storage, redirection).
- **`src/app/core/service/student.service.spec.ts`**
  - _Test 1 :_ Récupérer la liste (Entrée : Appel API GET / Sortie : Tableau `StudentDTO[]`).
  - _Test 2 :_ Créer un étudiant (Entrée : `StudentDTO` valide / Sortie : Retour 201 Created).
  - _Test 3 :_ Supprimer un étudiant (Entrée : `id` existant / Sortie : Retour 204 No Content).

### Priorité 2 : Tests Unitaires et DOM des Composants (Intermédiaire)

Ces tests valident le rendu HTML et les interactions utilisateur. L'utilisation de `provideHttpClientTesting()` et `provideNoopAnimations()` est requise.

- **`src/app/pages/login/login.component.spec.ts`**
  - _Test 1 :_ Formulaire invalide si vide (Entrée : Champs vides / Sortie : Bouton submit désactivé, `form.invalid == true`).
  - _Test 2 :_ Appel du service à la soumission (Entrée : Clic sur login avec données valides / Sortie : `userService.login()` est appelé).
- **`src/app/pages/studentCreate/studentCreate.component.spec.ts`**
  - _Test 1 :_ Validation des règles de saisie (Entrée : Email mal formaté / Sortie : Affichage de `<mat-error>`).
- **`src/app/pages/studentList/studentList.component.spec.ts`**
  - _Test 1 :_ Affichage du tableau (Entrée : Mock de 2 étudiants / Sortie : Le DOM affiche 2 lignes `<tr>`).
- **`src/app/shared/navigation/navigation.component.spec.ts`**
  - _Test 1 :_ Rendu conditionnel (Entrée : Utilisateur déconnecté / Sortie : Le bouton "Login" est visible, "Logout" est caché).

---

## 3. Scénarios de Test Bout en Bout (End-to-End)

Vérification des flux métiers complets (Test manuel ou via outil type Cypress/Selenium si requis par le périmètre).

- **Flux 1 : Cycle de vie d'un compte**
  - (Entrées : Inscription -> Connexion -> Déconnexion) / (Sorties : Accès accordé puis révoqué).
- **Flux 2 : Gestion Complète Étudiant**
  - (Entrées : Login admin -> Création étudiant X -> Modification étudiant X -> Suppression étudiant X) / (Sorties : La base de données reflète les états successifs sans erreur d'intégrité).
