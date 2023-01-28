import { Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import React from 'react';


const PluginTable = ({ type }) => {

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

export default PluginTable;