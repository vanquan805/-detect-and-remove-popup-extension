import React from "react";
import ReactDOM from "react-dom/client";
import {StyleProvider} from '@ant-design/cssinjs';

if (NODE_ENV !== 'production') {
    console.log('Looks like we are in development mode!');
}

import './i18n';

function importBuildTarget() {
    return import("./backend/App");
}

// Import the entry point and render it's default export
importBuildTarget().then(({default: App}) => {
    let wrap = document.createElement('div');
    wrap.setAttribute('id', 'lienlau-app');
    let root = ReactDOM.createRoot(wrap);

    root.render(
        <React.StrictMode>
            <StyleProvider hashPriority="high">
                <App/>
            </StyleProvider>
        </React.StrictMode>
    );
    document.querySelector('body').append(wrap);
});
