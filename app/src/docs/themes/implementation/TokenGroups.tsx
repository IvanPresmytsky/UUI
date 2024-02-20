import React, { useState } from 'react';
import { Blocker, Button, FlexCell, FlexRow, FlexSpacer, LinkButton, Panel, RichTextView, SuccessNotification, Text, Tooltip } from '@epam/uui';
import { INotificationContext, useUuiContext } from '@epam/uui-core';
import { copyTextToClipboard } from '../../../helpers';
import { useTokensDoc } from '../../../sandbox/tokens/docs/useTokensDoc';
import { ISemanticTableProps, ISkinTitleProps, ITokensDocGroup, ITokensDocItem } from '../../../sandbox/tokens/docs/types';
import css from './TokenGroups.module.scss';
import { ReactComponent as hideDetailsIcon } from '@epam/assets/icons/common/action-eye-off-outline-18.svg';
import { ReactComponent as showDetailsIcon } from '@epam/assets/icons/common/action-eye-outline-18.svg';

// The config file with titles and descriptions to data groups and subgroups placed here: ( app/src/sandbox/tokens/docs/config.ts )

const showNotification = (color: string, uuiNotifications: INotificationContext) => {
    uuiNotifications
        .show(
            (props) => (
                <SuccessNotification { ...props }>
                    <Text size="36" fontSize="14">
                        { `The (${color}) token successfully copied to clipboard!` }
                    </Text>
                </SuccessNotification>
            ),
            { position: 'bot-left' },
        )
        .catch(() => null);
};

export function TokenGroups() {
    const { loading, tokens } = useTokensDoc();

    const renderAllTokens = () => {
        if (loading) {
            return null;
        }
        return tokens.map((group) => <Groups group={ group } level={ 1 } key={ group.id } />);
    };

    return (
        <React.Fragment>
            <Blocker isEnabled={ loading } />
            { renderAllTokens() }
        </React.Fragment>
    );
}

function Groups(props: { group: ITokensDocGroup, level: number }) {
    const { group, level } = props;
    const { title, description } = group;

    if (level === 1) {
        return (
            <div className={ css.root }>
                <RichTextView size="16">
                    <h2 className={ css.groupTitle }>{ title }</h2>
                    <p className={ css.groupInfo }>{ description }</p>
                </RichTextView>
                <TokenGroupChildren group={ group } level={ 2 } />
            </div>
        );
    }
    return (
        <div>
            <RichTextView size="16">
                <h3 className={ css.subgroupTitle }>{ title }</h3>
                <p>{ description }</p>
            </RichTextView>
            <TokenGroupChildren group={ group } level={ 2 } />
        </div>
    );
}

