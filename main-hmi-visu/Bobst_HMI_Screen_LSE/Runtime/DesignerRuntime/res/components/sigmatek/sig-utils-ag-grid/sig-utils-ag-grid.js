const options = {
    before: (path, scriptElement) => {
        scriptElement.crossOrigin = 'use-credentials';
    }
};
loadjs('rt/node_modules/ag-grid-community/dist/styles/aggridalpinefont.min.css', options);
import './sig-utils-ag-grid-styles.js';
loadjs('rt/node_modules/ag-grid-community/dist/ag-grid-community.min.nostyle.js', Object.assign({
    success: () => {
        if (window.agGrid && window.agGrid.version === undefined) window.agGrid.version = '28.2.1';
    }
}, options));
loadjs('rt/node_modules/ag-grid-community/dist/styles/ag-grid.min.css', options);
loadjs('rt/node_modules/ag-grid-community/dist/styles/ag-theme-alpine.min.css', options);
