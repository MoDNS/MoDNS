import { Icon, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const MoveElement = ({ jsonPage, setJsonPage }) => {

    const dragItem = useRef();
    const dragOverItem = useRef();

    const dragStart = (event, position) => {
        event.dataTransfer.effectAllowed = 'move';
        dragItem.current = position;
    };

    const dragEnter = (event, position) => {
        event.preventDefault();
        dragOverItem.current = position;
    };

    const dragDrop = (event) => {
        event.preventDefault();
        let newJsonList = jsonPage;
        let moveElement = newJsonList[dragItem.current];
        newJsonList.splice(dragItem.current, 1);
        newJsonList.splice(dragOverItem.current, 0, moveElement);
        setJsonPage([...newJsonList]);
        // setShowDialog(false);
    };

    const [draggable, startDrag] = useState(false);

    console.log(jsonPage)

    return (
        <div style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 25 }} >
            { jsonPage.length === 0 ? <Typography> There are no elements added. </Typography> :
                <TableContainer
                    sx={{ overflowX: 'hidden', }}
                >
                    <Table>
                        <TableBody
                        >
                            {
                                jsonPage && jsonPage.map((element, index) => (
                                    <TableRow
                                        key={index}
                                        draggable={draggable}
                                        onDragStart={ (e) => dragStart(e, index) }
                                        onDragEnter={ (e) => dragEnter(e, index) }
                                        onDragEnd={ dragDrop }
                                        onDragOver={ (e) => { e.preventDefault() } }
                                    >
                                        <TableCell>
                                            <Icon>
                                                <DragIndicatorIcon
                                                    sx={{ ":hover": { cursor: 'move' } }} 
                                                    onMouseDown={ () => startDrag(true) }
                                                    onMouseUp={ () => startDrag(false) }
                                                />
                                            </Icon>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                fontSize={20}
                                            >
                                                { element.type.charAt(0).toUpperCase() }{element.type.substring(1) }{ element.display_text ? `: ${element.display_text.substring(0, 20)}` : ""}{  element.display_text ? element.display_text.length > 20 ? "..." : "" : ""}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            }
        </div>
    );
};

export default MoveElement;