import {Container} from "@mui/material";
import React, {useContext, useEffect} from "react";
import Table from "../table";
import DataContext from "../../contexts/Data";
import {fetchCompany, fetchPollutant, fetchPollution} from "../../api";
import {useToast} from "../../hooks/useToast";
import {Navigate, Route, Routes} from "react-router-dom";
import PollutionsTable from "../table/pollutions";
import CompaniesTable from "../table/companies";
import PollutantsTable from "../table/pollutants";

const Main = () => {
    const {data, setData} = useContext(DataContext);
    const {setToast} = useToast();

    useEffect(() => {
        (async () => {
            const pollutions = await fetchPollution()
                .catch(() => setToast({
                    title: "Не вдалось завантажити дані.\nПеревірте підключення.",
                    variant: "error"
                }));
            const pollutants = await fetchPollutant()
                .catch(() => setToast({
                    title: "Не вдалось завантажити дані.\nПеревірте підключення.",
                    variant: "error"
                }));
            const companies = await fetchCompany()
                .catch(() => setToast({
                    title: "Не вдалось завантажити дані.\nПеревірте підключення.",
                    variant: "error"
                }));
            setData({pollutions: pollutions || [], pollutants: pollutants || [], companies: companies || []})
        })();
    }, []);

    return (
        <Container maxWidth={"lg"} sx={{display: "flex", flexDirection: "column", alignItems: "center", my: 3}}
                   component={"main"}>
            <Routes>
                <Route path={"/companies"} element={<CompaniesTable/>}/>
                <Route path={"/pollutants"} element={<PollutantsTable/>}/>
                <Route path={"/pollutions"} element={<PollutionsTable/>}/>
                <Route path={"/"} element={"s"}/>
                <Route path={"*"} element={<Navigate to={"/"}/>}/>
            </Routes>
        </Container>
    )
}

export default Main;