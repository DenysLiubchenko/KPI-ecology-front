import React from 'react';
import './App.css';
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import Footer from "./components/footer";
import Header from "./components/header";
import Main from "./components/main";

const defaultTheme = createTheme({
    palette: {
        primary: {
            "50": "#f7fee7",
            "100": "#ecfccb",
            "200": "#d9f99d",
            "300": "#bef264",
            "400": "#a3e635",
            "500": "#84cc16",
            "600": "#65a30d",
            "700": "#4d7c0f",
            "800": "#3f6212",
            "900": "#365314",
            A100: "#ecfccb",
            A200: "#d9f99d",
            A400: "#a3e635",
            A700: "#4d7c0f",
            dark: "#3f6212",
            light: "#a3e635",
            main: "#84cc16",
            contrastText: "#ffffff",
        },
        secondary: {
            "50": "#B2F3F3",
            "100": "#AAF2F2",
            "200": "#A1F1F1",
            "300": "#98F0F0",
            "400": "#8EEEEE",
            "500": "#83ECEC",
            "600": "#77D7D7",
            "700": "#6CC3C3",
            "800": "#62B1B1",
            "900": "#59A1A1",
            A100: "#AAF2F2",
            A200: "#A1F1F1",
            A400: "#8EEEEE",
            A700: "#6CC3C3",
            main: "#83ECEC",
            dark: "#59A1A1",
            light: "#98F0F0",
            contrastText: "#212121"
        },
        text: {
            primary: "#000000",
            secondary: "#2c2c2c",
            disabled: "#333333",
        },
    }
});

function App() {
    return (
        <ThemeProvider theme={defaultTheme}>
            <CssBaseline/>

            <Header/>

            <Main/>

            <Footer/>
        </ThemeProvider>
    );
}

export default App;
