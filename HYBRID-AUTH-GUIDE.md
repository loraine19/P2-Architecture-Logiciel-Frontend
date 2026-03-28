# Authentification Hybride - Guide d'utilisation

## 🎯 **Présentation**

Ce système d'authentification hybride supporte automatiquement :

- **Cookies HTTP-only** pour les applications web (sécurisé)
- **JWT avec Secure Storage** pour les applications mobiles **natives** (APK/IPA)

## ⚙️ **Configuration Native Apps Only**

**Mode strict activé :** Seules les vraies applications compilées utilisent JWT.

```typescript
// Dans PlatformDetectionService
private readonly ENABLE_USER_AGENT_DETECTION = false;
```

**Résultat :**

- ✅ **APK/IPA natives** → JWT secure storage
- ✅ **Chrome/Safari mobile** → Cookies HTTP-only (comme desktop)
- ✅ **PWA dans navigateurs** → Cookies HTTP-only

## 🔧 **Architecture**

### Services créés :

1. **PlatformDetectionService** - Détecte web/mobile
2. **AdaptiveStorageService** - Gère le stockage adaptatif
3. **AuthInterceptor** - Ajoute automatiquement les headers JWT (mobile)
4. **UserService** (modifié) - Authentification hybride

## 🚀 **Utilisation dans les composants**

### Connexion hybride :

```typescript
// Dans votre component
constructor(private userService: UserService) {}

login(credentials: Login): void {
  this.userService.login(credentials).subscribe({
    next: (response) => {
      // Automatique: JWT stocké (mobile) ou cookie (web)
      console.log('Connexion réussie');
      this.router.navigate(['/dashboard']);
    },
    error: (error) => {
      console.error('Erreur de connexion:', error);
    }
  });
}
```

### Vérification d'authentification :

```typescript
// Méthode synchrone (état actuel)
if (this.userService.isLoggedIn()) {
  // Utilisateur connecté
}

// Méthode asynchrone (recommandée, plus fiable)
this.userService.checkAuthState().subscribe((isAuth) => {
  if (isAuth) {
    // Utilisateur connecté
  }
});

// Observable réactif pour l'UI
this.userService.isLoggedIn$.subscribe((isAuth) => {
  this.showAuthenticatedContent = isAuth;
});
```

### Déconnexion hybride :

```typescript
logout(): void {
  this.userService.logout();
  // Automatique: JWT effacé (mobile) ou cookie invalidé (web)
}
```

## 🔒 **Sécurité**

### Web (Navigateur) :

- Cookies **HTTP-only** : JavaScript ne peut pas y accéder
- Protection CSRF automatique avec cookies
- SameSite policy supportée

### Mobile (App native) :

- JWT stocké dans **Secure Storage** du téléphone
- Chiffrement natif du stockage
- Token automatiquement ajouté aux requêtes API

## ⚙️ **Configuration Backend**

### Headers à supporter :

```
X-Platform: 'web' | 'mobile'
X-Auth-Type: 'cookie' | 'jwt'
```

### Réponse de connexion :

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJ...", // JWT pour mobile
  "user": { "id": "123", "login": "user" },
  "platform": "mobile", // ou "web"
  "authType": "jwt" // ou "cookie"
}
```

## 🧪 **Tests**

Le système détecte automatiquement :

- **Capacitor.js** : `window.Capacitor`
- **Cordova** : `window.cordova`
- **User Agent mobile** : Android, iPhone, etc.

Pour forcer le mode (développement) :

```typescript
// Dans la console du navigateur
window.Capacitor = {}; // Force le mode mobile
delete window.Capacitor; // Force le mode web
```

## 📱 **Packages requis (mobile)**

```bash
# Pour Capacitor
npm install @capacitor/core @capacitor/storage

# Pour le secure storage
npm install @ionic-native/secure-storage
```

## 🔧 **Guards**

Les guards sont automatiquement compatibles :

```typescript
// app.routes.ts
{
  path: 'profile',
  component: ProfileComponent,
  canActivate: [authGuard] // Hybride automatique
}
```

## 💡 **Avantages**

1. **Transparent** : Même API pour web et mobile
2. **Sécurisé** : Meilleure approche pour chaque plateforme
3. **Automatique** : Détection et gestion automatiques
4. **Compatible** : Fonctionne avec l'existant
5. **Moderne** : Architecture TypeScript avec JSDoc

## 🔍 **Debug**

Tous les logs sont préfixés selon le contexte :

- `Hybrid Auth Guard`
- `Platform Detection`
- `AdaptiveStorageService`
- `AuthInterceptor`

Surveillez la console pour le debug détaillé.
