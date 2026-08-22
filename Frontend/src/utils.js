import React from 'react';
import htm from 'htm';

export const html = htm.bind(React.createElement);

export function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

