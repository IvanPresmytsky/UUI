import * as React from 'react';
import {
    IDndActor, DropPosition, AcceptDropParams, DndActorRenderParams, DropPositionOptions,
    DndDropLevelsRenderParams,
    DndDropLevelRenderProps,
} from '../../types/dnd';

import { UuiContexts } from '../../types/contexts';

import {
    isEventTargetInsideDraggable,
    isEventTargetInsideInput,
    releasePointerCaptureOnEventTarget,
} from '../../helpers/events';
import { getSector } from './helpers';
import { uuiDndState, uuiMarkers } from '../../constants';
import { UuiContext } from '../UuiContext';
import { DndContextState } from './DndContext';

export interface DndActorProps<TId, TSrcData, TDstData> extends IDndActor<TSrcData, TDstData> {
    /** Render callback for DragActor content */
    render(props: DndActorRenderParams, overlays?: React.ReactNode): React.ReactNode;
    renderDropLevels?(props: DndDropLevelsRenderParams<TId>): React.ReactNode;

    isMultilevel?: boolean;
    
    id: TId;
    path?: TId[];
}

const DND_START_THRESHOLD = 5;

interface DndActorState {
    pointerX: number;
    pointerY: number;
    isMouseDown: boolean;
    isDragging: boolean;
    isMouseOver: boolean;
    position?: DropPosition;
    draggingOverLevel: number | null;
    
    dndContextState: DndContextState;
}

const initialState: DndActorState = {
    pointerX: 0,
    pointerY: 0,
    isMouseDown: false,
    isDragging: false,
    isMouseOver: false,
    position: null,
    draggingOverLevel: null,
    dndContextState: {
        isDragging: false,
        draggingOverInfo: null,
    },
};

/**
 * This workaround is needed to make it tree-shakable, but it does not look good.
 * It's better to rewrite it to functional component instead.
 * The key point here is to get rid of any static props (like sectorPositionPriorities, contextType).
 */

