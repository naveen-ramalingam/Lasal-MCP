const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
<style id="lvdtemplate">
        :host sig-control-numeric-input {
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

    </style>
</template>
`;
styleElement.register('sig-control-numeric-input-css');