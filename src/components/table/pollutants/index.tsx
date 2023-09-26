import Table, {HeadCell} from "../index";
import Company, {AddCompany} from "../../../models/company";
import {ChangeEvent, FC, useContext, useMemo, useState} from "react";
import DataContext from "../../../contexts/Data";
import {useToast} from "../../../hooks/useToast";
import {
    addCompany,
    addPollutant,
    deleteCompany,
    deletePollutant,
    fetchCompany,
    fetchPollutant,
    fetchPollution
} from "../../../api";
import {Box, Button, Modal, Paper, TextField, Typography} from "@mui/material";
import Pollutant, {AddPollutant} from "../../../models/pollutant";

const headCells: HeadCell[] = [
    {
        id: "pollutantName",
        numeric: false,
        label: "Назва забрудника",
    },
    {
        id: "mfr",
        numeric: true,
        label: "Масові витрати (г/год)",
    },
    {
        id: "tlv",
        numeric: true,
        label: "ГДК (мг/м³)",
    },
];

type Row = {
    id: number,
    mfr: number,
    pollutantName: string,
    tlv: number,
}

function dataToRows(data: Pollutant[]): Row[] {
    return data.map<Row>(e => ({
        id: e.id,
        pollutantName: e.pollutantName,
        mfr: e.mfr,
        tlv: e.tlv
    }));
}

const PollutantsTable: FC = () => {
    const {data, setData} = useContext(DataContext);
    const {setToast} = useToast();
    const [open, setOpen] = useState<boolean>(false);
    const [newRow, setNewRow] = useState<Partial<AddPollutant>>({});

    const rows = useMemo(() => {
        return dataToRows(data.pollutants);
    }, [data]);

    const handleRefresh = async () => {
        try {
            const pollutants = await fetchPollutant();
            setData(state => ({...state, pollutants}));
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }
    }

    const handleAddPollution = async () => {
        await addPollutant(newRow as Required<AddPollutant>).catch(() => {
            setToast({title: "Не вдалось додати рядок.", variant: "error"});
        });

        try {
            const pollutants = await fetchPollutant();
            setData(state => ({...state, pollutants}));
        } catch {
            setToast({title: "Не вдалось оновити дані.", variant: "error"});
        }

        setOpen(false);
    }

    const handleDelete = async (selected: number[]) => {
        try {
            await deletePollutant(selected);
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

    const handlePollutantNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewRow(s => ({...s, pollutantName: e.target.value}))
    }

    const handleMfrChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewRow(s => ({...s, mfr: +e.target.value}))
    }

    const handleTlvChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewRow(s => ({...s, tlv: +e.target.value}))
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
                        <TextField label={"Назва забрудника"} onChange={handlePollutantNameChange}/>
                        <TextField label={"Масові витрати (г/год)"} onChange={handleMfrChange}/>
                        <TextField label={"ГДК (мг/м³)"} onChange={handleTlvChange}/>
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

export default PollutantsTable;