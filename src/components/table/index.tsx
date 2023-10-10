import {
    alpha,
    Box,
    Checkbox,
    IconButton, InputAdornment, MenuItem,
    Paper,
    Table as MUITable,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel, TextField,
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";
import {useEffect, useMemo, useState} from "react";
import {Add, Close, Delete, Done, Edit, Error, FilterList, Refresh} from "@mui/icons-material";

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

export interface HeadCell<T extends Row> {
    id: keyof T;
    label: string;
    numeric: boolean;
    select?: string[] | number[];
}

interface EnhancedTableProps<T extends Row> {
    numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Row) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
    headCells: HeadCell<T>[];
}

function EnhancedTableHead<T extends Row>({ onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, headCells }: EnhancedTableProps<T>) {
    const createSortHandler =
        (property: keyof Row) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <IconButton>
                        <Checkbox
                            color="primary"
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={rowCount > 0 && numSelected === rowCount}
                            onChange={onSelectAllClick}
                            inputProps={{
                                'aria-label': 'select all',
                            }}
                        />
                    </IconButton>
                </TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={String(headCell.id)}
                        align={headCell.numeric ? 'right' : 'left'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(String(headCell.id))}
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
    handleAddRow: () => unknown;
    handleRefresh: () => unknown;
    title: string;
}

