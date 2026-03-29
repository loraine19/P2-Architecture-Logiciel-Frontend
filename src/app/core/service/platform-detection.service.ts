import { Injectable } from '@angular/core';

/**
 * Platform detection service
 * Detects native apps (Capacitor/Cordova) vs web browsers
 */
@Injectable({
    providedIn: 'root'
})
export class PlatformDetectionService {

    private readonly ENABLE_USER_AGENT_DETECTION = true;

    isMobile(): boolean {
        const isNativeApp = this.isCapacitor() || this.isCordova();

        if (this.ENABLE_USER_AGENT_DETECTION) {
            return isNativeApp || this.isMobileUserAgent();
        }

        return isNativeApp;
    }

    isWeb(): boolean {
        return !this.isMobile();
    }

    getPlatform(): 'web' | 'mobile' {
        return this.isMobile() ? 'mobile' : 'web';
    }

    private isCapacitor(): boolean {
        return !!(window as any)?.Capacitor;
    }

    private isCordova(): boolean {
        return !!(window as any)?.cordova;
    }

    private isMobileUserAgent(): boolean {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = [
            'android', 'iphone', 'ipad', 'ipod', 'blackberry',
            'windows phone', 'mobile', 'tablet'
        ];
        return mobileKeywords.some(keyword => userAgent.includes(keyword));
    }
}