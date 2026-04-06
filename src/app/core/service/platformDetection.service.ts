import { Injectable } from '@angular/core';

/**
 * Service - Detects whether the app runs in a native mobile container or a web browser
 * Supports Capacitor, Cordova, and user-agent-based detection
 */
@Injectable({
    providedIn: 'root'
})
export class PlatformDetectionService {

    // toggle to also include mobile user-agent strings in detection
    private readonly ENABLE_USER_AGENT_DETECTION = true;

    /** PUBLIC */
    /* IS MOBILE */
    isMobile(): boolean {
        const isNativeApp = this.isCapacitor() || this.isCordova();

        if (this.ENABLE_USER_AGENT_DETECTION) {
            return isNativeApp || this.isMobileUserAgent();
        }

        return isNativeApp;
    }

    /* IS WEB */
    isWeb(): boolean {
        return !this.isMobile();
    }

    /* GET PLATFORM */
    getPlatform(): 'web' | 'mobile' {
        return this.isMobile() ? 'mobile' : 'web';
    }

    /** PRIVATE */
    /* IS CAPACITOR */
    private isCapacitor(): boolean {
        return !!(window as any)?.Capacitor;
    }

    /* IS CORDOVA */
    private isCordova(): boolean {
        return !!(window as any)?.cordova;
    }

    /* IS MOBILE USER AGENT */
    private isMobileUserAgent(): boolean {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = [
            'android', 'iphone', 'ipad', 'ipod', 'blackberry',
            'windows phone', 'mobile', 'tablet'
        ];
        return mobileKeywords.some(keyword => userAgent.includes(keyword));
    }
}