function EnhancedTableToolbar({numSelected, handleDelete, handleAddRow, title, handleRefresh}: EnhancedTableToolbarProps) {
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
                    {title}
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
                    <Tooltip title="Додати поле">
                        <IconButton onClick={handleAddRow}>
                            <Add/>
                        </IconButton>
                    </Tooltip>
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

export type Row = {
    id: number,
    [key: string]: string | number
};

export interface EditableCell<T extends Row> {
    id: keyof T;
    type: "select" | "text" | "immutable";
    onChange?: (field: string, value: string, row: T) => T;
    values?: {id: number, label: string}[];
    validate?: (value: string | number, row: T) => string | undefined;
    required?: boolean;
}

export interface TableProps<T extends Row> {
    title: string;
    handleRefresh: () => unknown;
    handleDelete: (selected: number[]) => unknown;
    handleAddRow: (row: Omit<T, "id">) => Promise<boolean>;
    handleUpdateRow: (row: T) => Promise<boolean>;
    rows: T[];
    headCells: HeadCell<T>[];
    editableCells: EditableCell<T>[];
}

function Table<T extends Row>({title, handleRefresh, handleDelete, handleAddRow, handleUpdateRow, rows, headCells, editableCells}: TableProps<T>) {
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Row>("id");
    const [selected, setSelected] = useState<readonly number[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [newRow, setNewRow] = useState<Omit<T, "id"> | undefined>(undefined);
    const [editingRow, setEditingRow] = useState<T | undefined>(undefined);
    const [persistSubmitEdit, setPersistSubmitEdit] = useState<boolean>(false);
    const [persistSubmitAdd, setPersistSubmitAdd] = useState<boolean>(false);

    useEffect(() => {
        let error = false;

        editingRow && editableCells && editableCells.forEach(cell => {
            if (cell.required && !editingRow[cell.id] || cell.validate && cell.validate(editingRow[cell.id], editingRow)) error = true;
        })

        setPersistSubmitEdit(error);
    }, [editingRow]);

    useEffect(() => {
        let error = false;

        newRow && editableCells && editableCells.forEach(cell => {
            if (cell.id === "id") return;
            if (cell.required && !(newRow as T)[cell.id] || cell.validate && cell.validate(newRow[cell.id], newRow as T)) error = true;
        })

        setPersistSubmitAdd(error);
    }, [newRow]);

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
        [order, orderBy, page, rowsPerPage, rows],
    );

    const handleOpenAdd = () => {
        const emptyRow: any = {};

        editableCells.forEach(cell => {
            emptyRow[cell.id] = "";
        })

        setNewRow(emptyRow);
    }

    const handleCloseAdd = () => {
        setNewRow(undefined);
    }

    const handleSubmitAdd = async () => {
        newRow && await handleAddRow(newRow) && setNewRow(undefined);
    }

    const handleChangeAddRow = (field: string, value: string, cb?: (field: string, value: string, row: T) => T) => {
        if (!newRow) return;

        const res = cb && cb(field, value, newRow as T);

        setNewRow(state => ({...state!, [field]: value, ...res}));
    }

    const handleEditRow = (row: T) => {
        setEditingRow(row);
        setSelected(state => state.filter(e => e !== row.id))
    }

    const handleCloseEdit = () => {
        setEditingRow(undefined);
    }

    const handleSubmitEdit = async () => {
        await handleUpdateRow(editingRow!) && setEditingRow(undefined);
    }

    const handleChangeEdit = (field: string, value: string, cb?: (field: string, value: string, row: T) => T) => {
        if (!editingRow) return;

        const res = cb && cb(field, value, editingRow);

        setEditingRow(state => ({...state!, [field]: value, ...res}));
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <EnhancedTableToolbar
                    numSelected={selected.length}
                    handleDelete={() => {handleDelete(selected as number[]); setSelected([])}}
                    handleAddRow={handleOpenAdd}
                    handleRefresh={handleRefresh}
                    title={title}
                />
                <TableContainer>
                    <MUITable
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size={'small'}
                    >
                        <EnhancedTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy as string}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                            headCells={headCells}
                        />
                        <TableBody>
                            {newRow && <TableRow key={"add"}>
                                <TableCell padding="checkbox">
                                    <Box display={"flex"}>
                                        <IconButton onClick={handleCloseAdd}>
                                            <Close/>
                                        </IconButton>
                                        <IconButton disabled={persistSubmitAdd} onClick={handleSubmitAdd}>
                                            <Done/>
                                        </IconButton>
                                    </Box>
                                </TableCell>
                                {editableCells.map(cell => {
                                    if (cell.id === "id") return;

                                    const error = cell.validate && cell.validate(newRow[cell.id], newRow as T);

                                    return <TableCell key={String(cell.id)}>
                                        {cell.type === "select" ?
                                            <TextField variant={"standard"} select defaultValue={""}
                                                       value={newRow[cell.id as keyof Omit<T, "id">]} fullWidth
                                                       sx={{maxWidth: "200px"}}  required={cell.required}
                                                       label={headCells.find(e => e.id === cell.id)?.label}
                                                       onChange={e => handleChangeAddRow(String(cell.id), e.target.value, cell.onChange!)}>
                                                {cell.values?.map(v =>
                                                    <MenuItem key={v.id} value={v.label}>{v.label}</MenuItem>)}
                                            </TextField>
                                            : <TextField variant={"standard"} disabled={cell.type === "immutable"}
                                                         error={!!error} required={cell.required}
                                                         label={headCells.find(e => e.id === cell.id)?.label}
                                                         value={newRow[cell.id as keyof Omit<T, "id">]}
                                                         InputProps={{
                                                             endAdornment: error &&
                                                                 <InputAdornment position="end">
                                                                     <Tooltip title={error}>
                                                                         <Error color={"error"} fontSize={"small"}/>
                                                                     </Tooltip>
                                                                 </InputAdornment>
                                                         }}
                                                         onChange={e => handleChangeAddRow(String(cell.id), e.target.value, cell.onChange!)}/>
                                        }
                                    </TableCell>
                                })}
                            </TableRow>}

                            {visibleRows.map((row, index) => {
                                const isItemSelected = isSelected(row.id);
                                const labelId = `enhanced-table-checkbox-${index}`;

                                if (editingRow?.id === row.id)
                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell padding="checkbox">
                                                <Box display={"flex"}>
                                                    <IconButton onClick={handleCloseEdit}>
                                                        <Close/>
                                                    </IconButton>
                                                    <IconButton disabled={persistSubmitEdit} onClick={handleSubmitEdit}>
                                                        <Done/>
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                            {editableCells.map(cell => {
                                                const error = cell.validate && cell.validate(editingRow[cell.id], editingRow);

                                                return <TableCell key={String(cell.id)}>
                                                    {cell.type === "select" ?
                                                        <TextField variant={"standard"} select defaultValue={""}
                                                                   value={editingRow[cell.id]} fullWidth
                                                                   sx={{maxWidth: "200px"}}
                                                                   onChange={e => handleChangeEdit(String(cell.id), e.target.value, cell.onChange!)}>
                                                            {cell.values?.map(v =>
                                                                <MenuItem key={v.id} value={v.label}>{v.label}</MenuItem>)}
                                                        </TextField>
                                                        : <TextField variant={"standard"} disabled={cell.type === "immutable"}
                                                                     error={!!error} required={cell.required} label={headCells.find(e => e.id === cell.id)?.label}
                                                                     value={editingRow[cell.id]}
                                                                     InputProps={{
                                                                         endAdornment: error &&
                                                                             <InputAdornment position="end">
                                                                                 <Tooltip title={error}>
                                                                                     <Error color={"error"} fontSize={"small"}/>
                                                                                 </Tooltip>
                                                                             </InputAdornment>
                                                                     }}
                                                                     onChange={e => handleChangeEdit(String(cell.id), e.target.value, cell.onChange!)}/>
                                                    }
                                                </TableCell>
                                            })}
                                        </TableRow>
                                    )

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
                                            <Box display={"flex"}>
                                                <IconButton>
                                                    <Checkbox sx={{padding: 0}}
                                                              color="primary"
                                                              checked={isItemSelected}
                                                              inputProps={{
                                                                  'aria-labelledby': labelId,
                                                              }}
                                                    />
                                                </IconButton>
                                                <IconButton onClick={(e) => {e.stopPropagation(); handleEditRow(row)}}>
                                                    <Edit/>
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                        {headCells.map(e => {
                                            return <TableCell key={String(e.id)} align="right">{row[e.id]}</TableCell>
                                        })}
                                    </TableRow>
                                );
                            })}
                            {emptyRows > 0 && (
                                <TableRow key={"emptyRow"}
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