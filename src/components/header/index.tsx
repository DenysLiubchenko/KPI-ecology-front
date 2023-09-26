import {
    AppBar,
    Box,
    ClickAwayListener, Container, Fade,
    Grow,
    IconButton, LinearProgress, MenuItem,
    MenuList,
    Paper,
    Popper,
    Toolbar, Tooltip,
    Typography
} from "@mui/material";
import {Spa, Upload} from "@mui/icons-material";
import {SyntheticEvent, useContext, useRef, useState} from "react";
import {fetchPollution, uploadCsvCompanies, uploadCsvPollutants, uploadCsvPollutions} from "../../api";
import {AxiosProgressEvent} from "axios";
import DataContext from "../../contexts/Data";
import {useToast} from "../../hooks/useToast";

const Header = () => {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [changeFileCb, setChangeFileCb] = useState<() => void>(() => {});
    const [progress, setProgress] = useState<number | undefined>(undefined);
    const {setData} = useContext(DataContext);
    const {setToast} = useToast();

    const handleToggleUpload = () => {
        setOpen(!open);
    }

    const handleClose = (event: Event | SyntheticEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }

        setOpen(false);
    };

    const handleUploadCompanies = () => {
        handleUpload(uploadCsvCompanies);
    }

    const handleUploadPollutants = () => {
        handleUpload(uploadCsvPollutants);
    }

    const handleUploadPollutions = () => {
        handleUpload(uploadCsvPollutions);
    }

    const handleUpload = (uploadCb: (file: File, onProgress?: (progress: AxiosProgressEvent) => void) => Promise<unknown>) => {

        setOpen(false);

        inputRef.current!.click();

        setChangeFileCb(() => async () => {
            await uploadCb(inputRef.current!.files!.item(0)!, progress => {
                if (progress.progress == 1)
                    setTimeout(() => setProgress(undefined), 500);
                setProgress(progress.progress);
            }).catch(e => {
                setProgress(undefined);
                setToast({
                    title: "Помилка при завантаженні файлу!",
                    variant: "error"
                });
            });

            setData(await fetchPollution().catch(e => {
                setToast({
                    title: "Помилка при завантаженні файлу!",
                    variant: "error"
                });
            }));

            setProgress(0);

            setChangeFileCb(() => {});
            inputRef.current!.value = "";
        });
    }

    return (
        <AppBar position={"relative"} id={"header"}>
            <Container maxWidth={"lg"}>
                <Toolbar sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <Box className={"logo"} sx={{display: "flex", alignItems: "center"}}>
                        <Spa sx={{marginRight: 2}}/>
                        <Typography variant={"h6"}>
                            Екологічний моніторинг
                        </Typography>
                    </Box>

                    <Box className={"actions"} sx={{display: "flex", alignItems: "center"}}>
                        <Tooltip title={"Завантажити дані"}>
                            <IconButton ref={anchorRef} onClick={handleToggleUpload}>
                                <input type="file" hidden name={"file"} ref={inputRef} accept={".csv"}
                                       onChange={changeFileCb}/>
                                <Upload sx={{color: "primary.contrastText"}}/>
                            </IconButton>
                        </Tooltip>

                        <Popper open={open} anchorEl={anchorRef.current} placement="bottom-end" transition>
                            {({TransitionProps}) => (
                                <Grow {...TransitionProps} style={{transformOrigin: "top right"}}>
                                    <Paper>
                                        <ClickAwayListener onClickAway={handleClose}>
                                            <MenuList>
                                                <MenuItem onClick={handleUploadCompanies}>Компанії</MenuItem>
                                                <MenuItem onClick={handleUploadPollutants}>Забрудники</MenuItem>
                                                <MenuItem onClick={handleUploadPollutions}>Забруднення</MenuItem>
                                            </MenuList>
                                        </ClickAwayListener>
                                    </Paper>
                                </Grow>
                            )}
                        </Popper>
                    </Box>
                </Toolbar>
            </Container>
            {typeof progress !== "undefined" &&
                <Fade in={true}><LinearProgress variant={"determinate"} value={progress * 100}
                                                sx={{position: "absolute", bottom: 0, width: "100%"}}/></Fade>
            }
        </AppBar>
    )
}

export default Header;