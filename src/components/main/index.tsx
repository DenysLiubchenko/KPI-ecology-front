import {Box, Button, Container, FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import React from "react";
import Chart from "../chart";
import Table from "../table";

const Main = () => {
    return (
        <Container maxWidth={"md"} sx={{display: "flex", flexDirection: "column", alignItems: "center"}} component={"main"}>

            <Chart/>

            <Table/>

            <Box display={"flex"} gap={1} my={3}>
                <Button variant={"contained"}>Click me</Button>
                <Button variant={"outlined"}>Click me</Button>
            </Box>

            <FormControl sx={{width: 200}}>
                <InputLabel id="demo-simple-select-label">Age</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Age"
                >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                </Select>
            </FormControl>
        </Container>
    )
}

export default Main;