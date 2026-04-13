import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { PlatformDetectionService } from './platformDetection.service';
import { AdaptiveStorageService } from './adaptiveStorage.service';
import { UserDTO } from '../models/User';
import { LoginResponse } from '../DTO/LoginResponse';

const mockUser: UserDTO = { firstName: 'John', lastName: 'Doe', login: 'john@test.com', password: '' };

/**
 * Tests d'intégration — isLoggedIn() / getCurrentUser() avec le vrai AdaptiveStorageService
 * isLoggedIn() et getCurrentUser() sont de simples délégations à AdaptiveStorageService.
 * Tester ces méthodes avec des mocks revient à tester que Jest retourne ce qu'on lui a dit.
 * On valide ici l'intégration réelle : UserService → AdaptiveStorageService → localStorage.
 */
describe('UserService — intégration isLoggedIn() / getCurrentUser()', () => {
    let realService: UserService;
    let realStorage: AdaptiveStorageService;
    let intHttpMock: HttpTestingController;

    /** TEST SETUP */
    /* beforeEach */
    // pas de mock pour AdaptiveStorageService — on laisse le vrai service lire/écrire localStorage
    beforeEach(() => {
        localStorage.clear();
        const platformSpy = { isMobile: jest.fn().mockReturnValue(false) };
        const routerSpy = { navigate: jest.fn() };

        TestBed.configureTestingModule({
            providers: [
                UserService,
                AdaptiveStorageService,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: PlatformDetectionService, useValue: platformSpy },
                { provide: Router, useValue: routerSpy }
            ]
        });

        realService = TestBed.inject(UserService);
        realStorage = TestBed.inject(AdaptiveStorageService);
        intHttpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        intHttpMock.verify();
        localStorage.clear();
    });

    /** SERVICE TESTS */
    /* IS LOGGED IN */
    // on vérifie l'état réel du localStorage et non la valeur d'un mock
    describe('isLoggedIn()', () => {
        it('should return false when localStorage has no auth state', () => {
            expect(realService.isLoggedIn()).toBe(false);
        });

        it('should return true after a successful LoginResponse is stored', () => {
            // setAuthState est appelé nativement — empreinte réelle sur localStorage
            realStorage.setAuthState(new LoginResponse(true, 'OK', mockUser));
            expect(realService.isLoggedIn()).toBe(true);
        });
    });

    /* GET CURRENT USER */
    // idem — on lit ce qui a réellement été écrit en localStorage
    describe('getCurrentUser()', () => {
        it('should return null when localStorage has no auth state', () => {
            expect(realService.getCurrentUser()).toBeNull();
        });

        it('should return the stored user after LoginResponse is saved', () => {
            realStorage.setAuthState(new LoginResponse(true, 'OK', mockUser));
            expect(realService.getCurrentUser()).toEqual(mockUser);
        });
    });
});
