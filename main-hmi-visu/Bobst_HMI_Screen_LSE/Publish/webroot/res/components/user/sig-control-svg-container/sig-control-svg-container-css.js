const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
:host sig-control-svg-container {
}

</template>
`;
styleElement.register('sig-control-svg-container-css');