const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
<style id="lvdtemplate">
        :host sig-control-line-simple {
   --theme-sig-control-line-simple-border-width: 1px;
   --theme-sig-control-line-simple-border-style: solid;
   --theme-sig-control-line-simple-border-color: #FFFFFF;
   --theme-sig-control-line-simple-background-color: rgba(255,255,255,0);
   --theme-sig-control-line-simple-line-color: #FFFFFF;
}

    </style>
</template>
`;
styleElement.register('sig-control-line-simple-css');