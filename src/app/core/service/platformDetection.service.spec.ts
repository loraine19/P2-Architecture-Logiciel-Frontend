import { PlatformDetectionService } from './platformDetection.service';

/**
 * Unit tests for PlatformDetectionService — mobile and web platform detection
 * navigator.userAgent is overridden in each test using Object.defineProperty
 * Capacitor and Cordova globals are deleted in beforeEach to start from a clean slate
 */

describe('PlatformDetectionService', () => {
    let service: PlatformDetectionService;

    /** TEST SETUP */
    /* beforeEach */
    // creates a new instance directly — no TestBed needed since PlatformDetectionService has no dependencies
    beforeEach(() => {
        service = new PlatformDetectionService();
        // remove any leftover Capacitor / Cordova globals so tests start isolated
        delete (window as any).Capacitor;
        delete (window as any).cordova;
    });

    /** SERVICE TESTS */
    /* SERVICE INITIALIZATION */
    describe('Service Initialization', () => {
        it('should be created', () => {
            expect(service).toBeTruthy();
        });
    });

    /* IS MOBILE */
    // Object.defineProperty overrides the read-only userAgent — configurable:true allows redefining it in the next test
    describe('isMobile()', () => {
        it('should return false on desktop user agent', () => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0',
                configurable: true
            });
            expect(service.isMobile()).toBe(false);
        });

        it('should return true for Android user agent', () => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36',
                configurable: true
            });
            expect(service.isMobile()).toBe(true);
        });

        it('should return true for iPhone user agent', () => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
                configurable: true
            });
            expect(service.isMobile()).toBe(true);
        });

        // Capacitor is the native mobile bridge — its presence means the app runs in a native container
        it('should return true when Capacitor is present', () => {
            (window as any).Capacitor = {};
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (X11; Linux x86_64)',
                configurable: true
            });
            expect(service.isMobile()).toBe(true);
            delete (window as any).Capacitor;
        });
    });

    /* IS WEB */
    describe('isWeb()', () => {
        it('should return true on desktop', () => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0',
                configurable: true
            });
            expect(service.isWeb()).toBe(true);
        });

        it('should return false on mobile', () => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36',
                configurable: true
            });
            expect(service.isWeb()).toBe(false);
        });
    });

    /* GET PLATFORM */
    describe('getPlatform()', () => {
        it('should return "web" on desktop', () => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
                configurable: true
            });
            expect(service.getPlatform()).toBe('web');
        });

        it('should return "mobile" on mobile', () => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36',
                configurable: true
            });
            expect(service.getPlatform()).toBe('mobile');
        });
    });
});
