import React from 'react';

const Checkbox = (props) => {
    let isChecked = typeof props.checked !== 'undefined' ? props.checked : false;

    return (
        <span className="checkbox" onClick={typeof props.onClick !== 'undefined' ? props.onClick : null}>
            <i className={"far "+(isChecked ? "fa-check-square" : "fa-square")} /> {typeof props.label !== 'undefined' ? props.label : ""}
        </span>
    )
}

export default Checkbox;
