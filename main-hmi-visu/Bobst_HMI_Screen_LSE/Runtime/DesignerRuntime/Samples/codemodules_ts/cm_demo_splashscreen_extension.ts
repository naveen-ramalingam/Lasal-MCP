// @ts-ignore
/// <reference path="../Runtime/TypeScript/types/sig-api.d.ts" />

class SplashScreenExtension {
    static init() {
        window.sigApiReadyPromise.then(() => {
            (window as any).SplashScreenExtension = new SplashScreenExtension();
            if ((window as any).SplashScreenExtension) console.log('Created Splash Screen Extension : window.SplashScreenExtension');
        });
    }

    constructor() {
        this.splashscreen = document.getElementById('lvdsplashscreeninstance');
        if (!this.splashscreen) return; // No need to register anything.
        this._overwriteSplashscreenHide();
        this._registerEvents();
    }

    evtHideSplashScreen: SigApi.Event | null;
    splashscreen: HTMLElement | null;
    hideDisabled: boolean | undefined;
    timeoutId: number | boolean | undefined;

    /**
     * @private
     * Overwrite splashscreen hide function to disable hide with flag this.hideDisabled.
     */
    _overwriteSplashscreenHide() {
        if (!this.splashscreen) return;
        this.hideDisabled = true;
        const splashscreenHide = (this.splashscreen as any).hide.bind(this.splashscreen);
        (this.splashscreen as any).hide = () => {
            if (this.hideDisabled === true) return;
            splashscreenHide();
        };
    }

    /**
     * @private
     * Subscribe to user defined events.
     * There is no need to use the sigUtils API to register event listeners because
     * global code modules such as this one are never destroyed during runtime. 
     */
    _registerEvents() {
        this.evtHideSplashScreen = window.sigApi.events.getInternalEvent('HIDE_SPLASH_SCREEN');
        if (this.evtHideSplashScreen) {
            window.sigApi.eventMediator.subscribe(
                this.evtHideSplashScreen,
                () => {
                    this._onHideSplashScreen();
                }
            );
        }
    }

    /**
     * @private
     * log the result of sigApi.events.getUserDefinedInternalEvent
     */
    _onHideSplashScreen() {
        if (!this.splashscreen) return;
        (this.splashscreen as any).addMessage('Loading User Configuration');
        if (this.timeoutId) return;
        this.timeoutId = window.sigApi.sigUtils.setTimeout(this,
            () => {
                if (this.splashscreen) {
                    (this.splashscreen as any).addMessage('Loading User Configuration finished !');
                    this.hideDisabled = false;
                    (this.splashscreen as any).hide();
                    this.timeoutId = undefined;
                }
            },
            5000
        );
    }
}

/**
 * Create the codemodule instance
 */
SplashScreenExtension.init();