const SemanticBlocks = (subgroup: ITokensDocGroup, details: boolean) => {
    const { uuiNotifications } = useUuiContext();

    if (subgroup._type === 'group_with_items') {
        return subgroup.items.map((item) => {
            const valueBackground = item.value ? `var(${item.cssVar})` : 'transparent';

            const renderTooltipContent = () => (
                <FlexCell grow={ 1 }>
                    <FlexCell grow={ 1 } textAlign="center" cx="uui-semantic-tooltip-title">
                        <Text>
                            Copy
                            {' '}
                            <span>
                                var(
                                { item.cssVar }
                                {' '}
                                )
                            </span>
                            {' '}
                            to clipboard
                        </Text>
                    </FlexCell>
                    <FlexCell grow={ 1 }>
                        <div className="uui-semantic-tooltip">
                            <Text fontSize="12" color="tertiary">Code name</Text>
                            <Text fontSize="12">{ item.cssVar }</Text>
                        </div>
                        <div className="uui-semantic-tooltip-middle">
                            <Text fontSize="12" color="tertiary">Figma name</Text>
                            <Text fontSize="12">{ item.cssVar.replace(/^--uui-/, '') }</Text>
                        </div>
                        <div className="uui-semantic-tooltip-last">
                            <Text fontSize="12" color="tertiary">Reference token</Text>
                            <Text fontSize="12">{ item.baseToken }</Text>
                            <LinkButton size="24" caption="Learn more" link={ { pathname: '' } } />
                        </div>
                    </FlexCell>
                </FlexCell>
            );

            const semanticClickHandler = () => copyTextToClipboard(item.cssVar, () => showNotification(item.cssVar, uuiNotifications));

            return (
                <FlexCell key={ item.cssVar + item.value } grow={ 1 } alignSelf="flex-start">
                    <Tooltip content={ item.value } placement="top" openDelay={ 200 }>
                        <div
                            className={ css.colorViewer }
                            style={ { backgroundColor: valueBackground } }
                        >
                            { !item.cssVar && <Text color="critical" fontWeight="600">No data...</Text> }
                        </div>
                    </Tooltip>
                    <div>
                        <Tooltip rawProps={ { style: { width: 'max-content' } } } closeOnMouseLeave="boundary" closeDelay={ 300 } content={ renderTooltipContent() } placement="auto" openDelay={ 1000 } color="neutral">
                            <Text cx={ [css.var] } onClick={ semanticClickHandler }>
                                {item.cssVar.replace(/^--uui-/, '')}
                            </Text>
                        </Tooltip>
                        <Tooltip rawProps={ { style: { width: 'max-content' } } } closeOnMouseLeave="boundary" closeDelay={ 300 } content={ renderTooltipContent() } placement="auto" openDelay={ 1000 } color="neutral">
                            <Text cx={ [css.semanticItem, !details && css.hiddenItem] } fontSize="12" onClick={ semanticClickHandler }>
                                { item.value.toUpperCase() }
                            </Text>
                        </Tooltip>
                        <Tooltip rawProps={ { style: { width: 'max-content' } } } closeOnMouseLeave="boundary" closeDelay={ 300 } content={ renderTooltipContent() } placement="auto" openDelay={ 1000 } color="neutral">
                            <Text cx={ [css.semanticItem, !details && css.hiddenItem] } fontSize="12" color="tertiary" onClick={ semanticClickHandler }>
                                { item.baseToken }
                            </Text>
                        </Tooltip>
                    </div>
                </FlexCell>
            ); 
        });
    }
};

function SemanticTable({ group, details, setDetails }: ISemanticTableProps) {
    // to sort semantic table rows in correct order like in the figma
    const RIGHT_ORDER = ['Primary', 'Secondary', 'Accent', 'Critical', 'Info', 'Success', 'Warning', 'Error'];
    const SKIN_COLOR_TOOLTIP_TEXT = (
        <React.Fragment>
            <div>Skin specific color name.</div>
            <div>Used as legacy in some skins.</div>
        </React.Fragment>
    );

    const getSkinTitle = (subgroup: ISkinTitleProps) => {
        const stringArray = subgroup.items[0].baseToken?.split('/');
        if (!stringArray) return undefined;
        const rawTitle = stringArray[stringArray?.length - 1];
        return rawTitle.replace(/[^a-zA-Z]/g, '').replace(/^\w/, (c) => c.toUpperCase());
    };

    return (
        <React.Fragment>
            <div className={ css.semanticTableHeader }>
                <FlexCell grow={ 1 }>
                    <Button
                        cx={ css.hideButton }
                        size="30"
                        fill="none"
                        color="primary"
                        caption={ details ? 'Hide details' : 'Show details' }
                        icon={ details ? hideDetailsIcon : showDetailsIcon }
                        onClick={ () => setDetails((prev) => !prev) }
                    />
                </FlexCell>
                {group.subgroupsHeader.map((header) => <Text key={ header } fontSize="12" fontStyle="italic" cx={ css.noPaddings }>{header}</Text>)}
            </div>
            <div className={ css.semanticTableRows }>
                {group.subgroups.sort((a, b) => RIGHT_ORDER.indexOf(a.title) - RIGHT_ORDER.indexOf(b.title)).map((subgroup) => {
                    let skinThemeTitle = '';
                    if (subgroup._type === 'group_with_items') {
                        skinThemeTitle = getSkinTitle(subgroup);
                    }
                    return (
                        <React.Fragment key={ subgroup.description }>
                            <FlexCell grow={ 1 } cx={ css.semanticTitleCell }>
                                <FlexRow columnGap="6" cx={ css.semanticTitleRow }>
                                    <Text fontSize="18" fontWeight="600" cx={ css.noPaddings }>{subgroup.title}</Text>
                                    <Tooltip
                                        content={ SKIN_COLOR_TOOLTIP_TEXT }
                                        placement="top"
                                        openDelay={ 200 }
                                    >
                                        <Text fontWeight="600" color="disabled" cx={ css.noPaddings }>{skinThemeTitle}</Text>
                                    </Tooltip>
                                </FlexRow>
                                <Text cx={ [css.noPaddings, css.headerDescription] }>{subgroup.description}</Text>
                            </FlexCell>
                            {SemanticBlocks(subgroup, details)}
                        </React.Fragment>
                    );
                })}
            </div>
        </React.Fragment>
    );
}

