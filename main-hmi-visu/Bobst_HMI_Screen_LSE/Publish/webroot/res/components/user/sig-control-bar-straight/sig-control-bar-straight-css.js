const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
<style id="lvdtemplate">
        :host sig-control-bar-straight {
   --theme-sig-control-bar-straight-border-color: #28322D;
   -bgcolorvalue: #AFC81A;
   -bgcolorhide: #A5ABB0;
}

    </style>
</template>
`;
styleElement.register('sig-control-bar-straight-css');