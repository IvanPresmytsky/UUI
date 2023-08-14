import React, { useEffect, useRef, useState } from 'react';
import css from './AdaptivePanel.module.scss';
import { FlexRow } from '../layout/flexItems';
import { measureAdaptiveItems } from './measureItemsUtils';
import { useLayoutEffectSafeForSsr } from '@epam/uui-core';
import { AdaptivePanelProps } from './types';
import cx from 'classnames';

export function AdaptivePanel(props: AdaptivePanelProps) {
    const [itemsWidth, setItemsWidth] = useState<Record<string, number>>();
    const [isChanged, setIsChanged] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const displayedRowRef = useRef<HTMLDivElement>(null);

    const getItemsWidth = () => {
        if (!displayedRowRef.current) {
            return;
        }
        const children = Array.from(displayedRowRef.current.children);

        if (!children.length) return;
        const calculatedItemsWidth: Record<string, number> = {};
        children.forEach((child, index) => {
            calculatedItemsWidth[props.items[index].id] = child.getBoundingClientRect().width;
        });

        return calculatedItemsWidth;
    };

    useLayoutEffectSafeForSsr(() => {
        if (isChanged || !itemsWidth) {
            const newItemsWidth = getItemsWidth();
            setItemsWidth(newItemsWidth);
            setIsChanged(false);
        }
    });

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) =>
            requestAnimationFrame(() => {
                if (!Array.isArray(entries) || !entries.length) return;
                setIsChanged(true);
            }));

        resizeObserver.observe(displayedRowRef.current);
        resizeObserver.observe(wrapperRef.current);
        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const renderItems = () => {
        if (isChanged || !itemsWidth) {
            return props.items.map((i) => i.render(i, [], props.items));
        }
        const wrapperWidth = wrapperRef?.current ? wrapperRef.current.getBoundingClientRect().width : 0;

        const measuredItems = measureAdaptiveItems(props.items, wrapperWidth, itemsWidth);
        return measuredItems.displayed.map((i) => i.render(i, measuredItems.hidden, measuredItems.displayed));
    };

    return (
        <div { ...props.rawProps } className={ cx(props.cx, css.mainWrapper) } ref={ wrapperRef }>
            <FlexRow ref={ displayedRowRef }>{ renderItems() }</FlexRow>
        </div>
    );
}