function TokenGroupChildren(props: { group: ITokensDocGroup, level: number }) {
    const { group } = props;
    const { _type } = group;
    const NO_DATA_IN_GROUP = <Text color="info" fontSize="16" fontStyle="italic">The data of this group is in work. It will be soon...</Text>;
    const [details, setDetails] = useState<boolean>(false);

    if (_type === 'group_with_subgroups') {
        if (group.subgroups.length) {
            return <SemanticTable group={ group } details={ details } setDetails={ setDetails } />;
        }
        return NO_DATA_IN_GROUP;
    } else {
        if (group.items.length) {
            return (
                <Panel background="surface-main" cx={ css.subgroup } shadow={ true }>
                    <TokenGroupItems items={ group.items } />
                </Panel>
            );
        }
        return NO_DATA_IN_GROUP;
    }
}

function TokenGroupItems(props: { items: ITokensDocItem[] }) {
    const { items } = props;
    const { uuiNotifications } = useUuiContext();

    const list = items.map((item) => {
        const valueBackground = item.value ? `var(${item.cssVar})` : 'transparent';
        const renderTooltipContent = () => (
            <span>
                Copy
                {' '}
                <span style={ { color: 'var(--uui-neutral-40)' } }>
                    var(
                    {item.cssVar}
                    )
                </span>
                {' '}
                to clipboard
            </span>
        );

        return (
            <FlexRow cx={ css.tokenCard } borderBottom={ true } alignItems="center" key={ item.value + item.cssVar }>
                <FlexCell width="auto">
                    <Tooltip renderContent={ renderTooltipContent } placement="top" openDelay={ 200 }>
                        <Text cx={ css.var } onClick={ () => copyTextToClipboard(item.cssVar, () => showNotification(item.cssVar, uuiNotifications)) }>
                            { item.cssVar.replace(/^--uui-/, '') }
                        </Text>
                    </Tooltip>
                    {/* { item.description && <Text>{ item.description }</Text> } */}
                    {/* { item.useCases && <Text cx={ css.tokenCardInfo }>{ item.useCases }</Text> } */}
                </FlexCell>
                <FlexSpacer />
                <FlexCell width="auto">
                    <Tooltip content={ item.value || 'No data' } placement="top" openDelay={ 200 }>
                        <div className={ css.colorViewer } style={ { backgroundColor: valueBackground } }>
                            { !item.value && <Text color="critical" fontWeight="600">No data...</Text> }
                        </div>
                    </Tooltip>
                </FlexCell>
            </FlexRow>
        );
    });
    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <React.Fragment>
            {list}
        </React.Fragment>
    );
}
