import Table, {EditableCell, HeadCell} from "../index";
import Pollution, {AddPollution} from "../../../models/pollution";
import {FC, useContext, useMemo} from "react";
import DataContext from "../../../contexts/Data";
import {useToast} from "../../../hooks/useToast";
import {addPollution, deletePollution, fetchPollution, updatePollution} from "../../../api";

const headCells: HeadCell<Row>[] = [
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
        id: "pollutantName",
        numeric: false,
        label: "Забрудник",
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
        label: "ГДВ (г/год)"
    },
    {
        id: "pollutionConcentration",
        numeric: true,
        round: 3,
        label: "Концентрація (мг/м³)"
    },
    {
        id: "pollutionValue",
        numeric: true,
        label: "Викиди (г/год)",
    },
    {
        id: "hq",
        numeric: true,
        round: 3,
        label: "Коефіцієнт небезпеки"
    },
    {
        id: "cr",
        numeric: true,
        round: 3,
        label: "Інд. канцерогенний ризик"
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
    pollutantName: string,
    mfr: number,
    tlv: number,
    elv: number,
    pollutionValue: number,
    pollutionConcentration: number,
    hq: number,
    cr: number,
    year: number
}

function dataToRows(data: Pollution[]): Row[] {
    return data.map<Row>(e => ({
        id: e.id,
        companyName: e.company.companyName,
        location: e.company.location,
        pollutantName: e.pollutant.pollutantName,
        mfr: e.pollutant.mfr,
        tlv: e.pollutant.tlv,
        elv: e.pollutant.elv,
        pollutionValue: e.pollutionValue,
        pollutionConcentration: e.pollutionConcentration,
        hq: e.hq,
        cr: e.cr,
        year: e.year
    }));
}

const PollutionsTable: FC = () => {
    const {data, setData} = useContext(DataContext);
    const {setToast} = useToast();

    const rows = useMemo(() => {
        return dataToRows(data.pollutions);
    }, [data.pollutions]);

    const editableCells: EditableCell<Row>[] = useMemo(() => {
        return [
            {
                id: "companyName",
                type: "select",
                onChange: (field, value, row) => ({
                    ...row,
                    companyName: value,
                    location: data.companies.find(e => e.companyName === value)!.location,
                }),
                values: data.companies.map(e => ({id: e.id, label: e.companyName})),
                required: true
            },
            {
                id: "location",
                type: "immutable",
            },
            {
                id: "pollutantName",
                type: "select",
                onChange: (field, value, row) => ({
                    ...row,
                    pollutantName: value,
                    mfr: data.pollutants.find(e => e.pollutantName === value)!.mfr,
                    tlv: data.pollutants.find(e => e.pollutantName === value)!.tlv,
                    elv: data.pollutants.find(e => e.pollutantName === value)!.elv,
                }),
                values: data.pollutants.map(e => ({id: e.id, label: e.pollutantName})),
                required: true
            },
            {
                id: "mfr",
                type: "immutable",
            },
            {
                id: "tlv",
                type: "immutable",
            },
            {
                id: "elv",
                type: "immutable",
            },
            {
                id: "pollutionConcentration",
                type: "text",
                validate: (value, row) => {
                    if (isNaN(+value)) return "Введіть число.";
                    if (Number(value) < 0) return "Число повинно бути додатнім.";
                },
                required: true
            },
            {
                id: "pollutionValue",
                type: "text",
                validate: (value, row) => {
                    if (isNaN(+value)) return "Введіть число.";
                    if (Number(value) < 0) return "Число повинно бути додатнім.";
                },
                required: true
            },
            {
                id: "hq",
                type: "immutable"
            },
            {
                id: "cr",
                type: "immutable"
            },
            {
                id: "year",
                type: "text",
                validate: (value, row) => {
                    if (isNaN(+value)) return "Введіть число.";
                    if (Number(value) < 0) return "Число повинно бути додатнім.";
                    if (Number(value) > new Date().getFullYear()) return "Рік не може бути більшим за поточний.";
                },
                required: true
            }
        ];
    }, [data.companies, data.pollutants]);

    const handleRefresh = async () => {
        try {
            const pollutions = await fetchPollution();
            setData(state => ({...state, pollutions}));
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }
    }

    const handleAddPollution = async (newRow: Omit<Row, "id">) => {
        const _newRow: AddPollution = {
            pollutant: {id: data.pollutants.find(e => e.pollutantName === newRow.pollutantName)!.id},
            company: {id: data.companies.find(e => e.companyName === newRow.companyName)!.id},
            year: newRow.year,
            pollutionValue: newRow.pollutionValue,
            pollutionConcentration: newRow.pollutionConcentration,
        };

        try {
            await addPollution(_newRow);
        } catch {
            setToast({title: "Не вдалось додати рядок.", variant: "error"});
            return false;
        }

        try {
            const pollutions = await fetchPollution();
            setData(state => ({...state, pollutions}));
        } catch {
            setToast({title: "Не вдалось оновити дані.", variant: "error"});
            return false;
        }

        return true;
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

    const handleUpdateRow = async (row: Row) => {
        try {
            await updatePollution({
                id: row.id, pollutionValue: row.pollutionValue, year: row.year,
                company: {id: data.companies.find(c => c.companyName === row.companyName)!.id},
                pollutant: {id: data.pollutants.find(p => p.pollutantName === row.pollutantName)!.id},
                pollutionConcentration: row.pollutionConcentration,
            });
        } catch (e) {
            setToast({title: "Не вдалось оновити рядок!", variant: "error"});
            return false;
        }

        try {
            const pollutions = await fetchPollution();
            setData((data) => ({...data, pollutions}));
        } catch (e) {
            setToast({title: "Не вдалось завантажити дані!", variant: "error"});
            return false;
        }

        return true;
    }

    return (
        <Table title={"Забруднення"}
               handleRefresh={handleRefresh}
               handleAddRow={handleAddPollution}
               handleDelete={handleDelete}
               headCells={headCells}
               handleUpdateRow={handleUpdateRow}
               rows={rows}
               editableCells={editableCells}/>
    )
}

export default PollutionsTable;