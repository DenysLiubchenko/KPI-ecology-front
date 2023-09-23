import React from 'react';
import './App.css';
import {CssBaseline, ThemeProvider} from "@mui/material";
import Footer from "./components/footer";
import Header from "./components/header";
import Main from "./components/main";
import {DataProvider} from "./contexts/Data";
import appTheme from "./theme";
import {ToastProvider} from "./contexts/Toast";

function App() {
    return (
        <ThemeProvider theme={appTheme}>
            <ToastProvider>
                <DataProvider>
                    <CssBaseline/>

                    <Header/>

                    <Main/>

                    <Footer/>
                </DataProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;
