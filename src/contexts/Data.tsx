import {createContext, Dispatch, FC, ReactNode, SetStateAction, useState} from "react";
import Pollution from "../models/pollution";

const DataContext = createContext<{
    data: Pollution[],
    setData: Dispatch<SetStateAction<any>>
}>({
    data: [],
    setData: () => {}
});

export const DataProvider: FC<{children: ReactNode}> = ({children}) => {
    const [data, setData] = useState<Pollution[]>([]);

    return (
        <DataContext.Provider value={{data, setData}}>
            {children}
        </DataContext.Provider>
    )
}

export default DataContext;