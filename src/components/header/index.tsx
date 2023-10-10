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
import {Download, Spa, Upload} from "@mui/icons-material";
import {SyntheticEvent, useContext, useEffect, useRef, useState} from "react";
import {
    downloadCompanies,
    downloadPollutants, downloadPollutions,
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
    const [openUpload, setOpenUpload] = useState(false);
    const [openDownload, setOpenDownload] = useState(false);
    const uploadAnchorRef = useRef<HTMLButtonElement>(null);
    const downloadAnchorRef = useRef<HTMLButtonElement>(null);
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
        setOpenUpload(!openUpload);
    }

    const handleToggleDownload = () => {
        setOpenDownload(!openDownload);
    }

    const handleCloseUpload = (event: Event | SyntheticEvent) => {
        if (uploadAnchorRef.current && uploadAnchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }

        setOpenUpload(false);
    };

    const handleCloseDownload = (event: Event | SyntheticEvent) => {
        if (downloadAnchorRef.current && downloadAnchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }

        setOpenDownload(false);
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

        setOpenUpload(false);

        inputRef.current!.click();

        setChangeFileCb(() => async () => {
            setProgress(0);

            try {
                await uploadCb(inputRef.current!.files!.item(0)!, e => {
                    if (e.progress == 1)
                        setTimeout(() => setProgress(undefined), 500);
                    setProgress(e.progress);
                });
            } catch (e) {
                setProgress(undefined);
                setToast({
                    title: "Помилка при завантаженні файлу!",
                    variant: "error"
                });
            }

            try {
                const pollutions = await fetchPollution();
                const pollutants = await fetchPollutant();
                const companies = await fetchCompany();
                setData({pollutions: pollutions || [], pollutants: pollutants || [], companies: companies || []})
            } catch (e) {
                setToast({
                    title: "Не вдалось завантажити дані.\nПеревірте підключення.",
                    variant: "error"
                });
            }

            setChangeFileCb(() => {});
            inputRef.current!.value = "";
        });
    }

    const handleDownloadCompanies = () => {
        downloadCompanies();
    }

    const handleDownloadPollutants = () => {
        downloadPollutants();
    }

    const handleDownloadPollutions = () => {
        downloadPollutions();
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
                        <Box>
                            <Tooltip title={"Імпорт"}>
                                <IconButton ref={uploadAnchorRef} onClick={handleToggleUpload}>
                                    <input type="file" hidden name={"file"} ref={inputRef} accept={".csv"}
                                           onChange={changeFileCb}/>
                                    <Upload sx={{color: "primary.contrastText"}}/>
                                </IconButton>
                            </Tooltip>

                            <Popper open={openUpload} anchorEl={uploadAnchorRef.current} placement="bottom-end" transition>
                                {({TransitionProps}) => (
                                    <Grow {...TransitionProps} style={{transformOrigin: "top right"}}>
                                        <Paper>
                                            <ClickAwayListener onClickAway={handleCloseUpload}>
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

                        <Box>
                            <Tooltip title={"Експорт"}>
                                <IconButton ref={downloadAnchorRef} onClick={handleToggleDownload}>
                                    <Download sx={{color: "primary.contrastText"}}/>
                                </IconButton>
                            </Tooltip>

                            <Popper open={openDownload} anchorEl={downloadAnchorRef.current} placement="bottom-end" transition>
                                {({TransitionProps}) => (
                                    <Grow {...TransitionProps} style={{transformOrigin: "top right"}}>
                                        <Paper>
                                            <ClickAwayListener onClickAway={handleCloseDownload}>
                                                <MenuList>
                                                    <MenuItem onClick={handleDownloadCompanies}>Компанії</MenuItem>
                                                    <MenuItem onClick={handleDownloadPollutants}>Забрудники</MenuItem>
                                                    <MenuItem onClick={handleDownloadPollutions}>Забруднення</MenuItem>
                                                </MenuList>
                                            </ClickAwayListener>
                                        </Paper>
                                    </Grow>
                                )}
                            </Popper>
                        </Box>
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