import {createContext, Dispatch, FC, ReactNode, SetStateAction, useState} from "react";
import Pollution from "../models/pollution";
import Company from "../models/company";
import Pollutant from "../models/pollutant";
import PollutantType from "../models/pollutantType";

export type Data = {
    pollutions: Pollution[],
    companies: Company[],
    pollutants: Pollutant[]
    pollutantTypes: PollutantType[]
}

const DataContext = createContext<{
    data: Data,
    setData: Dispatch<SetStateAction<Data>>
}>({
    data: {
        pollutions: [],
        companies: [],
        pollutants: [],
        pollutantTypes: []
    },
    setData: () => {}
});

export const DataProvider: FC<{children: ReactNode}> = ({children}) => {
    const [data, setData] = useState<Data>({
        pollutants: [],
        companies: [],
        pollutions: [],
        pollutantTypes: []
    });

    return (
        <DataContext.Provider value={{data, setData}}>
            {children}
        </DataContext.Provider>
    )
}

export default DataContext;