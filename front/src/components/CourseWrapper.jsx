import * as React from "react";
import {Course} from "./Course";
import {TimetableEntry} from "./TimetableEntry";
import {Button} from "material-ui";

export class CourseWrapper extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            page: 0
        };
    }

    length() {
        return this.props.events.length;
    }

    current() {
        return this.props.events[this.state.page % this.length()];
    }

    largest() {
        let min = this.props.events
            .map(e => e.start)
            .reduce((min, cur) => cur < min ? cur : min);
        let max = this.props.events
            .map(e => e.end)
            .reduce((max, cur) => cur > max ? cur : max);
        return {start: min, end: max};
    }

    multipage(expr, fallback) {
        return this.length() <= 1 ? fallback : expr;
    }

    prevPage() {
        this.setState({page: (this.state.page + this.length() - 1) % this.length()});
    }

    nextPage() {
        this.setState({page: (this.state.page + 1) % this.length()});
    }

    render() {
        return (
            <React.Fragment>
                <Course {...this.current()} offset={this.props.offset} />
                {this.multipage(
                    <TimetableEntry event={this.current()} offset={this.props.offset}>
                            <Button mini classes={{root: 'btn-left'}} onClick={() => this.prevPage()} variant="fab" color="primary" aria-label="prev">
                                &laquo;
                            </Button>
                            <Button mini classes={{root: 'btn-right'}} onClick={() => this.nextPage()} variant="fab" color="primary" aria-label="next">
                                &raquo;
                            </Button>
                    </TimetableEntry>
                )}

            </React.Fragment>
        );
    }

}