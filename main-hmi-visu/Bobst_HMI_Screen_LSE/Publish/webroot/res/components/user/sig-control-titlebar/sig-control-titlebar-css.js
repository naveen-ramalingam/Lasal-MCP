const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
<style id="lvdtemplate">
        :host sig-control-titlebar {
            --theme-sig-element-top: initial;
            --theme-sig-element-left: initial;
            --theme-sig-element-height: initial;
            --theme-sig-element-width: initial;
        }
            :host sig-control-titlebar {
   --theme-sig-control-titlebar-background-color: #007FC5;
   --theme-sig-control-titlebar-border-width: 0;
   --theme-sig-control-titlebar-border-style: none;
   --theme-sig-control-titlebar-color: #FFFFFF;
   --theme-sig-control-titlebar-border-shadow-color: #000000;
}
       
        </style>
</template>
`;
styleElement.register('sig-control-titlebar-css');