const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
<style id="lvdtemplate">
        :host sig-control-ellipse {
   --theme-sig-control-ellipse-border-width: 1px;
   --theme-sig-control-ellipse-border-style: solid;
   --theme-sig-control-ellipse-border-color: #FFFFFF;
   --theme-sig-control-ellipse-background-color: rgba(255,255,255,0);
}

    </style>
</template>
`;
styleElement.register('sig-control-ellipse-css');