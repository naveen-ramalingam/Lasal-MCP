window.jsPanelLoadjsPromise = loadjs(
    [
        'rt/node_modules/jspanel4/dist/jspanel.min.css',
        'rt/node_modules/jspanel4/dist/jspanel.min.js',
        'res/components/sigmatek/sig-utils-jspanel/themes/jspanel-default.css'
    ],
    {
        returnPromise: true,
        before: (path, scriptElement) => {
            scriptElement.crossOrigin = 'use-credentials';
        }
    }
).then(() => {
    return loadjs(
        [ 
            'res/components/sigmatek/sig-utils-jspanel/extensions/log/jspanel.log.js'
        ],
        {
            returnPromise: true,
            before: (path, scriptElement) => {
                scriptElement.crossOrigin = 'use-credentials';
            }
        }
    ).then(() => {
        return loadjs(
            [
                'res/components/sigmatek/sig-utils-jspanel/extensions/animations/jspanel.animations.js',
                'res/components/sigmatek/sig-utils-jspanel/extensions/hideonclose/jspanel.hideonclose.js',
                'res/components/sigmatek/sig-utils-jspanel/extensions/sigelement/jspanel.sigelement.js',
                'res/components/sigmatek/sig-utils-jspanel/extensions/modal/jspanel.modal.js'
            ],
            {
                returnPromise: true,
                before: (path, scriptElement) => {
                    scriptElement.crossOrigin = 'use-credentials';
                }
            }
        );
    });
});