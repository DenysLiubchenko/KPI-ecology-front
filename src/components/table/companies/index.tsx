import Table, {EditableCell, HeadCell} from "../index";
import {FC, useContext, useMemo} from "react";
import DataContext from "../../../contexts/Data";
import {useToast} from "../../../hooks/useToast";
import {
    addCompany,
    deleteCompany,
    fetchCompany,
    fetchPollution,
    updateCompany,
} from "../../../api";
import Company from "../../../models/company";

const headCells: HeadCell<Row>[] = [
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

    const rows = useMemo(() => {
        return dataToRows(data.companies);
    }, [data]);

    const editableCells: EditableCell<Row>[] = useMemo(() =>
        [
            {
                id: "companyName",
                type: "text",
                required: true
            },
            {
                id: "location",
                type: "text",
                required: true
            },
            {
                id: "activity",
                type: "text",
                required: true
            }
        ]
    , [data.companies]);

    const handleRefresh = async () => {
        try {
            const companies = await fetchCompany();
            setData(state => ({...state, companies}));
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }
    }

    const handleAddCompany = async (company: Omit<Row, "id">) => {
        try {
            await addCompany(company);
        } catch {
            setToast({title: "Не вдалось додати рядок.", variant: "error"});
            return false;
        }

        try {
            const companies = await fetchCompany();
            setData(state => ({...state, companies}));
        } catch {
            setToast({title: "Не вдалось оновити дані.", variant: "error"});
            return false;
        }

        return true;
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
            setData(state => ({companies, pollutants: state.pollutants, pollutantTypes: state.pollutantTypes, pollutions}));
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }
    }

    const handleUpdateCompany = async (row: Row) => {
        try {
            await updateCompany(row);
        } catch (e) {
            setToast({title: "Не вдалось оновити рядок!", variant: "error"});
            return false;
        }

        try {
            const companies = await fetchCompany();
            const pollutions = await fetchPollution();
            setData(state => ({companies, pollutants: state.pollutants, pollutantTypes: state.pollutantTypes, pollutions}));
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }

        return true;
    }

    return (
        <Table title={"Забруднення"}
               handleRefresh={handleRefresh}
               handleAddRow={handleAddCompany}
               handleDelete={handleDelete}
               handleUpdateRow={handleUpdateCompany}
               headCells={headCells}
               rows={rows}
               editableCells={editableCells}/>
    )
}

export default CompaniesTable;