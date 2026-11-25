const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
        <style id="lvddefault">
        :host sig-control-titlebar {
            --theme-sig-control-titlebar-background-color: --palette-default-color244;
            --theme-sig-control-titlebar-border-width: 0;
            --theme-sig-control-titlebar-border-style: none;
            --theme-sig-control-titlebar-color: --palette-default-color253;
            --theme-sig-control-titlebar-border-shadow-color: --palette-default-color254;
        }
        </style>
        <style id="lvdtemplate">
        :host sig-control-titlebar {
            --theme-sig-element-top: initial;
            --theme-sig-element-left: initial;
            --theme-sig-element-height: initial;
            --theme-sig-element-width: initial;
        }
            /*! @@lvdstyles */       
        </style>
        <style id="development">
        </style>
    </template>`;
styleElement.register('sig-control-titlebar-css');