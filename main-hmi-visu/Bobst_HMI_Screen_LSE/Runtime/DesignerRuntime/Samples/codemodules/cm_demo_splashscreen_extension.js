class SplashScreenExtension {
    static init() {
        window.sigApiReadyPromise.then(() => {
            window.SplashScreenExtension = new SplashScreenExtension();
            if (window.SplashScreenExtension)
                console.log('Created Splash Screen Extension : window.SplashScreenExtension');
        });
    }

    constructor() {
        this.splashscreen = document.getElementById('lvdsplashscreeninstance');
        if (!this.splashscreen) return; // No need to register anything.
        this._overwriteSplashscreenHide();
        this._registerEvents();
    }

    /**
     * @private
     * Overwrite splashscreen hide function to disable hide with flag this.hideDisabled.
     */
    _overwriteSplashscreenHide() {
        if (!this.splashscreen) return;
        this.hideDisabled = true;
        const splashscreenHide = this.splashscreen.hide.bind(this.splashscreen);
        this.splashscreen.hide = () => {
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
            window.sigApi.eventMediator.subscribe(this.evtHideSplashScreen, () => {
                this._onHideSplashScreen();
            });
        }
    }

    /**
     * @private
     * log the result of sigApi.events.getUserDefinedInternalEvent
     */
    _onHideSplashScreen() {
        if (!this.splashscreen) return;
        this.splashscreen.addMessage('Loading User Configuration');
        if (this.timeoutId) return;
        this.timeoutId = window.sigApi.sigUtils.setTimeout(this, () => {
            if (this.splashscreen) {
                this.splashscreen.addMessage('Loading User Configuration finished !');
                this.hideDisabled = false;
                this.splashscreen.hide();
                this.timeoutId = undefined;
            }
        }, 5000);
    }
}

/**
 * Create the codemodule instance
 */
SplashScreenExtension.init();
