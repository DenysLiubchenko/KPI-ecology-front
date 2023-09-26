import React from 'react';
import './App.css';
import {CssBaseline, ThemeProvider} from "@mui/material";
import Footer from "./components/footer";
import Header from "./components/header";
import Main from "./components/main";
import {DataProvider} from "./contexts/Data";
import appTheme from "./theme";
import {ToastProvider} from "./contexts/Toast";
import {BrowserRouter} from "react-router-dom";

function App() {
    return (
        <ThemeProvider theme={appTheme}>
            <ToastProvider>
                <DataProvider>
                    <BrowserRouter>
                        <CssBaseline/>

                        <Header/>

                        <Main/>

                        <Footer/>
                    </BrowserRouter>
                </DataProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;
