import Table, {EditableCell, HeadCell} from "../index";
import {FC, useContext, useMemo} from "react";
import DataContext from "../../../contexts/Data";
import {useToast} from "../../../hooks/useToast";
import {
    addPollutant,
    deletePollutant, fetchEmergency,
    fetchPollutant,
    fetchPollution, updatePollutant
} from "../../../api";
import Pollutant, {AddPollutant, UpdatePollutant} from "../../../models/pollutant";

const headCells: HeadCell<Row>[] = [
    {
        id: "pollutantName",
        numeric: false,
        label: "Назва забрудника",
    },
    {
        id: "pollutantTypeName",
        numeric: false,
        label: "Тип забрудника",
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
    },
    {
        id: "rfc",
        numeric: true,
        round: {digits: 3, type: "precision"},
        label: "Референтна концетрація (мг/куб.м)"
    },
    {
        id: "sf",
        numeric: true,
        round: {digits: 3, type: "precision"},
        label: "Фактор нахилу (мг/(кг*доба))"
    },
    {
        id: "taxRate",
        numeric: true,
        round: {digits: 2, type: "fixed"},
        label: "Ставка податку (грн/т)"
    }
];

type Row = {
    id: number,
    mfr: number,
    pollutantName: string,
    pollutantTypeName: string,
    tlv: number,
    elv: number,
    rfc: number,
    sf: number,
    taxRate: number,
}

function dataToRows(data: Pollutant[]): Row[] {
    return data.map<Row>(e => ({
        id: e.id,
        pollutantName: e.pollutantName,
        pollutantTypeName: e.pollutantType.pollutantTypeName,
        mfr: e.mfr,
        tlv: e.tlv,
        elv: e.elv,
        rfc: e.rfc,
        sf: e.sf,
        taxRate: e.taxRate
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
                id: "pollutantTypeName",
                type: "select",
                onChange: (field, value, row) => ({
                    ...row,
                    pollutantTypeName: value,
                }),
                values: data.pollutantTypes.map(e => ({id: e.id, label: e.pollutantTypeName})),
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
            },
            {
                id: "rfc",
                type: "text",
                required: true,
                validate: (value) => {
                    if (isNaN(+value)) return "Введіть число.";
                    if (Number(value) < 0) return "Число повинно бути додатнім.";
                }
            },
            {
                id: "sf",
                type: "text",
                required: true,
                validate: (value) => {
                    if (isNaN(+value)) return "Введіть число.";
                    if (Number(value) < 0) return "Число повинно бути додатнім.";
                }
            },
            {
                id: "taxRate",
                type: "text",
                required: true,
                validate: (value) => {
                    if (isNaN(+value)) return "Введіть число.";
                    if (Number(value) < 0) return "Число повинно бути додатнім.";
                }
            },
        ], [data.pollutantTypes]);

    const handleRefresh = async () => {
        try {
            const pollutants = await fetchPollutant();
            setData(state => ({...state, pollutants}));
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }
    }

    const handleAddPollutant = async (newRow: Omit<Row, "id">) => {
        const { pollutantTypeName, ..._newRow } = {
            ...newRow,
            pollutantType: {id: data.pollutantTypes.find(e => e.pollutantTypeName === newRow.pollutantTypeName)!.id},
        };

        try {
            await addPollutant(_newRow);
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
            const emergencies = await fetchEmergency();
            setData(state => ({...state, pollutants, pollutions, emergencies}));
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }
    }

    const handleUpdatePollutant = async (row: Row) => {
        const { pollutantTypeName, ..._row } = {
            ...row,
            pollutantType: {id: data.pollutantTypes.find(e => e.pollutantTypeName === row.pollutantTypeName)!.id},
        };

        try {
            await updatePollutant(_row);
        } catch (e) {
            setToast({title: "Не вдалось оновити рядок!", variant: "error"});
            return false;
        }

        try {
            const pollutions = await fetchPollution();
            const pollutants = await fetchPollutant();
            setData(state => ({...state, pollutants, pollutions}));
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