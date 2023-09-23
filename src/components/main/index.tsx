import {Container} from "@mui/material";
import React, {useContext, useEffect} from "react";
import Table from "../table";
import DataContext from "../../contexts/Data";
import {fetchPollution} from "../../api";
import {useToast} from "../../hooks/useToast";

const Main = () => {
    const {data, setData} = useContext(DataContext);
    const {setToast} = useToast();

    useEffect(() => {
        fetchPollution().then(pollution => setData(pollution || []))
            .catch(() => setToast({
                title: "Не вдалось завантажити дані.\nПеревірте підключення.",
                variant: "error"
            }));
    }, [])

    return (
        <Container maxWidth={"md"} sx={{display: "flex", flexDirection: "column", alignItems: "center", my: 3}} component={"main"}>
            <Table/>
        </Container>
    )
}

export default Main;