import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Button, IconButton, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';

const RemoveElement = ({ jsonPage, setJsonPage }) => {
    return (
        <div style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 25 }} >
            { jsonPage.length === 0 ? <Typography> There are no elements added. </Typography> :
                <>
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
                                        >
                                            <TableCell>
                                                <IconButton
                                                    onClick={() => {
                                                        let newJsonPage = jsonPage;
                                                        newJsonPage.splice(index, 1)
                                                        setJsonPage([...newJsonPage]);
                                                    } }
                                                >
                                                    <CloseIcon />
                                                </IconButton>
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
                    <Button
                        variant='contained'
                        sx={{ marginTop: 4 }}
                        fullWidth
                        onClick={() => setJsonPage([]) }
                    >
                        Remove All
                    </Button>
                </>
            }
        </div>
    );
};

export default RemoveElement;