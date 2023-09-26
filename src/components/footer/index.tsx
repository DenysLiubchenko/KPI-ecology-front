import {Box, Container, Typography, useTheme} from "@mui/material";
import {Copyright} from "@mui/icons-material";

const Footer = () => {
    return (
        <Container sx={{ bgcolor: 'background.paper', p: 6, display: "flex", alignItems: "center", justifyContent: "center" }} component="footer">
            <Typography
                variant="subtitle2"
                align="center"
                color="text.secondary"
                component="p"
                mr={1}
            >
                Робота Кучинського Кирила та Любченка Дениса
            </Typography>
            <Copyright color={"primary"}/>
        </Container>
    )
}

export default Footer;