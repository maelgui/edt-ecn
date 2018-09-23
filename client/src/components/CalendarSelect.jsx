import React from "react";
import {List, withStyles} from "@material-ui/core";
import {getCalendarList, toggleCalendar} from "../app/actions";
import {connect} from "react-redux";
import {NestedList} from "./NestedList";
import {includesCalendar} from "../app/meta";

const fake = classes => Array.from({length: 5}, (x, i) => ({
    key: `skeleton_${i}`,
    title: <div className={classes.skeleton}/>,
    nested: [],
    shown: false,
    checked: false,
    toggle: () => null,
    unfold: () => null,
    getId: () => null,
    getPrimary: () => null,
}));

const PREFIXES = {
    'OD': 'Option disciplinaire',
    'EI': 'Cycle ingénieur',
    'AP': 'Cycle ingénieur apprenti',
    'BTP': 'BTP',
    'M1ECN': 'Fac de sciences',
    'M1': 'Master 1',
    'M2': 'Master 2',
    'MECA': 'Filière mécanique',
    'OP': 'Option profesionnelle',
    'PROMO': 'Promo EI1',
    '': 'Autres'
};

function indexList(list) {
    return list.reduce((acc, calendar) => {
        let prefix = Object.keys(PREFIXES).find(prefix => calendar.name.startsWith(prefix));
        return {...acc, [prefix]: (acc[prefix] || []).concat([calendar])};
    }, {});
}

const mapState = state => ({
    list: indexList(state.app.list),
    checked: includesCalendar(state.app.meta)
});

const mapDispatch = dispatch => ({
    toggle: id => dispatch(toggleCalendar(id)),
    getList: () => dispatch(getCalendarList())
});

@connect(mapState, mapDispatch)
@withStyles(theme => ({
    skeleton: {
        margin: 0,
        display: 'block',
        height: theme.typography.body1.lineHeight,
        background: theme.palette.grey[200],
        position: 'relative',
        overflow: 'hidden',
        '&:after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, ${theme.palette.grey[200]}, ${theme.palette.grey[100]}, ${theme.palette.grey[200]})`,
            animation: 'progress 1s ease-in-out infinite'
        }
    },
    '@keyframes progress': {
        '0%': {
            transform: 'translate3d(-100%, 0, 0)'
        },
        '100%': {
            transform: 'translate3d(100%, 0, 0)'
        },
    }
}))
export class CalendarSelect extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            unfold: null
        };
    }

    componentWillMount() {
        let {getList, list} = this.props;
        if (Object.keys(list).length === 0) {
            getList();
        }
    }

    togglePrefix(prefix) {
        this.setState({
            unfold: this.state.unfold === prefix ? null : prefix
        });
    }

    render() {
        let {list, toggle, checked, classes} = this.props;
        let mapped = Object.keys(list).length ? Object.keys(list).map(prefix => ({
            key: `prefix_${prefix}`,
            title: PREFIXES[prefix],
            nested: list[prefix],
            shown: this.state.unfold === prefix,
            checked,
            toggle: (id) => toggle(id),
            unfold: () => this.togglePrefix(prefix),
            getId: calendar => calendar.id,
            getPrimary: calendar => calendar.display
        })) : fake(classes);
        return (
            <List component="nav">
                {mapped.map(({key, ...props}) => <NestedList key={key} {...props} />)}
            </List>
        );
    }
}