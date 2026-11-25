const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
:host sig-control-alarmlist2 {
   --theme-sig-control-alarmlist2-alarmgrid-row-selected-background-color: #AFC81A;
   --theme-sig-control-alarmlist2-alarmgrid-row-marked-background-color: #AFC81A;
   --theme-sig-control-alarmlist2-alarmgrid-row-selected-color: #000000;
   --theme-sig-control-alarmlist2-alarmgrid-row-marked-color: #000000;
   --theme-sig-control-alarmlist2-background-color: rgba(255,255,255,0);
   --theme-sig-control-alarmlist2-border-color: #A0A0A0;
   --theme-sig-control-alarmlist2-overlay-background-color: #FFFFFF;
   --theme-sig-control-alarmlist2-overlay-text-color: #000000;
   --theme-sig-control-alarmlist2-overlay-border-color: rgba(255,255,255,0);
}

</template>
`;
styleElement.register('sig-control-alarmlist2-css');