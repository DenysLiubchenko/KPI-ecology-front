import {createContext, Dispatch, FC, ReactNode, SetStateAction, useEffect, useState} from "react";
import {Alert, AlertColor, Slide, SlideProps, Snackbar} from "@mui/material";
import ToastComponent from "../components/toast";

export interface Toast {
    title: string;
    variant: AlertColor;
}

const ToastContext = createContext<{
    toast?: Toast,
    setToast: Dispatch<SetStateAction<Toast | undefined>>
}>({
    toast: undefined,
    setToast: () => {}
});

export const ToastProvider: FC<{children: ReactNode}> = ({children}) => {
    const [toast, setToast] = useState<Toast | undefined>(undefined);

    const handleClose = () => {
        setToast(undefined);
    }

    return (
        <ToastContext.Provider value={{toast, setToast}}>
            {children}

            {toast && <ToastComponent title={toast.title} color={toast.variant} onClose={handleClose}/>}
        </ToastContext.Provider>
    )
}

export default ToastContext;