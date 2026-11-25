const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
<style id="lvdtemplate">
        :host sig-control-enum {
            --theme-sig-element-height: initial;
            --theme-sig-element-width: initial;
        }
        :host sig-control-enum {
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

    </style>
</template>
`;
styleElement.register('sig-control-enum-css');