import type { DomModule } from "../../sigmatek/sig-element/sig-element-polymer.js";

const styleElement: DomModule = document.createElement('dom-module');
styleElement.innerHTML = `
<template>
    <style id="lvddefault">
        :host sig-control-line-simple {
            --theme-sig-control-line-simple-border-width: 1px;
            --theme-sig-control-line-simple-border-style: solid;
            --theme-sig-control-line-simple-border-color: --palette-default-color253;
            --theme-sig-control-line-simple-background-color: --palette-default-color255;
            --theme-sig-control-line-simple-line-color: --palette-default-color253;
        }
    </style>
    <style id="lvdtemplate">
        /*! @@lvdstyles */
    </style>
    <style id="development">
    </style>
</template>`;
styleElement.register('sig-control-line-simple-css');