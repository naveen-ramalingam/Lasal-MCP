const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
    <style id="lvddefault">
            :host sig-dependency-loader {
                
                --theme-sig-dependency-loader-font-size: 14px;
                --theme-sig-dependency-loader-font-family: 'Roboto', sans-serif;
                --theme-sig-dependency-loader-background-color: --palette-default-color252;
                --theme-sig-dependency-loader-color: --palette-default-color248;
                --theme-sig-dependency-loader-color-count: --palette-default-color237;
                --theme-sig-dependency-loader-color-info: --palette-default-color248;
                --theme-sig-dependency-loader-color-warn: --palette-default-color238;
                --theme-sig-dependency-loader-color-error: --palette-default-color235;
                --theme-sig-dependency-loader-progress-width: 50%;
                --theme-sig-dependency-loader-progress-bar-container-width: ;
                --theme-sig-dependency-loader-progress-bar-width: ;
                --theme-sig-dependency-loader-progress-bar-height: 20px;
                --theme-sig-dependency-loader-progress-bar-border-radius: 0px;
                --theme-sig-dependency-loader-progress-bar-background-color: --palette-default-color251;
                --theme-sig-dependency-loader-progress-finished-background-color: --palette-default-color240;
                --theme-sig-dependency-loader-progress-bar-margin-top: 0px;
                --theme-sig-dependency-loader-progress-bar-margin-bottom: 10px;
                --theme-sig-dependency-loader-progress-bar-text-align: center;
                --theme-sig-dependency-loader-progress-count-container-width: ;
                --theme-sig-dependency-loader-progress-count-margin-top: 0px;
                --theme-sig-dependency-loader-progress-count-margin-bottom:4px;
                --theme-sig-dependency-loader-progress-count-text-align: center;
                --theme-sig-dependency-loader-logo-color: --palette-default-color244;
                --theme-sig-dependency-loader-logo-container-width: ;
                --theme-sig-dependency-loader-logo-width: auto;
                --theme-sig-dependency-loader-logo-height: auto;
                --theme-sig-dependency-loader-logo-margin-top: 0px;
                --theme-sig-dependency-loader-logo-margin-bottom:4px;
                --theme-sig-dependency-loader-logo-text-align: center;
                --theme-sig-dependency-loader-messages-container-width: ;
                --theme-sig-dependency-loader-messages-font-size: 12px;
                --theme-sig-dependency-loader-messages-font-family: inherit;
                --theme-sig-dependency-loader-messages-margin-top: 0px;
                --theme-sig-dependency-loader-messages-margin-bottom:10px;
                --theme-sig-dependency-loader-message-margin-bottom: 4px;
                --theme-sig-dependency-loader-message-text-align: left;
                --theme-sig-dependency-loader-message-white-space: wrap;
                --theme-sig-dependency-loader-message-line-height: 115%;
                --theme-sig-dependency-loader-reload-color: --palette-default-color244;
                --theme-sig-dependency-loader-reload-container-width: ;
                --theme-sig-dependency-loader-reload-width: auto;
                --theme-sig-dependency-loader-reload-height: auto;
                --theme-sig-dependency-loader-reload-margin-top: 0px;
                --theme-sig-dependency-loader-reload-margin-bottom: 4px;
                --theme-sig-dependency-loader-critical-error-background-color: --palette-default-color235;
                --theme-sig-dependency-loader-critical-error-color: --palette-default-color253;
            }
    </style>
    <style id="lvdtemplate">
    /*! @@lvdstyles */
    </style>
    <style id="development">
    </style>
    </template>
    `;
styleElement.register('sig-dependency-loader');