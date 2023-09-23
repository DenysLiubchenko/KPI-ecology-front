import {
    alpha,
    Box,
    Checkbox,
    IconButton,
    Paper,
    Table as MUITable,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";
import {FC, useContext, useMemo, useState} from "react";
import {Delete, FilterList, Refresh} from "@mui/icons-material";
import DataContext from "../../contexts/Data";
import Pollution from "../../models/pollution";
import {deletePollution, fetchPollution} from "../../api";
import {useToast} from "../../hooks/useToast";
import ToastContext from "../../contexts/Toast";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (
    a: { [key in Key]: number | string },
    b: { [key in Key]: number | string },
) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
    disablePadding: boolean;
    id: keyof Row;
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: "companyName",
        numeric: false,
        disablePadding: true,
        label: "Підприємство",
    },
    {
        id: "location",
        numeric: false,
        disablePadding: false,
        label: "Розташування",
    },
    {
        id: "pollutant",
        numeric: false,
        disablePadding: false,
        label: "Забрудник",
    },
    {
        id: "mfr",
        numeric: true,
        disablePadding: false,
        label: "Масові витрати (г/год.)",
    },
    {
        id: "tlv",
        numeric: true,
        disablePadding: false,
        label: "ГДВ (мг/м³)",
    },
    {
        id: "pollutionValue",
        numeric: true,
        disablePadding: false,
        label: "Викиди (т/рік)",
    },
    {
        id: "year",
        numeric: true,
        disablePadding: false,
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

interface EnhancedTableProps {
    numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Row) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
        props;
    const createSortHandler =
        (property: keyof Row) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{
                            'aria-label': 'select all desserts',
                        }}
                    />
                </TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={{visibility: "hidden"}}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

interface EnhancedTableToolbarProps {
    numSelected: number;
    handleDelete: () => unknown;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
    const { numSelected, handleDelete } = props;
    const {setData} = useContext(DataContext);
    const {setToast} = useContext(ToastContext);

    const handleRefresh = async () => {
        try {
            setData(await fetchPollution());
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }
    }

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
            }}
        >
            {numSelected > 0 ? (
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} обрано
                </Typography>
            ) : (
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    variant="h6"
                    id="tableTitle"
                    component="div"
                >
                    Викиди
                </Typography>
            )}
            {numSelected > 0 ? (
                <Tooltip title="Видалити">
                    <IconButton onClick={handleDelete}>
                        <Delete />
                    </IconButton>
                </Tooltip>
            ) : (
                <>
                    <Tooltip title="Оновити">
                        <IconButton onClick={handleRefresh}>
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Фільтр">
                        <IconButton>
                            <FilterList />
                        </IconButton>
                    </Tooltip>
                </>
            )}
        </Toolbar>
    );
}


const Table: FC = () => {
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Row>("companyName");
    const [selected, setSelected] = useState<readonly number[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const {data, setData} = useContext(DataContext);
    const {setToast} = useToast();

    const rows = useMemo(() => {
        return dataToRows(data);
    }, [data]);

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof Row,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = rows.map((n) => n.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: readonly number[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDelete = async () => {
        try {
            await deletePollution(selected as number[]);
        } catch {
            setToast({title: "Не вдалось видалити рядок.", variant: "error"})
        }

        try {
            setData(await fetchPollution());
        } catch {
            setToast({title: "Не вдалось завантажити дані.", variant: "error"});
        }

        setSelected([]);
    }

    const isSelected = (id: number) => selected.indexOf(id) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const visibleRows = useMemo(
        () =>
            rows.slice().sort(getComparator(order, orderBy)).slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage,
            ),
        [order, orderBy, page, rowsPerPage, data],
    );

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <EnhancedTableToolbar numSelected={selected.length} handleDelete={handleDelete}/>
                <TableContainer>
                    <MUITable
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size={'small'}
                    >
                        <EnhancedTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                        />
                        <TableBody>
                            {visibleRows.map((row, index) => {
                                const isItemSelected = isSelected(row.id);
                                const labelId = `enhanced-table-checkbox-${index}`;

                                return (
                                    <TableRow
                                        hover
                                        onClick={(event) => handleClick(event, row.id)}
                                        role="checkbox"
                                        aria-checked={isItemSelected}
                                        tabIndex={-1}
                                        key={row.id}
                                        selected={isItemSelected}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                color="primary"
                                                checked={isItemSelected}
                                                inputProps={{
                                                    'aria-labelledby': labelId,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell component="th" id={labelId} scope="row">{row.companyName}</TableCell>
                                        <TableCell align="right">{row.location}</TableCell>
                                        <TableCell align="right">{row.pollutant}</TableCell>
                                        <TableCell align="right">{row.mfr}</TableCell>
                                        <TableCell align="right">{row.tlv}</TableCell>
                                        <TableCell align="right">{row.pollutionValue}</TableCell>
                                        <TableCell align="right">{row.year}</TableCell>
                                    </TableRow>
                                );
                            })}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: (33) * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </MUITable>
                </TableContainer>
                <TablePagination
                    labelRowsPerPage={"Записів на сторінці"}
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    )
}

export default Table;