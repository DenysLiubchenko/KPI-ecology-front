import Table, {EditableCell, HeadCell} from "../index";
import {useContext, useMemo} from "react";
import DataContext from "../../../contexts/Data";
import {useToast} from "../../../hooks/useToast";
import Emergency from "../../../models/emergency";
import {
    addEmergency,
    deleteEmergency,
    fetchEmergency,
    updateEmergency
} from "../../../api";

const headCells: HeadCell<Row>[] = [
    {
        id: "companyName",
        numeric: false,
        label: "Назва компанії",
    },
    {
        id: "pollutantName",
        numeric: false,
        label: "Забрудник",
    },
    {
        id: "pollutionValue",
        numeric: true,
        label: "Викиди (т)",
    },
    {
        id: "pollutionConcentration",
        numeric: true,
        label: "Концентрація (мг/м³)",
        round: {digits: 3, type: "precision"},
    },
    {
        id: "peopleMinorInjury",
        numeric: true,
        label: "🤕",
    },
    {
        id: "peopleSeriousInjury",
        numeric: true,
        label: "🚑",
    },
    {
        id: "peopleDisability",
        numeric: true,
        label: "👩‍🦽",
    },
    {
        id: "peopleDead",
        numeric: true,
        label: "💀",
    },
    {
        id: "pollutionLoss",
        numeric: true,
        label: "Збитки від забруднення (грн)",
        round: {digits: 2, type: "fixed"},
    },
    {
        id: "peopleLoss",
        numeric: true,
        label: "Збитки від постраждалих (грн)",
        round: {digits: 2, type: "fixed"},
    },
];

type Row = {
    id: number,
    companyName: string,
    pollutantName: string,
    pollutionValue: number,
    pollutionConcentration: number,
    peopleMinorInjury: number,
    peopleSeriousInjury: number,
    peopleDisability: number,
    peopleDead: number,
    pollutionLoss: number,
    peopleLoss: number
}
function sneakLog<T>(obj: T): T {
    console.log(obj);
    return obj;
}
function dataToRows(data: Emergency[]): Row[] {
    return data.map<Row>(e => ({
        id: e.id,
        companyName: e.company.companyName,
        pollutantName: e.pollutant.pollutantName,
        pollutionConcentration: e.pollutionConcentration,
        pollutionValue: e.pollutionValue,
        peopleMinorInjury: e.peopleMinorInjury,
        peopleSeriousInjury: e.peopleSeriousInjury,
        peopleDisability: e.peopleDisability,
        peopleDead: e.peopleDead,
        peopleLoss: sneakLog(e).peopleLoss,
        pollutionLoss: e.pollutionLoss,
    }));
}

const EmergencyTable = () => {
    const {data, setData} = useContext(DataContext);
    const {setToast} = useToast();

    const rows = useMemo(() => {
        return dataToRows(data.emergencies);
    }, [data]);

    const editableCells: EditableCell<Row>[] = useMemo(() =>
            [
                {
                    id: "companyName",
                    type: "select",
                    required: true,
                    onChange: (field, value, row) => ({
                        ...row,
                        companyName: value,
                    }),
                    values: data.companies.map(e => ({id: e.id, label: e.companyName})),
                },
                {
                    id: "pollutantName",
                    type: "select",
                    required: true,
                    onChange: (field, value, row) => ({
                        ...row,
                        pollutantName: value,
                    }),
                    values: data.pollutants.map(e => ({id: e.id, label: e.pollutantName})),
                },
                {
                    id: "pollutionValue",
                    type: "text",
                    required: true,
                    validate: (value, row) => {
                        if (isNaN(+value)) return "Введіть число.";
                        if (Number(value) < 0) return "Число повинно бути додатнім.";
                    },
                },
                {
                    id: "pollutionConcentration",
                    type: "text",
                    required: true,
                    validate: (value, row) => {
                        if (isNaN(+value)) return "Введіть число.";
                        if (Number(value) < 0) return "Число повинно бути додатнім.";
                    },
                },
                {
                    id: "peopleMinorInjury",
                    type: "text",
                    required: true,
                    validate: (value, row) => {
                        if (isNaN(+value)) return "Введіть число.";
                        if (Number(value) < 0) return "Число повинно бути додатнім.";
                    },
                },
                {
                    id: "peopleSeriousInjury",
                    type: "text",
                    required: true,
                    validate: (value, row) => {
                        if (isNaN(+value)) return "Введіть число.";
                        if (Number(value) < 0) return "Число повинно бути додатнім.";
                    },
                },
                {
                    id: "peopleDisability",
                    type: "text",
                    required: true,
                    validate: (value, row) => {
                        if (isNaN(+value)) return "Введіть число.";
                        if (Number(value) < 0) return "Число повинно бути додатнім.";
                    },
                },
                {
                    id: "peopleDead",
                    type: "text",
                    required: true,
                    validate: (value, row) => {
                        if (isNaN(+value)) return "Введіть число.";
                        if (Number(value) < 0) return "Число повинно бути додатнім.";
                    },
                },
                {
                    id: "pollutionLoss",
                    type: "immutable"
                },
                {
                    id: "peopleLoss",
                    type: "immutable",
                },
            ]
        , [data.emergencies]);

    const handleRefresh = async () => {
        try {
            const emergencies = await fetchEmergency();
            setData(state => ({...state, emergencies}));
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }
    }

    const handleAddEmergency = async (emergency: Omit<Row, "id">) => {
        const {companyName: _, pollutantName: __, ..._emergency} = {
            ...emergency,
            pollutant: {id: data.pollutants.find(e => e.pollutantName === emergency.pollutantName)!.id},
            company: {id: data.companies.find(e => e.companyName === emergency.companyName)!.id},
        };

        try {
            await addEmergency(_emergency);
        } catch {
            setToast({title: "Не вдалось додати рядок.", variant: "error"});
            return false;
        }

        try {
            const emergencies = await fetchEmergency();
            setData(state => ({...state, emergencies}));
        } catch {
            setToast({title: "Не вдалось оновити дані.", variant: "error"});
            return false;
        }

        return true;
    }

    const handleDeleteEmergency = async (selected: number[]) => {
        try {
            await deleteEmergency(selected);
        } catch {
            setToast({title: "Не вдалось видалити рядок.", variant: "error"})
        }

        try {
            const emergencies = await fetchEmergency();
            setData(state => ({...state, emergencies}));
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }
    }

    const handleUpdateEmergency = async (emergency: Row) => {
        const {companyName: _, pollutantName: __, ..._emergency} = {
            ...emergency,
            pollutant: {id: data.pollutants.find(e => e.pollutantName === emergency.pollutantName)!.id},
            company: {id: data.companies.find(e => e.companyName === emergency.companyName)!.id},
        };

        try {
            await updateEmergency(_emergency);
        } catch (e) {
            setToast({title: "Не вдалось оновити рядок!", variant: "error"});
            return false;
        }

        try {
            const emergencies = await fetchEmergency();
            setData(state => ({...state, emergencies}));
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }

        return true;
    }

    return (
        <Table title={"Надзвичайні ситуації"}
               handleRefresh={handleRefresh}
               handleAddRow={handleAddEmergency}
               handleDelete={handleDeleteEmergency}
               handleUpdateRow={handleUpdateEmergency}
               headCells={headCells}
               rows={rows}
               editableCells={editableCells}/>
    )
}

export default EmergencyTable;