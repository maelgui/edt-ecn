import React from "react";
import {Page, PageContent} from "../Page";
import {Nav} from "../Nav";
import {IconButton, Button, InputAdornment, Paper, TextField, Tooltip, Typography, withStyles} from "@material-ui/core";
import copy from "copy-to-clipboard";
import {Link} from "react-router-dom";
import Copy from "@material-ui/icons/FileCopy";
import OpenInNew from "@material-ui/icons/OpenInNew";
import Back from "@material-ui/icons/ArrowBack";

@withStyles(theme => ({
    paper: {
        width: 'auto',
        padding: 3 * theme.spacing.unit,
        margin: `${2 * theme.spacing.unit}px 0`,
    },
    marginTop: {
        marginTop: 4 * theme.spacing.unit
    },
    main: {
        margin: `0 auto`,
        padding: 2 * theme.spacing.unit,
        width: '60%',
        [theme.breakpoints.down(1024)]: {
            width: `100%`,
            margin: 0,
        }
    }
}))
export default class extends React.Component {

    get calendar() {
        return this.props.match.params.calendar;
    }

    get link() {
        return `${process.env.PUBLIC}/api/calendar/custom/${this.calendar}.ics`;
    }

    copy() {
        copy(this.link);
    }

    render() {
        let {classes} = this.props;
        const endAdornment = (
            <InputAdornment position="end">
                <IconButton onClick={() => this.copy()}><Tooltip
                    title="Cliquer pour copier"><Copy/></Tooltip></IconButton>
            </InputAdornment>
        );
        return (
            <Page>
                <Nav>
                    <IconButton component={Link} to={'/' + this.calendar} color="inherit">
                        <Back/>
                    </IconButton>
                    <Typography color="inherit" variant="subheading">Exporter le calendrier</Typography>
                </Nav>
                <PageContent className={classes.main} orientation="column">
                    <TextField variant="filled"
                               label="Calendrier ICS"
                               fullWidth
                               value={this.link}
                               InputProps={{endAdornment}}/>
                    <Paper elevation={1} className={classes.paper}>
                        <Typography variant="title" gutterBottom>
                            Instructions (Google Agenda)
                        </Typography>
                        <Typography variant="subheading" gutterBottom>
                            Cliquez sur le "+" au dessus de vos agendas, et choisissez "À partir de
                            l'URL". Copiez alors l'URL ci-dessus.
                        </Typography>
                        <Button size="small" href="https://calendar.google.com/calendar/r">Google Agenda <OpenInNew fontSize="small"/></Button>
                    </Paper>
                </PageContent>
            </Page>
        )
    }
}