const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
<style id="lvdtemplate">
            :host sig-control-text {
   --theme-sig-control-text-color: #FFFFFF;
   --theme-sig-control-text-border-color: #93989A;
   --theme-sig-control-text-background-color: rgba(255,255,255,0);
   --theme-sig-control-text-value-padding: 3px;
   --theme-sig-control-text-font-size: 11px;
   --theme-sig-control-text-value-text-shadow: none;
}

        </style>
</template>
`;
styleElement.register('sig-control-text-css');