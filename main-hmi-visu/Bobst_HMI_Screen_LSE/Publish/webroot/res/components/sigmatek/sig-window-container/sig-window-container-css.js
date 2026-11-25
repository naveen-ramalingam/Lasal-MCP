const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
<style id="lvdtemplate">
            :host sig-window-container {
   --theme-sig-window-panel-hdr-color: #FFFFFF;
   --theme-sig-window-panel-border-color: #93989A;
   --theme-sig-window-panel-border-style: solid;
   --theme-sig-window-panel-content-background-color: #082B3E;
   --theme-sig-window-panel-content-border-top-color: #93989A;
   --theme-sig-window-panel-hdr-background-color: #023F5F;
   --theme-sig-window-panel-border-radius: 3px;
   --theme-sig-window-panel-icon-size: 25px;
   --theme-sig-window-panel-modal-background-color: rgba(8,43,62,0.4);
   --theme-sig-window-panel-border-width: 1px;
}

        </style>
</template>
`;
styleElement.register('sig-window-container-css');