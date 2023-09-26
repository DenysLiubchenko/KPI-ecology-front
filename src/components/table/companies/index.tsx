import Table, {HeadCell} from "../index";
import {ChangeEvent, FC, useContext, useMemo, useState} from "react";
import DataContext from "../../../contexts/Data";
import {useToast} from "../../../hooks/useToast";
import {addCompany, deleteCompany, fetchCompany, fetchPollutant, fetchPollution} from "../../../api";
import {Box, Button, Modal, Paper, TextField, Typography} from "@mui/material";
import Company, {AddCompany} from "../../../models/company";

const headCells: HeadCell[] = [
    {
        id: "companyName",
        numeric: false,
        label: "Назва компанії",
    },
    {
        id: "location",
        numeric: false,
        label: "Розташування",
    },
    {
        id: "activity",
        numeric: false,
        label: "Опис",
    },
];

type Row = {
    id: number,
    companyName: string,
    location: string,
    activity: string,
}

function dataToRows(data: Company[]): Row[] {
    return data.map<Row>(e => ({
        id: e.id,
        companyName: e.companyName,
        location: e.location,
        activity: e.activity
    }));
}

const CompaniesTable: FC = () => {
    const {data, setData} = useContext(DataContext);
    const {setToast} = useToast();
    const [open, setOpen] = useState<boolean>(false);
    const [newRow, setNewRow] = useState<Partial<AddCompany>>({});

    const rows = useMemo(() => {
        return dataToRows(data.companies);
    }, [data]);

    const handleRefresh = async () => {
        try {
            const companies = await fetchCompany();
            setData(state => ({...state, companies}));
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }
    }

    const handleAddPollution = async () => {
        await addCompany(newRow as Required<AddCompany>).catch(() => {
            setToast({title: "Не вдалось додати рядок.", variant: "error"});
        });

        try {
            const companies = await fetchCompany();
            setData(state => ({...state, companies}));
        } catch {
            setToast({title: "Не вдалось оновити дані.", variant: "error"});
        }

        setOpen(false);
    }

    const handleDelete = async (selected: number[]) => {
        try {
            await deleteCompany(selected);
        } catch {
            setToast({title: "Не вдалось видалити рядок.", variant: "error"})
        }

        try {
            const companies = await fetchCompany();
            const pollutions = await fetchPollution();
            const pollutants = await fetchPollutant();
            setData(state => ({companies, pollutants, pollutions}));
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

    const handleCompanyNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewRow(s => ({...s, companyName: e.target.value}))
    }

    const handleCompanyActivityChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewRow(s => ({...s, activity: e.target.value}))
    }

    const handleCompanyLocationChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewRow(s => ({...s, location: e.target.value}))
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
                        <TextField label={"Назва компанії"} onChange={handleCompanyNameChange}/>
                        <TextField label={"Розташування"} onChange={handleCompanyLocationChange}/>
                        <TextField label={"Діяльність"} onChange={handleCompanyActivityChange}/>
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

export default CompaniesTable;