import { Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import React from 'react';
import { DndContext, useDraggable } from '@dnd-kit/core';

const ModTable = ({ type }) => {



    return (
        <div>
            <TableContainer >
                <Table >
                    <TableBody>
                        <TableRow>
                            <TableCell> test </TableCell>
                            <TableCell> test </TableCell>
                            <TableCell> test </TableCell>
                            <TableCell> test </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell> test </TableCell>
                            <TableCell> test </TableCell>
                            <TableCell> test </TableCell>
                            <TableCell> test </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell> test </TableCell>
                            <TableCell> test </TableCell>
                            <TableCell> test </TableCell>
                            <TableCell> test </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default ModTable;