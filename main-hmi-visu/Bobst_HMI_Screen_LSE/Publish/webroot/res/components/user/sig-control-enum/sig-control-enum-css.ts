import type { DomModule } from "../../sigmatek/sig-element/sig-element-polymer.js";

const styleElement: DomModule = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
    <style id="lvddefault">
        :host sig-control-enum {
            --theme-sig-control-enum-background-color: --palette-default-color253;
            --theme-sig-control-enum-background-color-stop: --palette-default-color255;
            --theme-sig-control-enum-color: --palette-default-color228;
            --theme-sig-control-enum-border-color: --palette-default-color228;
            --theme-sig-control-enum-border-color-stop: --palette-default-color253;
            --theme-sig-control-enum-shadow-color: --palette-default-color254;

            --theme-sig-control-enum-caretdown-color: --palette-default-color228;
            --theme-sig-control-enum-caretdown-background-color: --palette-default-color231;
            --theme-sig-control-enum-caretdown-pressed-color: --palette-default-color228;
            --theme-sig-control-enum-caretdown-pressed-background-color: --palette-default-color231;

            --theme-sig-control-enum-pressed-background-color: --palette-default-color253;
            --theme-sig-control-enum-pressed-background-color-stop: --palette-default-color255;
            --theme-sig-control-enum-pressed-color: --palette-default-color228;
            --theme-sig-control-enum-pressed-border-color: --palette-default-color228;
            --theme-sig-control-enum-pressed-border-color-stop: --palette-default-color255;
            --theme-sig-control-enum-pressed-shadow-color: --palette-default-color254;

            --theme-sig-control-enum-selected-padding: 8px;
        }
    </style>
    <style id="lvdtemplate">
        :host sig-control-enum {
            --theme-sig-element-height: initial;
            --theme-sig-element-width: initial;
        }
        /*! @@lvdstyles */
    </style>
        <style id="development">
        </style>
    </template>`;
styleElement.register('sig-control-enum-css');