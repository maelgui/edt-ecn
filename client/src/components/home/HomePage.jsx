import React from "react";
import {CalendarSelect} from "./CalendarSelect";
import HomeDrawer from "./HomeDrawer";
import {Page, PageContent} from "../Page";
import Filter from '@material-ui/icons/FilterList';
import {Media} from "../Media";
import {connect} from 'react-redux';
import HomeNav from "./HomeNav";
import Logo from "../Logo";
import Portal from "@material-ui/core/Portal/Portal";
import Snackbar from "@material-ui/core/Snackbar/Snackbar";
import withStyles from "@material-ui/core/styles/withStyles";
import Paper from "@material-ui/core/Paper/Paper";
import IconButton from "@material-ui/core/IconButton/IconButton";

function FilterMessage({show, doFilter}) {
    return (
        <Portal>
            <Snackbar open={show}
                      message={"Filtrer les matières pour la sélection"}
                      action={<IconButton onClick={doFilter} color={"secondary"}><Filter/></IconButton>}/>
        </Portal>
    );
}

const ConditionalFilterMessage = connect(state => ({show: state.app.meta.length > 0}))(FilterMessage);

@withStyles(theme => ({
    main: {
        background: theme.palette.grey[100]
    },
    rightContainer: {
        padding: 2 * theme.spacing.unit,
        flex: 3,
        overflow: 'auto'
    },
    spread: {
        flexGrow: 1
    },
    searchField: {
        margin: `0 0 ${2 * theme.spacing.unit}px 0`
    },
    paper: {
        margin: `0 auto 5em auto`,
        maxWidth: '60%',
        [theme.breakpoints.down(1024)]: {
            maxWidth: '100%'
        }
    },
    ecn: {
        margin: `${4 * theme.spacing.unit}px auto`,
        maxWidth: '20%',
        display: 'block',
        [theme.breakpoints.down(797)]: {
            maxWidth: '60%'
        }
    }
}))
export class HomePage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    }

    toggleSidebar(open) {
        return () => this.setState({open});
    }

    render() {
        let {classes} = this.props;
        return (
            <Page>
                <HomeNav/>
                <Media queries={[{maxWidth: '797px'}]} serverMatchDevices={['mobile']}>
                    {([isPhone]) => (
                        <PageContent className={classes.main}>
                            <div className={classes.rightContainer}>
                                <Logo className={classes.ecn}/>
                                <Paper className={classes.paper}>
                                    <CalendarSelect/>
                                </Paper>
                            </div>
                            <HomeDrawer open={this.state.open}
                                        onClose={this.toggleSidebar(false)}
                                        permanent={!isPhone}/>
                            {!isPhone || this.state.open ? null :
                                <ConditionalFilterMessage doFilter={this.toggleSidebar(true)}/>}
                        </PageContent>
                    )}
                </Media>
            </Page>
        );
    }
}