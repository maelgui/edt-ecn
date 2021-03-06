import React from "react";
import classnames from 'classnames';
import {connect} from "react-redux";
import withStyles from "@material-ui/core/styles/withStyles";
import Snackbar from "@material-ui/core/Snackbar/Snackbar";
import Fade from "@material-ui/core/Fade/Fade";
import LinearProgress from "@material-ui/core/LinearProgress/LinearProgress";
import CssBaseline from "@material-ui/core/CssBaseline/CssBaseline";
import {Translation} from "./Translation";

const withStyle = withStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        height: '100vh'
    },
    column: {
        flexDirection: 'column'
    },
    row: {
        flexDirection: 'row',
    },
    main: {
        display: 'flex',
        flex: 1,
        overflowX: 'hidden',
        overflowY: 'auto'
    }
}));

const ErrorMessage = connect(state => ({error: state.app.error}))(({error}) => (
    <Snackbar open={error !== null} message={<Translation for={error || 'GenericError'}/>} autoHideDuration={3000}/>)
);

const Loader = connect(state => ({loading: state.app.loading}))(({loading}) => (
    <Fade in={loading}><LinearProgress/></Fade>
));

export const Page = withStyle(({classes, className, children, ...others}) => {
    return (
        <div className={classnames([classes.root, className])} {...others}>
            <CssBaseline/>
            {children}
            <ErrorMessage/>
        </div>
    );
});

export const PageContent = withStyle(({classes, orientation, className, children, ...others}) => {
    return (
        <React.Fragment>
            <Loader/>
            <div className={classnames({
                [classes.main]: true,
                [className]: true,
                [classes.column]: orientation === 'column',
                [classes.row]: orientation !== 'column'
            })} {...others}>
                {children}
            </div>
        </React.Fragment>
    );
});