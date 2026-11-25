const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
<style id="lvdtemplate">
    :host sig-control-enum-list {
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

    </style>
</template>
`;
styleElement.register('sig-control-enum-list-css');