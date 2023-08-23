import { uuiMod } from '@epam/uui-core';
import cx from 'classnames';
import React from 'react';
import { useSelected } from 'slate-react';
import { PlateElement, PlateElementProps } from '@udecode/plate-common';

import css from './Separator.module.scss';

const Separator = React.forwardRef<React.ElementRef<typeof PlateElement>, PlateElementProps>(({ className, nodeProps, ...props }, ref) => {
    const { children } = props;

    const selected = useSelected();

    return (
        <PlateElement ref={ ref } { ...props }>
            <div
                contentEditable={ false }
                className={ cx(css.separator, selected && uuiMod.focus) }
            >
            </div>
            { children }
        </PlateElement>
    );
});

export { Separator };
