import * as React from 'react';
import {hydrate} from 'react-dom';
import {Provider} from 'react-redux';
import {CookiesProvider} from 'react-cookie';
import {App} from "./components/App";
import {MediaProvider} from "./components/Media";
import {createClientStore} from "./app/store";
import {BrowserRouter} from "react-router-dom";
import {theme} from './app/theme';
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import {register} from './serviceWorker';

const clientApp = (
    <MediaProvider value={null}>
        <Provider store={createClientStore()}>
            <MuiThemeProvider theme={theme}>
                <BrowserRouter>
                    <CookiesProvider>
                        <App/>
                    </CookiesProvider>
                </BrowserRouter>
            </MuiThemeProvider>
        </Provider>
    </MediaProvider>
);

register();
hydrate(clientApp, document.getElementById('react_root'));
