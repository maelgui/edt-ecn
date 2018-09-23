import React from "react";
import {CssBaseline, Fade, LinearProgress, Snackbar, withStyles} from '@material-ui/core';
import classnames from 'classnames';
import {connect} from "react-redux";

const withStyle = withStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        height: '100vh'
    },
    main: {
        display: 'flex',
        flexDirection: 'row',
        flex: 1,
        overflow: 'hidden'
    }
}));

const ErrorMessage = connect(state => ({error: state.app.error}))(({error}) => (
    <Snackbar open={error !== null} message={error} autoHideDuration={3000}/>)
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

export const PageContent = withStyle(({classes, className, children, ...others}) => {
    return (
        <React.Fragment>
            <Loader/>
            <div className={classnames([classes.main, className])} {...others}>
                {children}
            </div>
        </React.Fragment>
    );
});