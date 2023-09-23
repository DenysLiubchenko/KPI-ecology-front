import {useContext} from "react";
import ToastContext from "../contexts/Toast";

export function useToast() {
    const {toast, setToast} = useContext(ToastContext);

    return {toast, setToast};
}