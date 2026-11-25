const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
<style id="lvdtemplate">
    :host sig-dependency-loader {
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

    </style>
</template>
`;
styleElement.register('sig-dependency-loader-css');