import {
    AppBar,
    Box,
    ClickAwayListener, Container, Fade,
    Grow,
    IconButton, LinearProgress, MenuItem,
    MenuList,
    Paper,
    Popper, Tab, Tabs,
    Toolbar, Tooltip,
    Typography
} from "@mui/material";
import {Spa, Upload} from "@mui/icons-material";
import {SyntheticEvent, useContext, useEffect, useRef, useState} from "react";
import {
    fetchCompany,
    fetchPollutant,
    fetchPollution,
    uploadCsvCompanies,
    uploadCsvPollutants,
    uploadCsvPollutions
} from "../../api";
import {AxiosProgressEvent} from "axios";
import DataContext from "../../contexts/Data";
import {useToast} from "../../hooks/useToast";
import {useLocation, useNavigate} from "react-router-dom";

const tabs = ["pollutions", "companies", "pollutants"];

const Header = () => {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [changeFileCb, setChangeFileCb] = useState<() => void>(() => {});
    const [progress, setProgress] = useState<number | undefined>(undefined);
    const {setData} = useContext(DataContext);
    const {setToast} = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    let tabIndex = tabs.indexOf(location.pathname.replace("/", "").split("/")[0]);
    if (tabIndex === -1) tabIndex = 0;

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

            const pollutions = await fetchPollution()
                .catch(() => setToast({
                    title: "Не вдалось завантажити дані.\nПеревірте підключення.",
                    variant: "error"
                }));
            const pollutants = await fetchPollutant()
                .catch(() => setToast({
                    title: "Не вдалось завантажити дані.\nПеревірте підключення.",
                    variant: "error"
                }));
            const companies = await fetchCompany()
                .catch(() => setToast({
                    title: "Не вдалось завантажити дані.\nПеревірте підключення.",
                    variant: "error"
                }));
            setData({pollutions: pollutions || [], pollutants: pollutants || [], companies: companies || []})

            setProgress(0);

            setChangeFileCb(() => {});
            inputRef.current!.value = "";
        });
    }

    const handleTabChange = (e: SyntheticEvent, newTab: number) => {
        navigate("/" + tabs[newTab]);
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

                <Tabs textColor={"inherit"} value={tabIndex} onChange={handleTabChange}>
                    <Tab label="Забруднення"/>
                    <Tab label="Компанії"/>
                    <Tab label="Забрудники"/>
                </Tabs>
            </Container>
            {typeof progress !== "undefined" &&
                <Fade in={true}><LinearProgress variant={"determinate"} value={progress * 100}
                                                sx={{position: "absolute", bottom: 0, width: "100%"}}/></Fade>
            }
        </AppBar>
    )
}

export default Header;