import React, { useState } from 'react';
import { Avatar, DropdownMenuBody, DropdownMenuButton, DropdownMenuSwitchButton, DropdownMenuSplitter, DropdownMenuHeader, DropdownSubMenu, IDropdownMenuItemProps, Button, ControlGroup, Dropdown, Panel } from '@epam/promo';
import { DropdownBodyProps } from "@epam/uui-components";
import { ReactComponent as LogoutIcon } from '@epam/assets/icons/common/navigation-logout-24.svg';
import { ReactComponent as menuIcon } from '@epam/assets/icons/common/navigation-more_vert-12.svg';

const DropdownMenuSwitchButtonElement = (props: IDropdownMenuItemProps) => {
    const [selected, setSelected] = useState(false);
    return (
        <DropdownMenuSwitchButton { ...props } onValueChange={ setSelected } isSelected={ selected } />
    );
};

const initialStatusState = [
    { id: 1, caption: "Available", checked: false },
    { id: 2, caption: "Busy", checked: false },
    { id: 3, caption: "Do not disturb", checked: false },
    { id: 4, caption: "Be right back", checked: false },
    { id: 5, caption: "Appear away", checked: false },
];

const initialLayerState = [
    { id: 1, caption: "[Link Button] Tokens", checked: false },
    { id: 2, caption: "[User Card] Create as a global component", checked: false },
    { id: 3, caption: "[Input] Rework & Improve components", checked: false },
    { id: 4, caption: "[Colors] Create accessible palette", checked: false },
    { id: 5, caption: "[Colors & Styles] Add Specification", checked: false },
];

export default function BasicDropdownMenuExample() {
    const [status, setStatus] = useState(initialStatusState);
    const [layer, setLayer] = useState(initialLayerState);

    const statusSetter = (state: typeof initialStatusState | typeof initialLayerState, id: number, isChecked: boolean) => {
        return state.map(item => {
            item.checked = item.id === id ? !isChecked : false;
            return item;
        });
    };

    const setStatusHandler = (id: number, isChecked: boolean, type: string) => {
        switch (type) {
            case 'layer':
                setLayer((prevState) => statusSetter(prevState, id, isChecked));
                break;
            case 'status':
                setStatus((prevState) => statusSetter(prevState, id, isChecked));
                break;
            default:
                return;
        }
    };

    const getSubmenuLayer = () => layer.map(item => <DropdownMenuButton
        caption={ item.caption }
        onClick={ () => setStatusHandler(item.id, item.checked, 'layer') }
        isActive={ item.checked }/>);

    const DropdownBody = ({ onClose }: DropdownBodyProps) => {
        return (
            <DropdownMenuBody onClose={ onClose } style={ { maxWidth: "250px" } }>
                <DropdownMenuHeader caption="Alex Smith"/>
                <DropdownMenuSplitter/>
                <DropdownMenuButton caption="Profile"/>
                <DropdownSubMenu caption="Status">
                    { status.map(item => <DropdownMenuButton
                        caption={ item.caption }
                        onClick={ () => setStatusHandler(item.id, item.checked, 'status') }
                        isSelected={ item.checked }/>) }
                </DropdownSubMenu>
                <DropdownMenuButton caption="Activities"/>
                <DropdownSubMenu caption="Tasks">
                    <DropdownSubMenu caption="Backlog">
                        { getSubmenuLayer() }
                    </DropdownSubMenu>
                    <DropdownSubMenu caption="To Do">
                        { getSubmenuLayer() }
                    </DropdownSubMenu>
                    <DropdownSubMenu caption="Doing">
                        { getSubmenuLayer() }
                    </DropdownSubMenu>
                    <DropdownSubMenu caption="Done">
                        { getSubmenuLayer() }
                    </DropdownSubMenu>
                    <DropdownSubMenu caption="Closed">
                        { getSubmenuLayer() }
                    </DropdownSubMenu>
                </DropdownSubMenu>
                <DropdownMenuSplitter/>
                <DropdownMenuSwitchButtonElement caption="Notifications"/>
                <DropdownMenuSplitter/>
                <DropdownMenuButton icon={ LogoutIcon } iconPosition="left" caption="Log Out"/>
            </DropdownMenuBody>
        );
    };

    const renderBody = () => {
        return (
            <Panel background="white" shadow={ true }>
                <DropdownMenuButton caption="Cancel Data Loads" onClick={ () => {} }/>
                <DropdownMenuButton caption="Deactivate" onClick={ () => {} }/>
                <DropdownMenuButton caption="Delete" onClick={ () => {} }/>
            </Panel>
        );
    };

    return (
        <>
            <Dropdown
                renderBody={ props => <DropdownBody { ...props } /> }
                renderTarget={ props => <Avatar
                    img={ 'https://avatars.dicebear.com/api/human/avatar12.svg?background=%23EBEDF5&radius=50' }
                    size={ '36' } { ...props } /> }
            />
            <ControlGroup>
                <Button size="36" caption="Action with selected" fill={ 'solid' } onClick={ () => {
                } }/>
                <Dropdown
                    renderBody={ renderBody }
                    renderTarget={ (props) =>
                        <Button { ...props } fill="solid" icon={ menuIcon } size="36" isDropdown={ false }/>
                    }
                    placement="top-end"
                />
            </ControlGroup>
        </>
    );
}
