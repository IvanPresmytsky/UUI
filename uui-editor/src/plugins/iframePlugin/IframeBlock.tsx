import * as React from 'react';
import css from './iframeBlock.module.scss';
import { uuiMod } from '@epam/uui-core';
import cx from 'classnames';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { useSelected } from 'slate-react';

const IFRAME_GLOBAL_CLASS = 'uui-rte-iframe';
const PDF_GLOBAL_CLASS = 'uui-rte-iframe-pdf';

export function IframeBlock(props: any) {
    const { attributes, children, element } = props;
    const isSelected = useSelected();

    const src = element.data.src || element.src;
    const isPdf = element.data.extension === 'pdf';
    const style = element.data.style;

    return (
        <div { ...attributes }>
            <iframe
                title={ element.src }
                allowFullScreen={ true }
                src={ sanitizeUrl(src) }
                style={ style }
                className={ cx(css.content, isSelected && uuiMod.focus, IFRAME_GLOBAL_CLASS, isPdf && PDF_GLOBAL_CLASS) }
            />
            { children }
        </div>
    );
}
