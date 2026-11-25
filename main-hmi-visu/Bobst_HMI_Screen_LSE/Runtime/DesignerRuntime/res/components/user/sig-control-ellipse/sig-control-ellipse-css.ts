import type { DomModule } from "../../sigmatek/sig-element/sig-element-polymer.js";
const styleElement: DomModule = document.createElement('dom-module');

styleElement.innerHTML = `
<template>
    <style id="lvddefault">
        :host sig-control-ellipse {
            --theme-sig-control-ellipse-border-width: 1px;
            --theme-sig-control-ellipse-border-style: solid;
            --theme-sig-control-ellipse-border-color: --palette-default-color253;
            --theme-sig-control-ellipse-background-color: --palette-default-color255;
        }
    </style>
    <style id="lvdtemplate">
        /*! @@lvdstyles */
    </style>
    <style id="development">
    </style>
</template>`;
styleElement.register('sig-control-ellipse-css');