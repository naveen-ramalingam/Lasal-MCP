const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
<template>
    <style id="lvddefault">
        :host sig-control-bar-straight {
            --theme-sig-control-bar-straight-border-color: --palette-default-color228;
            bgcolorvalue: --palette-default-color229;
            bgcolorhide: --palette-default-color231;
        }
    </style>
    <style id="lvdtemplate">
        /*! @@lvdstyles */
    </style>
    <style id="development">
    </style>
</template>`;
styleElement.register('sig-control-bar-straight-css');
export {};
//# sourceMappingURL=sig-control-bar-straight-css.js.map