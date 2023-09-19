import {AppBar, Toolbar, Typography} from "@mui/material";
import {Spa} from "@mui/icons-material";
import React from "react";

const Header = () => {
    return (
        <AppBar position={"relative"}>
            <Toolbar>
                <Spa sx={{marginRight: 2}}/>
                <Typography variant={"h6"}>
                    Екологічний моніторинг
                </Typography>
            </Toolbar>
        </AppBar>
    )
}

export default Header;