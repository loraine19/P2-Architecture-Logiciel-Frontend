import { Injectable } from '@angular/core';

/**
 * Platform detection service
 * Detects native compiled apps (Capacitor/Cordova) for mobile authentication
 * Mobile browsers are treated as web platform (cookies HTTP-only)
 */
@Injectable({
    providedIn: 'root'
})
export class PlatformDetectionService {

    // Configuration: Set to true to enable User Agent mobile detection
    private readonly ENABLE_USER_AGENT_DETECTION = false;

    /**
     * Checks if the app is running on a mobile device
     * Only detects compiled apps (Capacitor/Cordova), not mobile browsers
     * @returns {boolean} True if native mobile app environment detected
     */
    isMobile(): boolean {
        const isNativeApp = this.isCapacitor() || this.isCordova();

        if (this.ENABLE_USER_AGENT_DETECTION) {
            return isNativeApp || this.isMobileUserAgent();
        }

        return isNativeApp;
        // Mobile browsers will use web authentication (cookies HTTP-only)
    }

    /**
     * Checks if the app is running on web platform
     * @returns {boolean} True if web environment detected
     */
    isWeb(): boolean {
        return !this.isMobile();
    }

    /**
     * Detects Capacitor.js environment
     * @returns {boolean} True if Capacitor detected
     */
    private isCapacitor(): boolean {
        return !!(window as any)?.Capacitor;
    }

    /**
     * Detects Apache Cordova environment
     * @returns {boolean} True if Cordova detected
     */
    private isCordova(): boolean {
        return !!(window as any)?.cordova;
    }

    /**
     * Detects mobile device from User Agent
     * @returns {boolean} True if mobile User Agent detected
     */
    private isMobileUserAgent(): boolean {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = [
            'android', 'iphone', 'ipad', 'ipod', 'blackberry',
            'windows phone', 'mobile', 'tablet'
        ];

        return mobileKeywords.some(keyword => userAgent.includes(keyword));
    }

    /**
     * Gets the current platform type
     * @returns {'web' | 'mobile'} Current platform identifier
     */
    getPlatform(): 'web' | 'mobile' {
        return this.isMobile() ? 'mobile' : 'web';
    }

    /**
     * Logs current platform detection results for debugging
     */
    logPlatformInfo(): void {
        console.log('Platform Detection (Native Apps Only):', {
            isMobile: this.isMobile(),
            isWeb: this.isWeb(),
            platform: this.getPlatform(),
            userAgentDetection: this.ENABLE_USER_AGENT_DETECTION,
            userAgent: navigator.userAgent,
            hasCapacitor: this.isCapacitor(),
            hasCordova: this.isCordova(),
            note: 'Mobile browsers will use web authentication (cookies)'
        });
    }
}