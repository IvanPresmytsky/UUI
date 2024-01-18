import React from 'react';
import {
    Burger, BurgerButton, Button, Dropdown, DropdownMenuBody, DropdownMenuButton, FlexSpacer, GlobalMenu, IconContainer,
    MainMenu, MainMenuButton, Text,
} from '@epam/uui';
import { Anchor, MainMenuCustomElement } from '@epam/uui-components';
import { svc } from '../services';
import { analyticsEvents } from '../analyticsEvents';
import { useTheme } from '../helpers/useTheme';
import { ReactComponent as GitIcon } from '../icons/git-branch-18.svg';
import { ReactComponent as LogoIcon } from '../icons/logo.svg';
import { ReactComponent as DoneIcon } from '@epam/assets/icons/common/notification-done-18.svg';
import css from './AppHeader.module.scss';
import { themeName, TMode, TTheme } from './docs/docsConstants';

const GIT_LINK = 'https://github.com/epam/UUI';

export function AppHeader() {
    const { theme, toggleTheme } = useTheme();

    const sendEvent = (link: string) => {
        svc.uuiAnalytics.sendEvent(analyticsEvents.welcome.trusted(link));
    };

    const renderBurger = () => {
        const category = svc.uuiRouter.getCurrentLink().query.category;
        const pathName = svc.uuiRouter.getCurrentLink().pathname;
        return (
            <>
                <BurgerButton caption="Home" link={ { pathname: '/' } } clickAnalyticsEvent={ () => sendEvent('Welcome') } />
                <BurgerButton
                    caption="Documents"
                    link={ { pathname: '/documents', query: { id: 'overview' } } }
                    isLinkActive={ pathName === 'documents' && !category }
                    clickAnalyticsEvent={ () => sendEvent('Documents') }
                />
                <BurgerButton
                    caption="Assets"
                    link={ { pathname: '/documents', query: { id: 'icons', category: 'assets' } } }
                    isLinkActive={ pathName === '/documents' && category === 'assets' }
                    clickAnalyticsEvent={ () => sendEvent('Assets') }
                />
                <BurgerButton
                    caption="Components"
                    link={ {
                        pathname: '/documents',
                        query: {
                            category: 'components', id: 'accordion', mode: TMode.doc,
                        },
                    } }
                    isLinkActive={ pathName === '/documents' && category === 'components' }
                    clickAnalyticsEvent={ () => sendEvent('Components') }
                />
                <BurgerButton caption="Demo" link={ { pathname: '/demo' } } isLinkActive={ pathName === '/demo' } clickAnalyticsEvent={ () => sendEvent('Demo') } />
            </>
        );
    };

    const renderThemeSwitcher = () => {
        return (
            <Dropdown
                renderBody={ (props) => (
                    <DropdownMenuBody { ...props } rawProps={ { style: { width: '180px', padding: '6px 0', marginTop: '3px' } } }>
                        <DropdownMenuButton caption="Promo" icon={ theme === TTheme.promo && DoneIcon } isActive={ theme === TTheme.promo } iconPosition="right" onClick={ () => toggleTheme(TTheme.promo) } />
                        <DropdownMenuButton caption="Loveship Light" icon={ theme === TTheme.loveship && DoneIcon } isActive={ theme === TTheme.loveship } iconPosition="right" onClick={ () => toggleTheme(TTheme.loveship) } />
                        <DropdownMenuButton caption="Loveship Dark" icon={ theme === TTheme.loveship_dark && DoneIcon } isActive={ theme === TTheme.loveship_dark } iconPosition="right" onClick={ () => toggleTheme(TTheme.loveship_dark) } />
                        <DropdownMenuButton caption="Electric" icon={ theme === TTheme.electric && DoneIcon } isActive={ theme === TTheme.electric } iconPosition="right" onClick={ () => toggleTheme(TTheme.electric) } />
                        <DropdownMenuButton caption="Vanilla Thunder" icon={ theme === TTheme.vanilla_thunder && DoneIcon } isActive={ theme === TTheme.vanilla_thunder } iconPosition="right" onClick={ () => toggleTheme(TTheme.vanilla_thunder) } />
                    </DropdownMenuBody>
                ) }
                renderTarget={ (props) => (
                    <Button { ...props } cx={ css.themeSwitcherButton } caption={ themeName[theme] } fill="none" size="36" isDropdown={ true } />
                ) }
                placement="bottom-end"
                key="Theme-switcher"
            />
        );
    };

    const getMainMenuItems = () => {
        const category = svc.uuiRouter.getCurrentLink().query.category;
        const pathName = svc.uuiRouter.getCurrentLink().pathname;

        return [
            {
                id: 'burger',
                priority: 100500,
                collapsedContainer: true,
                render: () => <Burger renderBurgerContent={ renderBurger } logoUrl="/static/logo.svg" key="burger" />,
            },
            {
                id: 'logo',
                priority: 100499,
                render: () => (
                    <MainMenuCustomElement key="logo">
                        <Anchor link={ { pathname: '/' } } href={ GIT_LINK } onClick={ () => sendEvent('Welcome') } key="logo">
                            <IconContainer icon={ LogoIcon } cx={ css.logoIcon } />
                        </Anchor>
                    </MainMenuCustomElement>
                ),
            },
            {
                id: 'documents',
                priority: 3,
                render: () => (
                    <MainMenuButton
                        caption="Documents"
                        link={ { pathname: '/documents', query: { id: 'overview' } } }
                        isLinkActive={ pathName === '/documents' && category !== 'components' && category !== 'assets' }
                        showInBurgerMenu
                        clickAnalyticsEvent={ analyticsEvents.header.link('Documents') }
                        key="documents"
                    />
                ),
            },
            {
                id: 'assets',
                priority: 2,
                render: () => (
                    <MainMenuButton
                        caption="Assets"
                        link={ { pathname: '/documents', query: { id: 'icons', category: 'assets' } } }
                        isLinkActive={ pathName === '/documents' && category === 'assets' }
                        showInBurgerMenu
                        clickAnalyticsEvent={ analyticsEvents.header.link('Assets') }
                        key="assets"
                    />
                ),
            },
            {
                id: 'components',
                priority: 2,
                render: () => (
                    <MainMenuButton
                        caption="Components"
                        link={ {
                            pathname: '/documents',
                            query: {
                                category: 'components', id: 'accordion', mode: 'doc',
                            },
                        } }
                        isLinkActive={ pathName === '/documents' && category === 'components' }
                        showInBurgerMenu
                        clickAnalyticsEvent={ analyticsEvents.header.link('Components') }
                        key="components"
                    />
                ),
            },
            {
                id: 'demo',
                priority: 2,
                render: () => (
                    <MainMenuButton
                        caption="Demo"
                        link={ { pathname: '/demo' } }
                        isLinkActive={ pathName === '/demo' }
                        showInBurgerMenu
                        clickAnalyticsEvent={ analyticsEvents.header.link('Demo') }
                        key="demo"
                    />
                ),
            },
            window.location.host.includes('localhost') && {
                id: 'Sandbox',
                priority: 1,
                render: () => <MainMenuButton caption="Sandbox" link={ { pathname: '/sandbox' } } isLinkActive={ pathName === '/sandbox' } key="sandbox" />,
            },
            { id: 'flexSpacer', priority: 100500, render: () => <FlexSpacer priority={ 100500 } key="spacer" /> },

            {
                id: 'themeCaption',
                priority: 2,
                render: () => (
                    <MainMenuButton
                        captionCX={ css.themeCaption }
                        caption="Theme"
                        showInBurgerMenu
                        key="themeCaption"
                    />
                ),
            },
            { id: 'theme', priority: 3, render: renderThemeSwitcher },
            {
                id: 'git',
                priority: 0,
                render: () => (
                    <Anchor cx={ css.linkContainer } href={ GIT_LINK } target="_blank" onClick={ () => sendEvent(GIT_LINK) } key="git">
                        <IconContainer icon={ GitIcon } cx={ css.gitIcon } />
                        <Text fontWeight="600" fontSize="14" lineHeight="24" cx={ css.linkCaption }>
                            Open Git
                        </Text>
                    </Anchor>
                ),
            },
            { id: 'survey',
                priority: 0,
                render: () => (
                    <Anchor
                        rawProps={ { style: { height: '60px' } } }
                        target="_blank"
                        href="https://forms.office.com/e/9iEvJUKdeM"
                    >
                        <img height="60px" src="/static/survey_banner.png" alt="Take part in UUI survey" />
                    </Anchor>
                ),
            },
            { id: 'globalMenu', priority: 100500, render: () => <GlobalMenu key="globalMenu" /> },
        ].filter((i) => !!i);
    };

    return <MainMenu cx={ css.root } items={ getMainMenuItems() }></MainMenu>;
}
