const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
        <style id="lvddefault">
            :host sig-control-alarmlist2 {
                --theme-sig-control-alarmlist2-alarmgrid-row-selected-background-color: --palette-default-color229;
                --theme-sig-control-alarmlist2-alarmgrid-row-marked-background-color: --palette-default-color229;

                --theme-sig-control-alarmlist2-alarmgrid-row-selected-color: --palette-default-color254;
                --theme-sig-control-alarmlist2-alarmgrid-row-marked-color: --palette-default-color254;

                --theme-sig-control-alarmlist2-background-color: --palette-default-color255;
                --theme-sig-control-alarmlist2-border-color: --palette-default-color248;
                --theme-sig-control-alarmlist2-overlay-background-color: --palette-default-color253;
                --theme-sig-control-alarmlist2-overlay-text-color: --palette-default-color254;
                --theme-sig-control-alarmlist2-overlay-border-color: --palette-default-color255;
            }
        </style>
    </template>
`;
styleElement.register('sig-control-alarmlist2-css');
export {};
//# sourceMappingURL=sig-control-alarmlist2-css.js.map