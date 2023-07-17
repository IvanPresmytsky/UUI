import { fireEvent, within, screen } from '../extensions/testingLibraryReactExt';
import { PickerTestObject } from './Picker';

export class PickerModalTestObject extends PickerTestObject {
    static async findSearchInput() {
        const modal = await this.findDialog('modal');
        const input = await within(modal).findByPlaceholderText('Type text for quick search');
        return input;
    }

    static async closeModal() {
        const modal = await this.findDialog('modal');
        const closeButton = await within(modal).findByRole('button', { name: 'Close modal' });
        fireEvent.click(closeButton);
    }

    static async clickSelectItems() {
        const modal = await this.findDialog('modal');
        const selectButton = within(modal).getByRole('button', { name: 'Select' });
        fireEvent.click(selectButton);
    }
}
