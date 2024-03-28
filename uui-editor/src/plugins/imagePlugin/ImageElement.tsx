import React, { useMemo, useRef } from 'react';
import {
    PlateElement,
    PlateElementProps,
    Value,
} from '@udecode/plate-common';
import {
    Image,
    useMediaState,
} from '@udecode/plate-media';
import {
    useFocused, useReadOnly, useSelected,
} from 'slate-react';
import cx from 'classnames';
import css from './ImageElement.module.scss';
import { Resizable, ResizeHandle } from '../../implementation/Resizable';
import { IImageElement, PlateImgAlign } from './types';
import { Caption, CaptionTextarea } from '@udecode/plate-caption';

interface ImageElementProps extends PlateElementProps<Value, IImageElement> {
    align: PlateImgAlign;
}

const MIN_IMG_WIDTH = 12;
const MIN_CAPTION_WIDTH = 92;

export function ImageElement({
    className,
    align,
    ...props
}: ImageElementProps) {
    const { children, nodeProps } = props;

    const focused = useFocused();
    const selected = useSelected();
    const readOnly = useReadOnly();

    useMediaState();

    const imageRef = useRef<HTMLImageElement>(null);

    const isCaptionEnabled = useMemo(() => {
        const imageWidth = imageRef.current?.width;
        return typeof imageWidth === 'number' && imageWidth >= MIN_CAPTION_WIDTH;
    }, [imageRef.current?.width]);

    const aligns = [
        align === 'center' && css.alignCenter,
        align === 'left' && css.alignLeft,
        align === 'right' && css.alignRight,
    ];

    const visible = focused && selected;

    const resizeHandleClasses = [
        css.resizeHandleOpacity,
        visible && css.resizeHandleVisible, // for mobile
    ];

    return (
        <PlateElement className={ cx(className) } { ...props }>
            <figure className={ cx(css.group) } contentEditable={ false }>
                <Resizable
                    align={ align }
                    options={ {
                        align,
                        readOnly,
                        minWidth: MIN_IMG_WIDTH,
                    } }
                >
                    {!readOnly && (
                        <ResizeHandle
                            options={ { direction: 'left' } }
                            className={ cx(resizeHandleClasses) }
                        />
                    )}
                    <Image
                        { ...nodeProps }
                        className={ cx(
                            css.image,
                            visible && css.selectedImage, // for mobile
                            nodeProps?.className,
                        ) }
                        ref={ imageRef }
                    />
                    {!readOnly && (
                        <ResizeHandle
                            options={ { direction: 'right' } }
                            className={ cx(resizeHandleClasses) }
                        />
                    )}
                </Resizable>

                {isCaptionEnabled && (
                    <Caption style={ { width: imageRef.current?.width } } className={ cx(css.imageCaption, ...aligns) }>
                        <CaptionTextarea
                            className={ cx(css.caption) }
                            placeholder="Write a caption..."
                            readOnly={ readOnly }
                        />
                    </Caption>
                )}
            </figure>

            {children}
        </PlateElement>
    );
}
