const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
<style id="lvdtemplate">
        :host sig-control-listview {
   --theme-sig-control-listview-background-color: #EBEBEB;
   --theme-sig-control-listview-border-color: rgba(255,255,255,0);
   --theme-sig-control-listview-header-background-color: #000000;
   --theme-sig-control-listview-header-color: #FFFFFF;
   --theme-sig-listview-header-symbol-color: #A0A0A0;
   --theme-sig-listview-header-symbol-active-color: #FFFFFF;
   --theme-sig-control-listview-row-marked-background-color: #00C5FF;
   --theme-sig-control-listview-row-marked-color: #2F2F2F;
   --theme-sig-control-listview-row-even-background-color: #EBEBEB;
   --theme-sig-control-listview-row-even-color: #2F2F2F;
   --theme-sig-control-listview-row-odd-background-color: #EBEBEB;
   --theme-sig-control-listview-row-odd-color: #2F2F2F;
   --theme-sig-control-listview-row-active-background-color: #AFC81A;
   --theme-sig-control-listview-row-active-color: #2F2F2F;
   --theme-sig-control-listview-row-active-marked-color: #FFFFFF;
   --theme-sig-control-listview-spinner-color: #AFC81A;
   --theme-sig-control-listview-cellseparator-color: #FFFFFF;
   --theme-sig-control-listview-lineseparator-color: #FFFFFF;
}

        </style>
</template>
`;
styleElement.register('sig-control-listview-css');