const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
<style id="lvdtemplate">
        :host sig-control-button {
            --theme-sig-element-height: initial;
            --theme-sig-element-width: initial;
        }
            :host sig-control-button {
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
:host sig-control-button.__lvdStyle_FileManagerButtons {
   --theme-sig-element-width: 50px;
   --theme-sig-element-height: 50px;
}

        </style>
</template>
`;
styleElement.register('sig-control-button-css');