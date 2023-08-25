import { fireEvent, within, screen, waitFor } from '../extensions/testingLibraryReactExt';

export interface OptionConfig {
    editMode?: string;
}

export class PickerTestObject {
    static editMode: string;

    static getOptions(props: { busy?: boolean, editMode?: string } = {}) {
        const dialog = within(this.getDialog(props.editMode));
        const params: any = {};
        if (typeof props.busy !== 'undefined') {
            params.busy = props.busy;
        }
        return dialog.getAllByRole('option', params);
    }

    static async findOptions(props: { busy?: boolean, editMode?: string } = {}) {
        const dialog = within(await this.findDialog(props.editMode));
        const params: any = {};
        if (typeof props.busy !== 'undefined') {
            params.busy = props.busy;
        }
        return await dialog.findAllByRole('option', params);
    }

    static async findOptionsText(props: { busy?: boolean, editMode?: string } = {}) {
        const opts = await this.findOptions(props);
        return opts.map((o) => o.textContent?.trim());
    }

    static async findCheckedOptions(props: { editMode?: string } = {}) {
        const dialog = within(await this.findDialog(props.editMode));
        return (await dialog.findAllByRole('option')).filter((opt) => {
            return (within(opt).getByRole('checkbox') as HTMLInputElement).checked;
        }).map((e) => e.textContent?.trim());
    }

    static async findSelectedOption(props: OptionConfig = {}) {
        const dialog = within(await this.findDialog(props.editMode));
        return (await dialog.findAllByRole('option')).filter((opt) => {
            return (within(opt).queryByLabelText('Selected') as HTMLInputElement);
        }).map((e) => e.textContent?.trim()).filter(Boolean)[0];
    }

    static async findUncheckedOptions(props: OptionConfig = {}) {
        const dialog = within(await this.findDialog(props.editMode));
        return (await dialog.findAllByRole('option')).filter((opt) => {
            return !(within(opt).getByRole('checkbox') as HTMLInputElement).checked;
        }).map((e) => e.textContent?.trim());
    }

    static async clickClearAllOptions(props: OptionConfig = {}) {
        const dialog = within(await this.findDialog(props.editMode));
        const selectAllButton = await dialog.findByRole('button', { name: 'CLEAR ALL' });
        fireEvent.click(selectAllButton);
    }

    static async clickSelectAllOptions(props: OptionConfig = {}) {
        const dialog = within(await this.findDialog(props.editMode));
        const selectAllButton = await dialog.findByRole('button', { name: 'SELECT ALL' });
        fireEvent.click(selectAllButton);
    }

    static async clickShowOnlySelected(props: OptionConfig = {}) {
        const dialog = within(await this.findDialog(props.editMode));
        const showOnlySelected = await dialog.findByRole('switch', { name: 'Show only selected' });
        fireEvent.click(showOnlySelected);
    }

    static async clickOptionByText(optionText: string, config?: OptionConfig) {
        const opt = await this.findOption(optionText, config);
        fireEvent.click(opt);
    }

    static async clickOptionCheckbox(optionText: string, config?: OptionConfig) {
        const opt = await this.findOption(optionText, config);
        fireEvent.click(within(opt).getByRole('checkbox'));
    }

    static async clickOptionUnfold(optionText: string, config?: OptionConfig) {
        const opt = await this.findOption(optionText, config);
        fireEvent.click(within(opt).getByRole('button', { name: 'Unfold' }));
    }

    static async hasOptions(props?: { busy?: boolean } & OptionConfig) {
        return (await this.findOptions(props)).length > 0;
    }

    public static async findDialog(editMode?: string) {
        return await screen.findByRole(editMode ?? this.editMode ?? 'dialog');
    }

    public static getDialog(editMode?: string) {
        return screen.getByRole(editMode ?? this.editMode ?? 'dialog');
    }

    public static queryDialog(editMode?: string) {
        return screen.queryByRole(editMode ?? this.editMode ?? 'dialog');
    }

    protected static async findOption(optionText: string, { editMode }: OptionConfig = {}) {
        const dialog = within(await this.findDialog(editMode));
        return await dialog.findByRoleAndText({ role: 'option', text: optionText });
    }

    public static async waitForOptionsToBeReady(editMode?: string) {
        return await waitFor(
            () => expect(this.getOptions({ editMode, busy: false }).length).toBeGreaterThan(0),
        );
    }
}
