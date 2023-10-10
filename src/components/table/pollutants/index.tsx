import Table, {EditableCell, HeadCell} from "../index";
import {FC, useContext, useMemo} from "react";
import DataContext from "../../../contexts/Data";
import {useToast} from "../../../hooks/useToast";
import {
    addPollutant,
    deletePollutant,
    fetchPollutant,
    fetchPollution, updatePollutant, updatePollution
} from "../../../api";
import Pollutant from "../../../models/pollutant";

const headCells: HeadCell<Row>[] = [
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
    {
        id: "elv",
        numeric: true,
        label: "ГДВ (г/год.)"
    }
];

type Row = {
    id: number,
    mfr: number,
    pollutantName: string,
    tlv: number,
    elv: number
}

function dataToRows(data: Pollutant[]): Row[] {
    return data.map<Row>(e => ({
        id: e.id,
        pollutantName: e.pollutantName,
        mfr: e.mfr,
        tlv: e.tlv,
        elv: e.elv
    }));
}

const PollutantsTable: FC = () => {
    const {data, setData} = useContext(DataContext);
    const {setToast} = useToast();

    const rows = useMemo(() => {
        return dataToRows(data.pollutants);
    }, [data]);

    const editableCells: EditableCell<Row>[] = useMemo(() =>
        [
            {
                id: "pollutantName",
                type: "text",
                required: true,
            },
            {
                id: "mfr",
                type: "text",
                required: true,
                validate: (value, row) => {
                    if (isNaN(+value)) return "Введіть число.";
                    if (Number(value) < 0) return "Число повинно бути додатнім.";
                },
            },
            {
                id: "tlv",
                type: "text",
                required: true,
                validate: (value, row) => {
                    if (isNaN(+value)) return "Введіть число.";
                    if (Number(value) < 0) return "Число повинно бути додатнім.";
                },
            },
            {
                id: "elv",
                type: "text",
                required: true,
                validate: (value, row) => {
                    if (isNaN(+value)) return "Введіть число.";
                    if (Number(value) < 0) return "Число повинно бути додатнім.";
                },
            }
        ], []);

    const handleRefresh = async () => {
        try {
            const pollutants = await fetchPollutant();
            setData(state => ({...state, pollutants}));
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }
    }

    const handleAddPollutant = async (newRow: Omit<Row, "id">) => {
        try {
            await addPollutant(newRow);
        } catch {
            setToast({title: "Не вдалось додати рядок.", variant: "error"});
            return false;
        }

        try {
            const pollutants = await fetchPollutant();
            setData(state => ({...state, pollutants}));
        } catch {
            setToast({title: "Не вдалось оновити дані.", variant: "error"});
            return false;
        }

        return true;
    }

    const handleDelete = async (selected: number[]) => {
        try {
            await deletePollutant(selected);
        } catch {
            setToast({title: "Не вдалось видалити рядок.", variant: "error"})
        }

        try {
            const pollutions = await fetchPollution();
            const pollutants = await fetchPollutant();
            setData(state => ({companies: state.companies, pollutants, pollutions}));
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }
    }

    const handleUpdatePollutant = async (row: Row) => {
        try {
            await updatePollutant(row);
        } catch (e) {
            setToast({title: "Не вдалось оновити рядок!", variant: "error"});
            return false;
        }

        try {
            const pollutions = await fetchPollution();
            const pollutants = await fetchPollutant();
            setData(state => ({companies: state.companies, pollutants, pollutions}));
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }

        return true;
    }

    return (
        <Table title={"Забруднення"}
               handleRefresh={handleRefresh}
               handleAddRow={handleAddPollutant}
               handleDelete={handleDelete}
               handleUpdateRow={handleUpdatePollutant}
               headCells={headCells}
               rows={rows}
               editableCells={editableCells}/>
    )
}

export default PollutantsTable;