import Table, {HeadCell} from "../index";
import Pollution, {AddPollution} from "../../../models/pollution";
import {ChangeEvent, FC, useContext, useMemo, useState} from "react";
import DataContext from "../../../contexts/Data";
import {useToast} from "../../../hooks/useToast";
import {addPollution, deletePollution, fetchPollution} from "../../../api";
import {Box, Button, MenuItem, Modal, Paper, TextField, Typography} from "@mui/material";

const headCells: HeadCell[] = [
    {
        id: "companyName",
        numeric: false,
        label: "Підприємство",
    },
    {
        id: "location",
        numeric: false,
        label: "Розташування",
    },
    {
        id: "pollutant",
        numeric: false,
        label: "Забрудник",
    },
    {
        id: "mfr",
        numeric: true,
        label: "Масові витрати (г/год.)",
    },
    {
        id: "tlv",
        numeric: true,
        label: "ГДВ (мг/м³)",
    },
    {
        id: "pollutionValue",
        numeric: true,
        label: "Викиди (т/рік)",
    },
    {
        id: "year",
        numeric: true,
        label: "Рік",
    },
];

type Row = {
    id: number,
    companyName: string,
    location: string,
    pollutant: string,
    mfr: number,
    tlv: number,
    pollutionValue: number,
    year: number
}

function dataToRows(data: Pollution[]): Row[] {
    return data.map<Row>(e => ({
        id: e.id,
        companyName: e.company.companyName,
        location: e.company.location,
        pollutant: e.pollutant.pollutantName,
        mfr: e.pollutant.mfr,
        tlv: e.pollutant.tlv,
        pollutionValue: e.pollutionValue,
        year: e.year
    }));
}

const PollutionsTable: FC = () => {
    const {data, setData} = useContext(DataContext);
    const {setToast} = useToast();
    const [open, setOpen] = useState<boolean>(false);
    const [newRow, setNewRow] = useState<Partial<AddPollution>>({pollutant: {id: -1}, company: {id: -1}});

    const rows = useMemo(() => {
        return dataToRows(data.pollutions);
    }, [data]);

    const handleRefresh = async () => {
        try {
            const pollutions = await fetchPollution();
            setData(state => ({...state, pollutions}));
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }
    }

    const handleAddPollution = async () => {
        await addPollution(newRow as Required<AddPollution>).catch(() => {
            setToast({title: "Не вдалось додати рядок.", variant: "error"});
        });

        try {
            const pollutions = await fetchPollution();
            setData(state => ({...state, pollutions}));
        } catch {
            setToast({title: "Не вдалось оновити дані.", variant: "error"});
        }

        setOpen(false);
    }

    const handleDelete = async (selected: number[]) => {
        try {
            await deletePollution(selected);
        } catch {
            setToast({title: "Не вдалось видалити рядок.", variant: "error"})
        }

        try {
            const pollutions = await fetchPollution();
            setData(state => ({...state, pollutions}));
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }
    }

    const handleOpenModal = () => {
        setOpen(true);
    }

    const handleCloseModal = () => {
        setOpen(false);
    }

    const handleCompanyChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewRow(s => ({...s, company: {id: +e.target.value}}))
    }

    const handlePollutantChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewRow(s => ({...s, pollutant: {id: +e.target.value}}))
    }

    const handlePollutantValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewRow(s => ({...s, pollutionValue: +e.target.value}))
    }

    const handleYearChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewRow(s => ({...s, year: +e.target.value}))
    }

    return (<>
            <Table title={"Забруднення"}
                   handleRefresh={handleRefresh}
                   handleAddRow={handleOpenModal}
                   handleDelete={handleDelete}
                   headCells={headCells}
                   rows={rows}/>
            <Modal open={open} onClose={handleCloseModal}>
                <Paper sx={{
                    width: 400,
                    display:"flex", flexDirection:"column", alignItems: "stretch", position: "absolute",
                    top: "50%", left: "50%", transform: "translate(-50%, -50%)", border: "1px solid #0000000a", boxShadow: 24,
                    padding: 2, gap: 2}}>
                    <Typography variant={"h5"}>Додати нове забруднення</Typography>
                    <Box display={"flex"} flexDirection={"column"} gap={2}>
                        <TextField select label={"Компанія"} onChange={handleCompanyChange}>
                            {data.companies.map(e => <MenuItem key={e.id} value={e.id}>{e.companyName}</MenuItem>)}
                        </TextField>
                        <TextField select label={"Забрудник"} onChange={handlePollutantChange}>
                            {data.pollutants.map(e => <MenuItem key={e.id} value={e.id}>{e.pollutantName}</MenuItem>)}
                        </TextField>
                        <TextField label={"Викиди (т/рік)"} onChange={handlePollutantValueChange}/>
                        <TextField label={"Рік"} onChange={handleYearChange}/>
                    </Box>
                    <Box display={"flex"} gap={1} justifyContent={"center"}>
                        <Button variant={"contained"} onClick={handleAddPollution}>Додати</Button>
                        <Button color={"error"} variant={"contained"} onClick={handleCloseModal}>Закрити</Button>
                    </Box>
                </Paper>
            </Modal>
        </>
    )
}

export default PollutionsTable;