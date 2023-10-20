import { Slider as UuiSlider, SliderBaseProps } from '@epam/uui-components';
import css from './Slider.module.scss';
import { withMods } from '@epam/uui-core';

export interface SliderMods {}

export function applySliderMods() {
    return [css.root];
}

export const Slider = withMods<SliderBaseProps<number>, SliderMods>(UuiSlider, applySliderMods);
