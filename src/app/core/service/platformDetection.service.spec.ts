import { PlatformDetectionService } from './platformDetection.service';

describe('PlatformDetectionService', () => {
    let service: PlatformDetectionService;

    beforeEach(() => {
        service = new PlatformDetectionService();
        // Ensure no Capacitor/Cordova globals are set
        delete (window as any).Capacitor;
        delete (window as any).cordova;
    });

    describe('Service Initialization', () => {
        it('should be created', () => {
            expect(service).toBeTruthy();
        });
    });

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
