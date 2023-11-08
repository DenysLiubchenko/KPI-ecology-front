import Table, {EditableCell, HeadCell} from "../index";
import Pollution, {AddPollution} from "../../../models/pollution";
import {FC, useContext, useMemo} from "react";
import DataContext from "../../../contexts/Data";
import {useToast} from "../../../hooks/useToast";
import {addPollution, deletePollution, fetchEmergency, fetchPollution, updatePollution} from "../../../api";

type riskColor = {
    label: string,
    color: string,
    min?: number,
    max?: number
    tooltip?: string,
}

const hqColors: riskColor[] = [
    {
        label: "Високий",
        color: "#ff2222",
        min: 0.001,
        tooltip: "Високий (> 10^-3) - не прийнятний для виробничих умов і населення. Необхідне здійснення заходів з усунення або зниження ризику"
    },
    {
        label: "Середній",
        color: "#ff8923",
        min: 0.0001,
        max: 0.001,
        tooltip: "Середній (10^-3 - 10^-4) - припустимий для виробничих умов впливу на все населення необхідний динамічний контроль і поглиблене вивчення джерел і можливих наслідків шкідливих впливів для вирішення питання про заходи з управління ризиком"
    },
    {
        label: "Низький",
        color: "#ffed37",
        min: 0.000001,
        max: 0.001,
        tooltip: "Низький (10^-4 - 10^-6) - припустимий ризик (рівень, на якому, як правило, встановлюються гігієнічні нормативи для населення)"
    },
    {
        label: "Мінімальний",
        color: "#9cff33",
        max: 0.000001,
        tooltip: "Мінімальний (< 10^-6) - бажана (цільова) величина ризику при проведенні оздоровчих і природоохоронних заходів"
    },
]

const crColors: riskColor[] = [
    {
        label: "> 1",
        color: "#ff2222",
        min: 1,
        tooltip: "(> 1) Імовірність розвитку шкідливих ефектів зростає пропорційно збільшенню HQ"
    },
    {
        label: "1",
        color: "#ff8923",
        min: 1,
        max: 1,
        tooltip: "(= 1) Гранична величина, що не потребує термінових заходів, однак не може розглядатися як досить прийнятна"
    },
    {
        label: "< 1",
        color: "#9cff33",
        max: 1,
        tooltip: "(< 1) Ризик виникнення шкідливих ефектів розглядають як зневажливо малий"
    },
]

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
        id: "pollutantTypeName",
        numeric: false,
        label: "Тип забруднення"
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
        round: {digits: 3, type: "precision"},
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
        round: {digits: 3, type: "precision"},
        label: "Неканцерогенний ризик",
        color: (value) =>
            hqColors.find(e =>
                e.min && e.max && +value >= e.min && +value <= e.max ||
                !e.max && e.min && +value >= e.min ||
                !e.min && e.max && +value <= e.max
            )?.color,
        tooltip: (value) =>
            hqColors.find(e =>
                e.min && e.max && +value >= e.min && +value <= e.max ||
                !e.max && e.min && +value >= e.min ||
                !e.min && e.max && +value <= e.max
            )?.tooltip
    },
    {
        id: "cr",
        numeric: true,
        round: {digits: 3, type: "precision"},
        label: "Канцерогенний ризик",
        color: (value) =>
            crColors.find(e =>
                e.min && e.max && +value >= e.min && +value <= e.max ||
                !e.max && e.min && +value >= e.min ||
                !e.min && e.max && +value <= e.max
            )?.color,
        tooltip: (value) =>
            crColors.find(e =>
                e.min && e.max && +value >= e.min && +value <= e.max ||
                !e.max && e.min && +value >= e.min ||
                !e.min && e.max && +value <= e.max
            )?.tooltip
    },
    {
        id: "penalty",
        numeric: true,
        round: {digits: 2, type: "fixed"},
        label: "Штраф (грн)"
    },
    {
        id: "tax",
        numeric: true,
        round: {digits: 2, type: "fixed"},
        label: "Податок (грн)"
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
    penalty: number,
    tax: number,
    pollutantTypeName: string,
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
        penalty: e.penalty,
        tax: e.tax,
        pollutantTypeName: e.pollutant.pollutantType.pollutantTypeName,
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
                    pollutantTypeName: data.pollutants.find(e => e.pollutantName === value)!.pollutantType.pollutantTypeName,
                }),
                values: data.pollutants.map(e => ({id: e.id, label: e.pollutantName})),
                required: true
            },
            {
                id: "pollutantTypeName",
                type: "immutable"
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
                id: "penalty",
                type: "immutable"
            },
            {
                id: "tax",
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
            const emergencies = await fetchEmergency();
            setData(state => ({...state, pollutions, emergencies}));
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