const LOADER_THEME_KEY_BACKGROUND_COLOR = '--theme-sig-dependency-loader-critical-error-background-color';
const LOADER_THEME_KEY_TEXT_COLOR = '--theme-sig-dependency-loader-critical-error-color';
const ERROR_BACKGROUND_COLOR_DEFAULT = 'rgba(255, 0, 0, 1)';
const ERROR_TEXT_COLOR_DEFAUKLT = 'rgba(255, 255, 255, 1)';

async function init() {
    const isDesignmode = window.____sigIsDesignMode;
    if (isDesignmode === true) {
        const { SigDependencyLoaderDrt } = await import('./sig-dependency-loader-drt.js');
        customElements.define(SigDependencyLoaderDrt.is, SigDependencyLoaderDrt);
    } else {
        try {
            const { SigDependencyLoaderRt } = await import('./sig-dependency-loader-rt.js');
            customElements.define(SigDependencyLoaderRt.is, SigDependencyLoaderRt);
        } catch (error) {
            console.error(error);
            renderError(error.message);
        }
    }
}

function renderError(message) {
    if (typeof message !== 'string') return;
    const backgroundColor = getLoaderCssPropertyValue(LOADER_THEME_KEY_BACKGROUND_COLOR);
    const textColor = getLoaderCssPropertyValue(LOADER_THEME_KEY_TEXT_COLOR);
    const elm = document.createElement('DIV');
    elm.style = `
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                width: 100vw;
                color:  ${textColor ? textColor : ERROR_TEXT_COLOR_DEFAUKLT};
                background: ${backgroundColor ? backgroundColor : ERROR_BACKGROUND_COLOR_DEFAULT};
                font-family: sans-serif;
                text-align: center;
            `;
    elm.innerHTML = `
                <p style="width: 60%">ERROR: ${message}</p>
                <button style="
                    color:${backgroundColor ? backgroundColor : ERROR_BACKGROUND_COLOR_DEFAULT};
                    background: ${textColor ? textColor : ERROR_TEXT_COLOR_DEFAUKLT}; 
                    border:none; border-radius: 4px; 
                    padding: 10px 20px;  
                    cursor: pointer;"  
                    onclick="javascript:document.location.reload()"
                >
                    Reload
                </button>      
            `;
    document.body.appendChild(elm);
}

function getLoaderCssPropertyValue(property) {
    if (typeof property !== 'string') return null;
    const loader = document.getElementById('lvddependencyloaderinstance');
    if (loader === null) return null;
    const value = window.getComputedStyle(loader).getPropertyValue(property);
    return value !== '' ? value : null;
}

init();