export const DndActor = TREE_SHAKEABLE_INIT();
function TREE_SHAKEABLE_INIT() {
    return class DndActorComponent<TId = any, TSrcData = any, TDstData = any> extends React.Component<DndActorProps<TId, TSrcData, TDstData>, DndActorState> {
        state = initialState;
        static contextType = UuiContext;
        public context: UuiContexts;
        dndRef = React.createRef<HTMLElement>();

        componentDidMount() {
            this.context?.uuiDnD?.subscribe?.(this.contextUpdateHandler);
            this.context?.uuiDnD.setDndRowData({
                id: this.props.id,
                path: this.props.path ?? [],
                dstData: this.props.dstData,
                srcData: this.props.srcData,
            });
            window.addEventListener('pointerup', this.windowPointerUpHandler);
            window.addEventListener('pointermove', this.windowPointerMoveHandler);
        }

        componentWillUnmount() {
            window.removeEventListener('pointerup', this.windowPointerUpHandler);
            window.removeEventListener('pointermove', this.windowPointerMoveHandler);
            this.context.uuiDnD.unsubscribe(this.contextUpdateHandler);
        }

        contextUpdateHandler = (dndContextState: DndContextState) => {
            this.setState({ dndContextState });
        };

        windowPointerUpHandler = () => {
            if (this.state.isDragging || this.state.isMouseDown) {
                this.setState(() => initialState);
                this.context.uuiDnD.endDrag();
            }
        };

        windowPointerMoveHandler = (e: MouseEvent) => {
            if (
                !this.state.isMouseDown
                    || e.buttons === 0 // can happen if native drag-n-drop occurs
                    || this.state.isDragging
            ) return;

            if (isEventTargetInsideInput(e, this.dndRef.current)) {
                return;
            }

            const mouseCoords = this.context.uuiDnD.getMouseCoords();
            const dist = Math.sqrt(Math.pow(this.state.pointerX - mouseCoords.mousePageX, 2) + Math.pow(this.state.pointerY - mouseCoords.mousePageY, 2));

            if (dist > DND_START_THRESHOLD) {
                this.context.uuiDnD.startDrag(this.dndRef.current, this.props.srcData, () =>
                    this.props.render({
                        isDragGhost: true,
                        isDraggedOver: false,
                        isDraggable: false,
                        isDraggedOut: false,
                        isDropAccepted: false,
                        isDndInProgress: true,
                        eventHandlers: {},
                        classNames: [uuiDndState.dragGhost],
                    }));

                this.setState((s) => ({
                    ...s,
                    isDragging: true,
                    isDropAccepted: false /* TBD: fix state when DnD is just started, and drop is accepted by underlying element */,
                }));
            }
        };

        getDropParams(e: React.MouseEvent<HTMLElement>): AcceptDropParams<TSrcData, TDstData> {
            const {
                left, top, width, height,
            } = e.currentTarget.getBoundingClientRect();

            return {
                srcData: this.context.uuiDnD.dragData,
                dstData: this.props.dstData,
                offsetLeft: e.clientX - left,
                offsetTop: e.clientY - top,
                targetWidth: width,
                targetHeight: height,
            };
        }

        static sectorPositionPriorities: Record<string, DropPosition[]> = {
            0: [
                'top', 'right', 'inside',
            ],
            1: [
                'right', 'top', 'inside',
            ],
            2: [
                'right', 'bottom', 'inside',
            ],
            3: [
                'bottom', 'right', 'inside',
            ],
            4: [
                'bottom', 'left', 'inside',
            ],
            5: [
                'left', 'bottom', 'inside',
            ],
            6: [
                'left', 'top', 'inside',
            ],
            7: [
                'top', 'left', 'inside',
            ],
        };

        getPosition(params: AcceptDropParams<TSrcData, TDstData>, options: DropPositionOptions): DropPosition {
            if (options == null) return null;

            // Compute x/y offsets relative to the center, normalized by element dimensions:
            // -------------------------------
            // |(-1, -1)   (0,-1)     (1, -1)|
            // |                             |
            // |(-1,  0)   (0, 0)     (1,  0)|
            // |                             |
            // |(-1,  1)   (0, 1)     (1,  1)|
            // -------------------------------
            const x = (params.offsetLeft / params.targetWidth - 0.5) * 2;
            const y = (params.offsetTop / params.targetHeight - 0.5) * 2;

            if (options.inside) {
                const insideBoxLeft = options.left ? -0.5 : -1;
                const insideBoxRight = options.right ? 0.5 : 1;
                const insideBoxTop = options.top ? -0.5 : -1;
                const insideBoxBottom = options.bottom ? 0.5 : 1;

                if (insideBoxLeft < x && x < insideBoxRight && insideBoxTop < y && y < insideBoxBottom) {
                    return 'inside';
                }
            }

            // Compute the sector#. Basically it's clock-wise angle of mouse pointer normalized to [0,7) range
            //    7 | 0
            // 6    |    1
            // -----|------
            // 5    |    2
            //    4 | 3
            const sector = getSector(x, y);

            // Get possible positions, ordered by priority, from the lookup table
            const optionsByPriority = DndActor.sectorPositionPriorities[sector + ''].filter((o) => options[o]);

            if (optionsByPriority.length > 0) {
                return optionsByPriority[0];
            } else {
                return null;
            }
        }

        private getMultilevelDropParams = (id: TId, e: React.MouseEvent<HTMLElement>): AcceptDropParams<TSrcData, TDstData> => {
            const {
                left, top, width, height,
            } = e.currentTarget.getBoundingClientRect();
            const dndRowData = this.context?.uuiDnD?.getDndRowData(id);
            return {
                srcData: this.context.uuiDnD.dragData,
                dstData: dndRowData?.dstData,
                offsetLeft: e.clientX - left,
                offsetTop: e.clientY - top,
                targetWidth: width,
                targetHeight: height,
            };
        };

        private pointerEnterDropLevel = (id: TId, position: DropPosition, level: number) => (e: React.PointerEvent<any>) => {
            if (this.context.uuiDnD.isDragging) {
                releasePointerCaptureOnEventTarget(e); // allows you to trigger pointer events on other nodes
                const dropProps = this.getMultilevelDropParams(id, e);
                const positionOptions = this.props.canAcceptDrop(dropProps);
                const actualPosition = positionOptions?.[position] ? position : null;
                this.setState((s) => ({
                    ...s,
                    isMouseOver: true,
                    position: actualPosition,
                    draggingOverLevel: level,
                }));
                this.context?.uuiDnD.setDraggingOverInfo(positionOptions?.[position] ? { id, position } : null);
            }
        };

        private onMultilevelDropPointerUp = (id: TId) => (e: React.PointerEvent<any>) => {
            if (this.context.uuiDnD.isDragging) {
                if (isEventTargetInsideDraggable(e, e.currentTarget)) {
                    return;
                }
                e.preventDefault();
                if (!!this.state.position && this.props.onDrop) {
                    this.props.onDrop({
                        ...this.getMultilevelDropParams(id, e),
                        position: this.state.position,
                    });
                }
                this.context.uuiDnD.endDrag();
                this.setState(() => initialState);
            }
        };

        getDropLevelsProps(): DndDropLevelRenderProps<TId>[] {
            const lastLevel = this.props.path.length + 2;
            const lastPosition = 'inside';
            const isDraggedOver = this.context.uuiDnD?.isDragging && this.state.isMouseOver;
            const draggingOverLevel = this.state.draggingOverLevel;
            return [
                ...[...this.props.path, this.props.id].map((id, index) => {
                    const position = 'bottom';
                    const level = index + 1;
                    return {
                        id,
                        level,
                        lastLevel,
                        key: `${id}-${position}`,
                        isDraggedOver,
                        draggingOverLevel,
                        onPointerUp: this.onMultilevelDropPointerUp(id),
                        onPointerEnter: this.pointerEnterDropLevel(id, position, level),
                    };
                }),
                {
                    id: this.props.id,
                    level: lastLevel,
                    lastLevel,
                    key: `${this.props.id}-${lastPosition}`,
                    isDraggedOver,
                    draggingOverLevel,
                    onPointerUp: this.onMultilevelDropPointerUp(this.props.id),
                    onPointerEnter: this.pointerEnterDropLevel(this.props.id, lastPosition, lastLevel),
                },
            ];
        }

        render() {
            const params: DndActorRenderParams = {
                isDraggable: !!this.props.srcData,
                isDraggedOut: this.state.isDragging,
                isDraggedOver: this.context.uuiDnD?.isDragging && this.state.isMouseOver,
                isDropAccepted: this.state.isMouseOver && !!this.state.position,
                isDragGhost: false,
                isDndInProgress: this.state.dndContextState.isDragging,
                dragData: this.state.isMouseOver ? this.context.uuiDnD.dragData : null,
                eventHandlers: {},
                position: this.state.isMouseOver ? this.state.position : null,
                classNames: null,
                ref: this.dndRef,
            };

            params.classNames = [
                params.isDropAccepted && uuiDndState.dropAccepted, params.isDraggedOut && uuiDndState.draggedOut, params.isDraggable && uuiMarkers.draggable,
            ].filter(Boolean);

            if (!!this.props.srcData) {
                params.eventHandlers.onPointerDown = (e: React.PointerEvent<any>) => {
                    if (isEventTargetInsideDraggable(e, e.currentTarget)) {
                        return;
                    }
                    e.persist();
                    if (e.button === 0) {
                        this.setState(() => {
                            const mouseCoords = this.context.uuiDnD.getMouseCoords();
                            return {
                                ...initialState,
                                isMouseDown: true,
                                pointerX: mouseCoords.mousePageX,
                                pointerY: mouseCoords.mousePageY,
                            };
                        });

                        if (!isEventTargetInsideInput(e, e.currentTarget)) {
                            // This prevents text selection start
                            // dnd don't work without it in ff
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }
                };
            }

            if (this.props.canAcceptDrop) {
                const pointerLeaveHandler = () => {
                    if (this.context.uuiDnD.isDragging) {
                        this.setState((s) => ({ ...s, isMouseOver: false, position: null, draggingOverLevel: null }));
                    }
                };

                const pointerMoveHandler = (e: React.PointerEvent<any>) => {
                    if (this.context.uuiDnD.isDragging) {
                        if (isEventTargetInsideDraggable(e, e.currentTarget)) {
                            return pointerLeaveHandler();
                        }

                        releasePointerCaptureOnEventTarget(e); // allows you to trigger pointer events on other nodes

                        const dropParams = this.getDropParams(e);
                        const positionOptions = this.props.canAcceptDrop(dropParams);
                        const position = this.getPosition(dropParams, positionOptions);
                        this.setState((s) => ({ ...s, isMouseOver: true, position }));
                    }
                };

                params.eventHandlers.onTouchStart = (e) => e.preventDefault(); // prevent defaults on ios

                params.eventHandlers.onPointerEnter = !this.props.isMultilevel ? pointerMoveHandler : null;
                params.eventHandlers.onPointerMove = !this.props.isMultilevel ? pointerMoveHandler : null;
                params.eventHandlers.onPointerLeave = pointerLeaveHandler;
            }

            params.eventHandlers.onPointerUp = !this.props.isMultilevel ? (e) => {
                if (this.context.uuiDnD.isDragging) {
                    if (isEventTargetInsideDraggable(e, e.currentTarget)) {
                        return;
                    }
                    e.preventDefault();
                    if (!!this.state.position) {
                        this.props.onDrop && this.props.onDrop({
                            ...this.getDropParams(e),
                            position: this.state.position,
                        });
                    }
                    this.context.uuiDnD.endDrag();
                    this.setState(() => initialState);
                } else {
                    // TBD: investigate. Should blur inputs, but doesn't work so far.
                    // if (this.state.pendingMouseDownTarget) {
                    //     $(this.state.pendingMouseDownTarget).trigger("mousedown");
                    //     $(this.state.pendingMouseDownTarget).trigger("mouseup");
                    //     $(this.state.pendingMouseDownTarget).trigger("click");
                    //     this.setState(s => ({ ...s, pendingMouseDownTarget: null }));
                    // }
                }
            } : null;

            const shouldHighlightRow = (id: TId) => {
                if (this.state.dndContextState.draggingOverInfo == null) {
                    return false;
                }

                const rowData = this.context?.uuiDnD?.getDndRowData(id);
                const draggingOverItemData = this.context?.uuiDnD?.getDndRowData(this.state.dndContextState.draggingOverInfo.id);
                
                const { position } = this.state.dndContextState.draggingOverInfo;
                if (position === 'bottom') {
                    const draggingOverItemParent = draggingOverItemData.path[draggingOverItemData.path.length - 1];
                    const rowParent = rowData.path[rowData.path.length - 1];
                    if (
                        draggingOverItemData.id === rowData.id
                        || draggingOverItemParent === rowParent
                        || draggingOverItemParent === rowData.id) {
                        return true;
                    }
                    return false;
                }
                
                if (position === 'inside') {
                    if (rowData.id === draggingOverItemData.id
                        || rowData.path[rowData.path.length - 1] === draggingOverItemData.id
                    ) {
                        return true;
                    }
                    return false;
                }
                
                return false;
            };

            params.isRowHighlighted = shouldHighlightRow(this.props.id);

            return this.props.render(
                params,
                this.props.isMultilevel && this.state.dndContextState.isDragging
                    ? this.props.renderDropLevels?.({
                        dropLevelsProps: this.getDropLevelsProps(),
                    })
                    : null,
            );
        }
    };
}
