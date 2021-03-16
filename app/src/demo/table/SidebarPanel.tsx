import * as React from 'react';
import { Badge, EpamAdditionalColor, FlexCell, FlexRow, FlexSpacer, IconButton, Panel, ScrollBars, Text } from '@epam/promo';
import { Person } from '@epam/uui-docs';
import * as css from './SidebarPanel.scss';
import * as  crossIcon from '@epam/assets/icons/common/navigation-close-24.svg';
import { CSSTransition } from 'react-transition-group';

interface SidebarPanelProps {
    data: Person;
    onClose?: () => void;
}

export const SidebarPanel: React.FC<SidebarPanelProps> = ({ data, onClose }) => {
    return <CSSTransition in={ !!data } classNames={ 'sidebar' }  timeout={ 500 }>
        <Panel cx={ css.wrapper } background='white'>
            <FlexRow borderBottom padding='24' >
                <Text size="48" font='sans-semibold'>Detailed Information</Text>
                <FlexSpacer />
                <FlexCell shrink={ 0 } width='auto'><IconButton icon={ crossIcon } onClick={ onClose } /></FlexCell>
            </FlexRow>
            { data &&
                <ScrollBars>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >Name</Text></FlexCell><Text cx={ css.noWrap } >{ data.name }</Text></FlexRow>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >Status</Text></FlexCell><Badge cx={ css.status } caption={ data.profileStatus } fill='transparent' color={ data.profileStatus.toLowerCase() as EpamAdditionalColor } /></FlexRow>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >Job title</Text></FlexCell><Text cx={ css.noWrap } >{ data.jobTitle }</Text></FlexRow>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >Title level</Text></FlexCell><Text>{ data.titleLevel }</Text></FlexRow>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >Office</Text></FlexCell><Text cx={ css.noWrap } >{ data.officeAddress }</Text></FlexRow>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >City</Text></FlexCell><Text cx={ css.noWrap } >{ data.cityName }</Text></FlexRow>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >Country</Text></FlexCell><Text cx={ css.noWrap } >{ data.countryName }</Text></FlexRow>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >Manager</Text></FlexCell><Text cx={ css.noWrap } >{ data.managerName }</Text></FlexRow>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >Hire date</Text></FlexCell><Text cx={ css.noWrap } >{ new Date(data.hireDate).toLocaleDateString() }</Text></FlexRow>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >Related NPR</Text></FlexCell><Text cx={ css.noWrap } >{ data.relatedNPR ? 'Completed' : 'Uncompleted' }</Text></FlexRow>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >Department</Text></FlexCell><Text cx={ css.noWrap } >{ data.departmentName }</Text></FlexRow>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >Email</Text></FlexCell><Text cx={ css.noWrap } >{ data.email }</Text></FlexRow>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >Modified</Text></FlexCell><Text cx={ css.noWrap } >{ new Date(data.modifiedDate).toLocaleDateString() }</Text></FlexRow>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >Notes</Text></FlexCell><Text cx={ css.noWrap } >{ data.notes || '-' }</Text></FlexRow>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >Primary skill</Text></FlexCell><Text cx={ css.noWrap } >{ data.primarySkill }</Text></FlexRow>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >Production category</Text></FlexCell><Text cx={ css.noWrap } >{ data.productionCategory ? 'Production' : 'Preproduction' }</Text></FlexRow>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >UID</Text></FlexCell><Text cx={ css.noWrap } >{ data.uid }</Text></FlexRow>
                    <FlexRow padding='24' ><FlexCell shrink={ 0 } width={ 162 }><Text color='gray60' >Birth date</Text></FlexCell><Text cx={ css.noWrap } >{ new Date(data.birthDate).toLocaleDateString() }</Text></FlexRow>
                </ScrollBars>
            }

        </Panel>
    </CSSTransition>;
};
