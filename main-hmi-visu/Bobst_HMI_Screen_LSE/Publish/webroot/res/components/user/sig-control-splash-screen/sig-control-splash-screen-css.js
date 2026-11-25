const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
<style id="lvdtemplate">
        :host sig-control-splash-screen {
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

        </style>
</template>
`;
styleElement.register('sig-control-splash-screen-css');