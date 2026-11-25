const $_documentContainer = document.createElement('template');
$_documentContainer.innerHTML = `<custom-style>
    <style>
html {
   font-family: roboto-regular;
   font-size: 16px;
}
sig-dependency-loader {
   --theme-sig-dependency-loader-background-color: #082B3E;
   --theme-sig-dependency-loader-color: #C2C4C5;
   --theme-sig-dependency-loader-logo-color: #2D82BC;
   --theme-sig-dependency-loader-color-count: #C2C4C5;
   --theme-sig-dependency-loader-progress-bar-background-color: rgba(147,152,154,0.2);
   --theme-sig-dependency-loader-progress-finished-background-color: #05698D;
   --theme-sig-dependency-loader-reload-color: #2D82BC;
   --theme-sig-dependency-loader-color-info: #C2C4C5;
   --theme-sig-dependency-loader-color-warn: #FFFF28;
   --theme-sig-dependency-loader-color-error: #DE453B;
   --theme-sig-dependency-loader-critical-error-background-color: #DE453B;
   --theme-sig-dependency-loader-critical-error-color: #FFFFFF;
   --theme-sig-dependency-loader-font-size: 14px;
   --theme-sig-dependency-loader-font-family: 'Roboto',sans-serif;
   --theme-sig-dependency-loader-progress-width: 50%;
   --theme-sig-dependency-loader-progress-bar-height: 20px;
   --theme-sig-dependency-loader-progress-bar-border-radius: 0px;
   --theme-sig-dependency-loader-progress-bar-margin-top: 0px;
   --theme-sig-dependency-loader-progress-bar-margin-bottom: 10px;
   --theme-sig-dependency-loader-progress-bar-text-align: center;
   --theme-sig-dependency-loader-progress-count-margin-top: 0px;
   --theme-sig-dependency-loader-progress-count-margin-bottom: 4px;
   --theme-sig-dependency-loader-progress-count-text-align: center;
   --theme-sig-dependency-loader-logo-width: auto;
   --theme-sig-dependency-loader-logo-height: auto;
   --theme-sig-dependency-loader-logo-margin-top: 0px;
   --theme-sig-dependency-loader-logo-margin-bottom: 4px;
   --theme-sig-dependency-loader-logo-text-align: center;
   --theme-sig-dependency-loader-messages-font-size: 12px;
   --theme-sig-dependency-loader-messages-font-family: inherit;
   --theme-sig-dependency-loader-messages-margin-top: 0px;
   --theme-sig-dependency-loader-messages-margin-bottom: 10px;
   --theme-sig-dependency-loader-message-margin-bottom: 4px;
   --theme-sig-dependency-loader-message-text-align: left;
   --theme-sig-dependency-loader-message-white-space: wrap;
   --theme-sig-dependency-loader-message-line-height: 115%;
   --theme-sig-dependency-loader-reload-width: auto;
   --theme-sig-dependency-loader-reload-height: auto;
   --theme-sig-dependency-loader-reload-margin-top: 0px;
   --theme-sig-dependency-loader-reload-margin-bottom: 4px;
}
sig-element-mixins {
}
.__menu {
   --theme-sig-control-menu-li-color: #FFFFFF;
   --theme-sig-control-menu-li-selected-color: #000000;
   --theme-sig-control-submenu-li-selected-color: #000000;
   --theme-sig-control-menu-li-background-color: #13556D;
   --theme-sig-control-menu-li-selected-background-color: #AFC81A;
   --theme-sig-control-submenu-li-selected-background-color: #AFC81A;
   --theme-sig-control-menu-ul-background-color: #082B3E;
   --theme-sig-control-menu-min-height: 50px;
   --theme-sig-control-menu-li-line-height: 50px;
   --theme-sig-control-menu-ul-shadow-color: #2F2F2F;
   --theme-sig-control-menu-li-inactive-background-color: #A0A0A0;
   --theme-sig-control-menu-li-inactive-color: #000000;
   --theme-sig-control-submenu-li-color: #000000;
}
sig-control-splash-screen {
   --theme-sig-control-splash-screen-background-color: #07526D;
   --theme-sig-control-splash-screen-spinner-color: #FFFFFF;
   --theme-sig-control-splash-screen-reload-button-border-radius: 3px;
   --theme-sig-control-splash-screen-reload-button-color: #FFFFFF;
   --theme-sig-control-splash-screen-msg-warning-background-color: #FFFF28;
   --theme-sig-control-splash-screen-msg-error-background-color: #DE453B;
   --theme-sig-control-splash-screen-msg-error-color: #FFFFFF;
   --theme-sig-control-splash-screen-message-font-size: 16px;
   --theme-sig-control-splash-screen-reload-button-size: 200px;
   --theme-sig-control-splash-screen-font-size: 18px;
   --theme-sig-control-splash-screen-reload-button-background-color: #00ACC4;
   --theme-sig-control-splash-screen-reload-button-border-color: #FFFFFF;
   --theme-sig-control-splash-screen-msg-info-color: #FFFFFF;
   --theme-sig-control-splash-screen-msg-warning-color: #000000;
   --theme-sig-control-splash-screen-reload-button-border-style: solid;
   --theme-sig-control-splash-screen-reload-button-border-width: 1px;
   --theme-sig-control-splash-screen-animation-duration: 1s;
}
.jsPanel-content {
   --theme-sig-control-scrollbar-track-active-border-color: #000000;
   --theme-sig-control-scrollbar-track-border-color: #000000;
   --theme-sig-control-scrollbar-button-background-color: #000000;
   --theme-sig-control-scrollbar-button-active-background-color: #000000;
   --theme-sig-control-scrollbar-thumb-active-background-color: #AFC81A;
   --theme-sig-control-scrollbar-thumb-background-color: #023F5F;
   --theme-sig-control-scrollbar-track-active-background-color: #D2D2D2;
   --theme-sig-control-scrollbar-track-background-color: #D2D2D2;
   --theme-sig-control-scrollbar-button-color: #D2D2D2;
   --theme-sig-control-scrollbar-width: 50px;
   --theme-sig-control-scrollbar-button-height: 45px;
   --theme-sig-control-scrollbar-thumb-border-radius: 3px;
   --theme-sig-control-scrollbar-thumb-border-left-width: 12px;
   --theme-sig-control-scrollbar-thumb-border-right-width: 12px;
   --theme-sig-control-scrollbar-track-border-left-width: 12px;
   --theme-sig-control-scrollbar-track-border-right-width: 12px;
   --theme-sig-control-scrollbar-thumb-active-border-color: #000000;
   --theme-sig-control-scrollbar-thumb-border-bottom-width: 0px;
   --theme-sig-control-scrollbar-thumb-border-top-width: 0px;
   --theme-sig-control-scrollbar-thumb-border-color: #000000;
   --theme-sig-control-scrollbar-button-active-color: #D2D2D2;
   --theme-sig-control-scrollbar-background-color: #000000;
   --theme-sig-control-scrollbar-track-border-width: 0px;
   --theme-sig-control-scrollbar-track-border-top-width: 1px;
   --theme-sig-control-scrollbar-track-border-bottom-width: 1px;
   --theme-sig-control-scrollbar-track-border-style: solid;
   --theme-sig-control-scrollbar-track-border-radius: 0px;
   --theme-sig-control-scrollbar-thumb-border-width: 0px;
   --theme-sig-control-scrollbar-thumb-border-style: solid;
   --theme-sig-control-scrollbar-button-border-width: 0px;
   --theme-sig-control-scrollbar-button-border-style: none;
   --theme-sig-control-scrollbar-button-border-radius: 0px;
}
.jsPanel-theme-keyboard {
   --theme-sig-window-panel-content-background-color: #082B3E;
   --theme-sig-window-panel-hdr-background-color: #023F5F;
   --theme-sig-window-panel-hdr-color: #FFFFFF;
   --theme-sig-window-panel-icon-size: 30px;
   --theme-sig-window-panel-content-border-top-height: 0px;
   --theme-sig-window-panel-border-color: #93989A;
   --theme-sig-window-panel-content-border-top-color: #93989A;
}
.jsPanel-theme-keyboard.__lvdStyle_AlphaKeyboardContainer {
   --theme-sig-element-width: 905px;
   --theme-sig-element-height: 390px;
}
.jsPanel-theme-keyboard.__lvdStyle_NumericKeyboardContainer {
   --theme-sig-element-width: 300px;
   --theme-sig-element-height: 385px;
}
.jsPanel-theme-keyboard.__lvdStyle_DateKeyboardContainer {
   --theme-sig-element-width: 300px;
   --theme-sig-element-height: 360px;
}
.jsPanel-theme-keyboard.__lvdStyle_HexKeyboardContainer {
   --theme-sig-element-width: 370px;
   --theme-sig-element-height: 360px;
}
.jsPanel-theme-keyboard.__lvdStyle_Ipv4KeyboardContainer {
   --theme-sig-element-width: 300px;
   --theme-sig-element-height: 360px;
}
.jsPanel-theme-keyboard.__lvdStyle_TimeKeyboardContainer {
   --theme-sig-element-width: 300px;
   --theme-sig-element-height: 365px;
}
.jsPanel-theme-default {
   --theme-sig-window-panel-hdr-color: #FFFFFF;
   --theme-sig-window-panel-border-color: #93989A;
   --theme-sig-window-panel-border-style: solid;
   --theme-sig-window-panel-content-background-color: #082B3E;
   --theme-sig-window-panel-content-border-top-color: #93989A;
   --theme-sig-window-panel-hdr-background-color: #023F5F;
   --theme-sig-window-panel-border-radius: 3px;
   --theme-sig-window-panel-icon-size: 25px;
   --theme-sig-window-panel-modal-background-color: rgba(8,43,62,0.4);
   --theme-sig-window-panel-border-width: 1px;
}
sig-control-input {
   --theme-sig-control-input-background-color: #13556D;
   --theme-sig-control-input-color: #FFFFFF;
   --theme-sig-control-input-border-width: 0px;
   --theme-sig-control-input-border-style: none;
   --theme-sig-control-input-border-color: #93989A;
   --theme-sig-control-input-value-active-background-color: #AEC81A;
   --theme-sig-control-input-activ-border-color: #93989A;
   --theme-sig-control-input-background-color-stop: rgba(255,255,255,0);
   --theme-sig-control-input-border-color-stop: rgba(255,255,255,0);
   --theme-sig-control-input-shadow-color: #000000;
   --theme-sig-control-input-value-active-background-color-stop: rgba(255,255,255,0);
   --theme-sig-control-input-value-active-color: #000000;
   --theme-sig-control-input-activ-border-color-stop: rgba(255,255,255,0);
   --theme-sig-control-input-pressed-shadow-color: #000000;
   --theme-sig-control-input-value-background-color: #D7D7D7;
   --theme-sig-control-input-font-size: 11px;
   --theme-sig-control-input-margin-leftright: 0px;
   --theme-sig-control-input-margin-top: 0px;
}
sig-control-rectangle {
   --theme-sig-control-rectangle-border-radius: 3px;
   --theme-sig-control-rectangle-background-color: rgba(255,255,255,0);
   --theme-sig-control-rectangle-border-color: #FFFFFF;
   --theme-sig-control-rectangle-border-width: 1px;
   --theme-sig-control-rectangle-border-style: solid;
}
sig-control-text {
   --theme-sig-control-text-color: #FFFFFF;
   --theme-sig-control-text-border-color: #93989A;
   --theme-sig-control-text-background-color: rgba(255,255,255,0);
   --theme-sig-control-text-value-padding: 3px;
   --theme-sig-control-text-font-size: 11px;
   --theme-sig-control-text-value-text-shadow: none;
}
sig-control-led {
   --theme-sig-control-led-background-color: rgba(255,255,255,0);
   --theme-sig-control-led-pressed-background-color: #AFC81A;
   --theme-sig-control-led-border-color: #93989A;
   --theme-sig-control-led-border-width: 1px;
   --theme-sig-control-led-border-style: solid;
   --theme-sig-control-led-border-radius-top-left: 2px;
   --theme-sig-control-led-border-radius-top-right: 2px;
   --theme-sig-control-led-border-radius-bottom-right: 2px;
   --theme-sig-control-led-border-radius-bottom-left: 2px;
   --theme-sig-control-led-background-image: none;
   --theme-sig-control-led-background-position-x: center;
   --theme-sig-control-led-background-position-y: center;
   --theme-sig-control-led-background-size: cover;
   --theme-sig-control-led-pressed-background-image: inherit;
}
sig-control-button {
   --theme-sig-control-button-border-width: 1px;
   --theme-sig-control-button-background-color: #00ACC4;
   --theme-sig-control-button-color: #FFFFFF;
   --theme-sig-control-button-border-color: #FFFFFF;
   --theme-sig-control-button-pressed-background-color: rgba(2,63,95,0.6);
   --theme-sig-control-button-pressed-color: #FFFFFF;
   --theme-sig-control-button-pressed-border-color: #FFFFFF;
   --theme-sig-control-button-pressed-border-color-stop: #FFFFFF;
   --theme-sig-control-button-shadow-color: #000000;
   --theme-sig-control-button-border-color-stop: rgba(255,255,255,0);
   --theme-sig-control-button-pressed-shadow-color: #000000;
   --theme-sig-control-button-pressed-background-color-stop: rgba(2,21,51,0.6);
   --theme-sig-control-button-background-color-stop: #3C6BAA;
   --theme-sig-control-button-font-size: 11px;
}
sig-control-button.__lvdStyle_FileManagerButtons {
   --theme-sig-element-width: 50px;
   --theme-sig-element-height: 50px;
}
sig-window-layer {
}
sig-dashboard {
}
sig-wrapper {
}
sig-alert {
}
sig-keyboard {
   --theme-sig-keyboard-key-special-selected-border-top-color: #01456B;
   --theme-sig-keyboard-key-special-selected-border-left-color: #01456B;
   --theme-sig-keyboard-key-special-selected-border-right-color: #01456B;
   --theme-sig-keyboard-key-special-selected-border-bottom-color: #01456B;
   --theme-sig-keyboard-key-special-border-bottom-color: #01456B;
   --theme-sig-keyboard-key-special-border-right-color: #01456B;
   --theme-sig-keyboard-key-special-border-left-color: #01456B;
   --theme-sig-keyboard-key-special-border-top-color: #01456B;
   --theme-sig-keyboard-key-off-border-bottom-color: #01456B;
   --theme-sig-keyboard-key-off-border-right-color: #01456B;
   --theme-sig-keyboard-key-off-border-left-color: #01456B;
   --theme-sig-keyboard-key-off-border-top-color: #01456B;
   --theme-sig-keyboard-key-pressed-border-bottom-color: #01456B;
   --theme-sig-keyboard-key-pressed-border-right-color: #01456B;
   --theme-sig-keyboard-key-pressed-border-left-color: #01456B;
   --theme-sig-keyboard-key-pressed-border-top-color: #01456B;
   --theme-sig-keyboard-key-border-bottom-color: #01456B;
   --theme-sig-keyboard-key-border-right-color: #01456B;
   --theme-sig-keyboard-key-border-left-color: #01456B;
   --theme-sig-keyboard-key-border-top-color: #01456B;
   --theme-sig-keyboard-background-color: #082B3E;
   --theme-sig-keyboard-border-color: #93989A;
   --theme-sig-keyboard-input-inactive-background-color: #5B9EB3;
   --theme-sig-keyboard-input-inactive-color: #FFFFFF;
   --theme-sig-keyboard-input-inactive-bottom-color: #FFFFFF;
   --theme-sig-keyboard-input-background-color: #5B9EB3;
   --theme-sig-keyboard-input-color: #FFFFFF;
   --theme-sig-keyboard-info-color: #FFFFFF;
   --theme-sig-keyboard-key-background-color: rgba(15,159,251,0.1);
   --theme-sig-keyboard-key-color: #FFFFFF;
   --theme-sig-keyboard-key-pressed-background-color: rgba(24,135,206,0.1);
   --theme-sig-keyboard-key-pressed-color: #FFFFFF;
   --theme-sig-keyboard-key-off-color: #FFFFFF;
   --theme-sig-keyboard-key-accept-background-color: #355CD7;
   --theme-sig-keyboard-key-cancel-background-color: #EE1313;
   --theme-sig-keyboard-key-accept-color: #FFFFFF;
   --theme-sig-keyboard-key-cancel-color: #FFFFFF;
   --theme-sig-keyboard-key-special-color: #FFFFFF;
   --theme-sig-keyboard-key-margin-right: 3px;
   --theme-sig-keyboard-key-margin-bottom: 3px;
   --theme-sig-keyboard-key-min-width: 55px;
   --theme-sig-keyboard-key-line-height: 55px;
   --theme-sig-keyboard-key-font-size: 25px;
   --theme-sig-keyboard-info-font-size: 16px;
   --theme-sig-keyboard-input-min-height: 45px;
   --theme-sig-keyboard-input-font-size: 25px;
   --theme-sig-keyboard-input-unit-font-size: 25px;
   --theme-sig-keyboard-key-special-background-color: rgba(15,159,251,0.1);
   --theme-sig-keyboard-input-invalid-bottom-color: #EE1313;
   --theme-sig-keyboard-input-invalid-color: #FFFFFF;
   --theme-sig-keyboard-key-off-background-color: rgba(24,135,206,0.1);
   --theme-sig-keyboard-border-radius: 3px;
   --theme-sig-keyboard-info-tag-color: #C2C4C5;
   --theme-sig-keyboard-info-tag-span-color: #FFFFFF;
   --theme-sig-keyboard-info-tag-background-color: #2A2A2A;
   --theme-sig-keyboard-input-border-bottom-color: #000000;
   --theme-sig-keyboard-input-invalid-background-color: #00A8A8;
   --theme-sig-keyboard-key-special-selected-background-color: #AFC81A;
   --theme-sig-keyboard-key-special-selected-color: #000000;
   --theme-sig-keyboard-disabled-overlay-background-color: rgba(42,42,42,0.3);
   --theme-sig-keyboard-sb-background-color: rgba(15,159,251,0.1);
   --theme-sig-keyboard-sb-border-color: #FFFFFF;
   --theme-sig-keyboard-sb-scrollbar-background-color: #AFC81A;
   --theme-sig-keyboard-sb-suggestion-color: #FFFFFF;
   --theme-sig-keyboard-sb-suggestion-background-color: rgba(255,255,255,0);
   --theme-sig-keyboard-sb-suggestion-border-color: rgba(255,255,255,0);
   --theme-sig-keyboard-sb-suggestion-color-hover: #FFFFFF;
   --theme-sig-keyboard-sb-suggestion-background-color-hover: #00ACC4;
   --theme-sig-keyboard-sb-suggestion-border-color-hover: #00ACC4;
   --theme-sig-keyboard-sb-suggestion-color-selected: #FFFFFF;
   --theme-sig-keyboard-sb-suggestion-background-color-selected: #AFC81A;
   --theme-sig-keyboard-sb-suggestion-border-color-selected: #AFC81A;
   --theme-sig-keyboard-sb-button-color: #93989A;
   --theme-sig-keyboard-sb-button-background-color: rgba(255,255,255,0);
   --theme-sig-keyboard-sb-button-border-color: rgba(255,255,255,0);
   --theme-sig-keyboard-sb-button-color-hover: #FFFFFF;
   --theme-sig-keyboard-sb-button-background-color-hover: rgba(255,255,255,0);
   --theme-sig-keyboard-sb-button-border-color-hover: rgba(255,255,255,0);
   --theme-sig-keyboard-sb-button-color-disabled: rgba(160,160,160,0.2);
   --theme-sig-keyboard-sb-button-background-color-disabled: rgba(255,255,255,0);
   --theme-sig-keyboard-sb-button-border-color-disabled: rgba(255,255,255,0);
   --theme-sig-keyboard-grid-column-gap: 3px;
   --theme-sig-keyboard-grid-row-gap: 3px;
   --theme-sig-keyboard-sb-button-border-style: none;
   --theme-sig-keyboard-sb-button-border-radius: 25px;
   --theme-sig-keyboard-sb-button-font-size: 25px;
   --theme-sig-keyboard-sb-suggestion-margin-vertical: 0px;
   --theme-sig-keyboard-sb-suggestion-padding-horizontal: 16px;
   --theme-sig-keyboard-sb-suggestion-padding-vertical: 0px;
   --theme-sig-keyboard-sb-suggestion-margin-horizontal: 0px;
   --theme-sig-keyboard-sb-suggestion-border-radius: 0px;
   --theme-sig-keyboard-key-accept-phrase-active-color: #FFFFFF;
   --theme-sig-keyboard-key-accept-phrase-active-background-color: #AEC81A;
   --theme-sig-keyboard-keyshell-padding: 8px;
   --theme-sig-keyboard-keyshell-min-width: 200px;
   --theme-sig-keyboard-keyshell-padding-horizontal: 7px;
   --theme-sig-keyboard-keyshell-padding-vertical: 0px;
   --theme-sig-keyboard-layers-marging-bottom: 7px;
   --theme-sig-keyboard-input-margin-top: 12px;
   --theme-sig-keyboard-input-margin-bottom: 8px;
   --theme-sig-keyboard-type-background-color: #A0A0A0;
   --theme-sig-keyboard-type-color: #2F2F2F;
   --theme-sig-keyboard-key-border-top-width: 1px;
   --theme-sig-keyboard-key-border-top-style: solid;
   --theme-sig-keyboard-key-border-left-width: 1px;
   --theme-sig-keyboard-key-border-left-style: solid;
   --theme-sig-keyboard-key-border-right-width: 1px;
   --theme-sig-keyboard-key-border-right-style: solid;
   --theme-sig-keyboard-key-border-bottom-width: 1px;
   --theme-sig-keyboard-key-border-bottom-style: solid;
   --theme-sig-keyboard-key-border-radius: 0px;
   --theme-sig-keyboard-key-off-border-top-width: 1px;
   --theme-sig-keyboard-key-off-border-top-style: solid;
   --theme-sig-keyboard-key-off-border-left-width: 1px;
   --theme-sig-keyboard-key-off-border-left-style: solid;
   --theme-sig-keyboard-key-off-border-right-width: 1px;
   --theme-sig-keyboard-key-off-border-right-style: solid;
   --theme-sig-keyboard-key-off-border-bottom-width: 1px;
   --theme-sig-keyboard-key-off-border-bottom-style: solid;
   --theme-sig-keyboard-key-pressed-border-top-width: 1px;
   --theme-sig-keyboard-key-pressed-border-top-style: solid;
   --theme-sig-keyboard-key-pressed-border-left-width: 1px;
   --theme-sig-keyboard-key-pressed-border-left-style: solid;
   --theme-sig-keyboard-key-pressed-border-right-width: 1px;
   --theme-sig-keyboard-key-pressed-border-right-style: solid;
   --theme-sig-keyboard-key-pressed-border-bottom-width: 1px;
   --theme-sig-keyboard-key-pressed-border-bottom-style: solid;
   --theme-sig-keyboard-key-special-alpha-min-width: 50px;
   --theme-sig-keyboard-key-special-border-top-width: 1px;
   --theme-sig-keyboard-key-special-border-top-style: solid;
   --theme-sig-keyboard-key-special-border-left-width: 1px;
   --theme-sig-keyboard-key-special-border-left-style: solid;
   --theme-sig-keyboard-key-special-border-right-width: 1px;
   --theme-sig-keyboard-key-special-border-right-style: solid;
   --theme-sig-keyboard-key-special-border-bottom-width: 1px;
   --theme-sig-keyboard-key-special-border-bottom-style: solid;
   --theme-sig-keyboard-key-special-selected-border-top-width: 1px;
   --theme-sig-keyboard-key-special-selected-border-top-style: solid;
   --theme-sig-keyboard-key-special-selected-border-left-width: 1px;
   --theme-sig-keyboard-key-special-selected-border-left-style: solid;
   --theme-sig-keyboard-key-special-selected-border-right-width: 1px;
   --theme-sig-keyboard-key-special-selected-border-right-style: solid;
   --theme-sig-keyboard-key-special-selected-border-bottom-width: 1px;
   --theme-sig-keyboard-key-special-selected-border-bottom-style: solid;
   --theme-sig-keyboard-close-color: #FFFFFF;
   --theme-sig-keyboard-close-background-color: #007FC5;
   --theme-sig-keyboard-title-color: #FFFFFF;
   --theme-sig-keyboard-title-background-color: #007FC5;
   --theme-sig-keyboard-title-height: 25px;
   --theme-sig-keyboard-title-font-size: 13px;
   --theme-sig-keyboard-sb-height: 44px;
   --theme-sig-keyboard-sb-border-style: none;
   --theme-sig-keyboard-sb-border-width: 0px;
   --theme-sig-keyboard-sb-border-radius: 0px;
   --theme-sig-keyboard-sb-margin-bottom: 7px;
   --theme-sig-keyboard-sb-opacity-disabled: 0.8;
   --theme-sig-keyboard-sb-layer-marging-bottom: 7px;
   --theme-sig-keyboard-sb-scrollbar-height: 3px;
   --theme-sig-keyboard-sb-suggestion-border-width: 1px;
   --theme-sig-keyboard-sb-suggestion-border-style: solid;
   --theme-sig-keyboard-sb-suggestion-font-size: 14px;
   --theme-sig-keyboard-sb-button-width: 40px;
   --theme-sig-keyboard-sb-button-border-width: 1px;
}
sig-keyboard.__lvdStyle_AlphaKeyboard {
   --theme-sig-element-width: 900px;
   --theme-sig-element-height: 380px;
}
sig-keyboard.__lvdStyle_NumericKeyboard {
   --theme-sig-element-width: 300px;
   --theme-sig-element-height: 380px;
   --theme-sig-keyboard-key-min-height: 62px;
   --theme-sig-keyboard-key-min-width: 65px;
   --theme-sig-keyboard-info-font-size: 20px;
}
sig-keyboard.__lvdStyle_DateKeyboard {
   --theme-sig-element-width: 300px;
   --theme-sig-element-height: 340px;
   --theme-sig-keyboard-key-min-height: 62px;
   --theme-sig-keyboard-key-min-width: 65px;
   --theme-sig-keyboard-info-font-size: 20px;
}
sig-keyboard.__lvdStyle_HexKeyboard {
   --theme-sig-element-width: 370px;
   --theme-sig-element-height: 340px;
   --theme-sig-keyboard-key-min-height: 62px;
   --theme-sig-keyboard-key-min-width: 65px;
   --theme-sig-keyboard-info-font-size: 20px;
}
sig-keyboard.__lvdStyle_Ipv4Keyboard {
   --theme-sig-element-width: 300px;
   --theme-sig-element-height: 340px;
   --theme-sig-keyboard-key-min-height: 62px;
   --theme-sig-keyboard-key-min-width: 65px;
   --theme-sig-keyboard-info-font-size: 20px;
}
sig-keyboard.__lvdStyle_TimeKeyboard {
   --theme-sig-element-width: 300px;
   --theme-sig-element-height: 340px;
   --theme-sig-keyboard-key-min-height: 62px;
   --theme-sig-keyboard-key-min-width: 65px;
   --theme-sig-keyboard-info-font-size: 20px;
}
 {
}
 {
}
 {
}
sig-composite-control {
}
sig-control-titlebar {
   --theme-sig-control-titlebar-background-color: #007FC5;
   --theme-sig-control-titlebar-border-width: 0;
   --theme-sig-control-titlebar-border-style: none;
   --theme-sig-control-titlebar-color: #FFFFFF;
   --theme-sig-control-titlebar-border-shadow-color: #000000;
}
sig-control-image {
   --theme-sig-control-image-background-color: rgba(255,255,255,0);
   --theme-sig-control-image-border-color: rgba(255,255,255,0);
}
sig-control-listview {
   --theme-sig-control-listview-background-color: #EBEBEB;
   --theme-sig-control-listview-border-color: rgba(255,255,255,0);
   --theme-sig-control-listview-header-background-color: #000000;
   --theme-sig-control-listview-header-color: #FFFFFF;
   --theme-sig-listview-header-symbol-color: #A0A0A0;
   --theme-sig-listview-header-symbol-active-color: #FFFFFF;
   --theme-sig-control-listview-row-marked-background-color: #00C5FF;
   --theme-sig-control-listview-row-marked-color: #2F2F2F;
   --theme-sig-control-listview-row-even-background-color: #EBEBEB;
   --theme-sig-control-listview-row-even-color: #2F2F2F;
   --theme-sig-control-listview-row-odd-background-color: #EBEBEB;
   --theme-sig-control-listview-row-odd-color: #2F2F2F;
   --theme-sig-control-listview-row-active-background-color: #AFC81A;
   --theme-sig-control-listview-row-active-color: #2F2F2F;
   --theme-sig-control-listview-row-active-marked-color: #FFFFFF;
   --theme-sig-control-listview-spinner-color: #AFC81A;
   --theme-sig-control-listview-cellseparator-color: #FFFFFF;
   --theme-sig-control-listview-lineseparator-color: #FFFFFF;
}
sig-control-enum-list {
   --theme-sig-control-enum-list-background-color: #FFFFFF;
   --theme-sig-control-enum-list-option-background-color-even: rgba(255,255,255,0);
   --theme-sig-control-enum-list-option-color-even: #28322D;
   --theme-sig-control-enum-list-option-background-color-odd: rgba(255,255,255,0);
   --theme-sig-control-enum-list-option-color-odd: #28322D;
   --theme-sig-control-enum-list-font-size: 11px;
   --theme-sig-control-enum-list-option-color-selected: #000000;
   --theme-sig-control-enum-list-option-background-color-selected: #AFC81A;
   --theme-sig-control-enum-list-border-color: #28322D;
}
sig-composite-container {
}
sig-control-alarmlist2 {
   --theme-sig-control-alarmlist2-alarmgrid-row-selected-background-color: #AFC81A;
   --theme-sig-control-alarmlist2-alarmgrid-row-marked-background-color: #AFC81A;
   --theme-sig-control-alarmlist2-alarmgrid-row-selected-color: #000000;
   --theme-sig-control-alarmlist2-alarmgrid-row-marked-color: #000000;
   --theme-sig-control-alarmlist2-background-color: rgba(255,255,255,0);
   --theme-sig-control-alarmlist2-border-color: #A0A0A0;
   --theme-sig-control-alarmlist2-overlay-background-color: #FFFFFF;
   --theme-sig-control-alarmlist2-overlay-text-color: #000000;
   --theme-sig-control-alarmlist2-overlay-border-color: rgba(255,255,255,0);
}
sig-control-output {
   --theme-sig-control-output-border-width: 1px;
   --theme-sig-control-output-border-style: solid;
   --theme-sig-control-output-color: #FFFFFF;
   --theme-sig-control-output-border-color: #3C6BAA;
   --theme-sig-control-output-unit-color: #FFFFFF;
   --theme-sig-control-output-background-color: rgba(0,0,0,0);
   --theme-sig-control-output-background-color-stop: rgba(255,255,255,0);
   --theme-sig-control-output-border-color-stop: rgba(255,255,255,0);
   --theme-sig-control-output-shadow-color: #000000;
   --theme-sig-control-output-font-size: 11px;
   --theme-sig-control-output-value-text-shadow: none;
   --theme-sig-control-output-border-radius: 3px;
}
sig-control-numeric-input {
   --theme-sig-control-numeric-input-background-color: #FFFFFF;
   --theme-sig-control-numeric-input-value-background-color: #C4C0C0;
   --theme-sig-control-numeric-input-value-active-color: #000000;
   --theme-sig-control-numeric-input-value-active-background-color: #AFC81A;
   --theme-sig-control-numeric-input-value-active-background-color-stop: rgba(255,255,255,0);
   --theme-sig-control-numeric-input-font-size: 11px;
   --theme-sig-control-numeric-input-color: #28322D;
   --theme-sig-control-numeric-input-border-color: #28322D;
   --theme-sig-control-numeric-input-border-width: 1px;
   --theme-sig-control-numeric-input-border-style: solid;
   --theme-sig-control-numeric-input-margin-leftright: 0px;
   --theme-sig-control-numeric-input-margin-top: 0px;
   --theme-sig-control-numeric-input-led-border-width: 1px;
   --theme-sig-control-numeric-input-led-border-color: #000000;
   --theme-sig-control-numeric-input-led-border-style: solid;
   --theme-sig-control-numeric-input-led-background-color: #CCC;
   --theme-sig-control-numeric-input-led-pressed-background-color: #070;
   --theme-sig-control-numeric-input-background-color-stop: rgba(255,255,255,0);
   --theme-sig-control-numeric-input-border-color-stop: rgba(255,255,255,0);
   --theme-sig-control-numeric-input-activ-border-color: #28322D;
   --theme-sig-control-numeric-input-activ-border-color-stop: rgba(255,255,255,0);
   --theme-sig-control-numeric-input-pressed-shadow-color: rgba(255,255,255,0);
   --theme-sig-control-numeric-input-unit-color: #28322D;
   --theme-sig-control-numeric-input-shadow-color: #000000;
}
sig-control-line-simple {
   --theme-sig-control-line-simple-border-width: 1px;
   --theme-sig-control-line-simple-border-style: solid;
   --theme-sig-control-line-simple-border-color: #FFFFFF;
   --theme-sig-control-line-simple-background-color: rgba(255,255,255,0);
   --theme-sig-control-line-simple-line-color: #FFFFFF;
}
sig-control-svg-container {
}
sig-control-slider {
   --theme-sig-control-slider-background-color: rgba(255,255,255,0);
   --theme-sig-control-slider-border-color: rgba(255,255,255,0);
   --theme-sig-control-slider-handle-background-color: #28322D;
   --theme-sig-control-slider-handle-moving-background-color: #28322D;
   --theme-sig-control-slider-handle-border-color: rgba(255,255,255,0);
   --theme-sig-control-slider-handle-border-radius: 10px;
   --theme-sig-control-slider-handle-border-width: 0px;
   --theme-sig-control-slider-handle-border-style: solid;
   --theme-sig-control-slider-bar-background-color: #AFC81A;
   --theme-sig-control-slider-bar-border-radius: 6px;
   --theme-sig-control-slider-track-background-color: #D2D7D7;
   --theme-sig-control-slider-track-border-radius: 6px;
   --theme-sig-control-slider-track-height: 12px;
}
sig-control-bar-straight {
   --theme-sig-control-bar-straight-border-color: #28322D;
   -bgcolorvalue: #AFC81A;
   -bgcolorhide: #A5ABB0;
}
sig-control-enum {
   --theme-sig-control-enum-background-color: #FFFFFF;
   --theme-sig-control-enum-background-color-stop: rgba(255,255,255,0);
   --theme-sig-control-enum-color: #28322D;
   --theme-sig-control-enum-border-color: #28322D;
   --theme-sig-control-enum-border-color-stop: #FFFFFF;
   --theme-sig-control-enum-shadow-color: #000000;
   --theme-sig-control-enum-caretdown-color: #28322D;
   --theme-sig-control-enum-caretdown-background-color: #A5ABB0;
   --theme-sig-control-enum-caretdown-pressed-color: #28322D;
   --theme-sig-control-enum-caretdown-pressed-background-color: #A5ABB0;
   --theme-sig-control-enum-pressed-background-color: #FFFFFF;
   --theme-sig-control-enum-pressed-background-color-stop: rgba(255,255,255,0);
   --theme-sig-control-enum-pressed-color: #28322D;
   --theme-sig-control-enum-pressed-border-color: #28322D;
   --theme-sig-control-enum-pressed-border-color-stop: rgba(255,255,255,0);
   --theme-sig-control-enum-pressed-shadow-color: #000000;
   --theme-sig-control-enum-selected-padding: 8px;
}
sig-control-ellipse {
   --theme-sig-control-ellipse-border-width: 1px;
   --theme-sig-control-ellipse-border-style: solid;
   --theme-sig-control-ellipse-border-color: #FFFFFF;
   --theme-sig-control-ellipse-background-color: rgba(255,255,255,0);
}
.jsPanel-theme-systemWindow {
   --theme-sig-window-panel-content-background-color: #082B3E;
   --theme-sig-window-panel-modal-background-color: rgba(8,43,62,0.4);
   --theme-sig-window-panel-border-color: #93989A;
   --theme-sig-window-panel-border-width: 1px;
   --theme-sig-window-panel-border-style: solid;
   --theme-sig-window-panel-border-radius: 3px;
   --theme-sig-window-panel-content-border-top-color: #93989A;
   --theme-sig-window-panel-hdr-background-color: #023F5F;
   --theme-sig-window-panel-hdr-color: #FFFFFF;
   --theme-sig-window-panel-icon-size: 25px;
}
.jsPanel-theme-systemWindow.__lvdStyle_SystemWindowContainerError {
   --theme-sig-window-panel-hdr-background-color: #DE453B;
   --theme-sig-element-height: 210px;
   --theme-sig-element-width: 400px;
}
.jsPanel-theme-systemWindow.__lvdStyle_SystemWindowContainerWarning {
   --theme-sig-window-panel-hdr-background-color: #FFFF28;
   --theme-sig-window-panel-hdr-color: #000000;
   --theme-sig-element-height: 210px;
   --theme-sig-element-width: 400px;
}
.jsPanel-theme-systemWindow.__lvdStyle_SystemWindowContainerInfo {
   --theme-sig-element-height: 210px;
   --theme-sig-element-width: 400px;
}
sig-app {
   --theme-sig-app-background-color: #5F5F64;
}
</style>
</custom-style>`;
document.head.appendChild($_documentContainer.content);