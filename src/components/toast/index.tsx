import {FC, useState} from "react";
import {Alert, AlertColor, Slide, SlideProps, Snackbar} from "@mui/material";

export type ToastProps = {
    title: string,
    color?: AlertColor,
    onClose?: () => unknown
}

const slide = (props: SlideProps) => <Slide {...props} direction={"up"}/>;

const Toast: FC<ToastProps> = ({title, color = "info", onClose}) => {
    const [open, setOpen] = useState<boolean>(true);

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <Snackbar
            anchorOrigin={{vertical: "bottom", horizontal: "right"}}
            open={open}
            autoHideDuration={6000}
            TransitionComponent={slide}
            onClose={handleClose}
            TransitionProps={{onExited: onClose}}
        >
            <Alert onClose={handleClose} severity={color} sx={{ width: "100%", maxWidth: '300px', display: "flex", alignItems: "center" }}>
                {title}
            </Alert>
        </Snackbar>
    )
}

export default Toast;