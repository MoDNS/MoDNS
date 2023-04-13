import { Button, MenuItem, Select, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

const AddElement = ({ jsonPage, setJsonPage, setShowDialog, element, setElement }) => {

    

    const [text, setText] = useState("");
    const [list, setList] = useState("");
    const [key, setKey] = useState("");
    const [command, setCommand] = useState("");
    const [wide, setWide] = useState(false);
 
    const elementForm = {
        "title": <>
            <Typography
                marginTop={4}
                fontSize={20}
            >
                What should the title say?
            </Typography>
            <TextField
                value={text}
                variant='standard'
                onChange={ (e) => setText(e.target.value) }
            />
            <Button
                variant='contained'
                sx={{ marginTop: 2 }}
                onClick={ () => {
                    if (text === "") {
                        alert("Input must not be empty");
                        return
                    }
                    let newJson = jsonPage;
                    newJson.push(
                        {
                            "type": "title",
                            "display_text": text,
                            "wide": true
                        }
                    );
                    setJsonPage([...newJson]);
                    setShowDialog(false);
                    setText("");
                    setElement(["", false])
                }}
            >
                Submit
            </Button>
        </>,
        "text": <>
            <Typography
                fontSize={20}
            >
                What should the text say?
            </Typography>
            <TextField
                value={text}
                variant='standard'
                multiline
                onChange={ (e) => setText(e.target.value) }
            />
            <Typography
                marginTop={4}
                fontSize={20}
            >
                Is this a wide element?
            </Typography>

            <Select
                value={wide}
                onChange={ (e) => {
                    setWide(e.target.value);
                }
            }
            >
                <MenuItem value={true} > True </MenuItem>
                <MenuItem value={false} > False</MenuItem>
            </Select>
            <Button
                variant='contained'
                sx={{ marginTop: 2 }}
                onClick={ () => {
                    if (text === "") {
                        alert("Input must not be empty");
                        return
                    }
                    let newJson = jsonPage;
                    newJson.push(
                        {
                            "type": "text",
                            "display_text": text,
                            "wide": wide
                        }
                    );
                    setJsonPage([...newJson]);
                    setShowDialog(false);
                    setText("");
                    setWide(false);
                    setElement(["", false])
                }}
            >
                Submit
            </Button>
        </>,
        'button': <>
            <Typography
                fontSize={20}
            >
                What should the Button's label say?
            </Typography>
            <TextField
                value={text}
                variant='standard'
                multiline
                onChange={ (e) => setText(e.target.value) }
            />
            <Typography
                marginTop={4}
                fontSize={20}
            >
                What plugin command should this button execute?
            </Typography>
            <TextField
                value={command}
                variant='standard'
                onChange={ (e) => setCommand(e.target.value) }
            />
            <Typography
                marginTop={4}
                fontSize={20}
            >
                Is this a wide element?
            </Typography>

            <Select
                value={wide}
                onChange={ (e) => {
                    setWide(e.target.value);
                }
            }
            >
                <MenuItem value={true} > True </MenuItem>
                <MenuItem value={false} > False</MenuItem>
            </Select>
            <Button
                variant='contained'
                sx={{ marginTop: 2 }}
                onClick={ () => {
                    if (text === "" || command === "") {
                        alert("Input must not be empty");
                        return
                    }
                    let newJson = jsonPage;
                    newJson.push(
                        {
                            "type": "button",
                            "command": command,
                            "display_text": text,
                            "wide": wide
                        }
                    );
                    setJsonPage([...newJson]);
                    setShowDialog(false);
                    setText("");
                    setCommand("");
                    setWide(false);
                    setElement(["", false])
                }}
            >
                Submit
            </Button>
        </>,
        'switch': <>
            <Typography
                fontSize={20}
            >
                What should the switch's label say?
            </Typography>
            <TextField
                value={text}
                variant='standard'
                multiline
                onChange={ (e) => setText(e.target.value) }
            />
            <Typography
                marginTop={4}
                fontSize={20}
            >
                What should the key for this setting be?
            </Typography>
            <TextField
                value={key}
                variant='standard'
                multiline
                onChange={ (e) => setKey(e.target.value) }
            />
            <Typography
            >
                Note: Do not reuse this value for any other settings.
            </Typography>
            <Typography
                marginTop={4}
                fontSize={20}
            >
                Is this a wide element?
            </Typography>

            <Select
                value={wide}
                onChange={ (e) => {
                    setWide(e.target.value);
                }
            }
            >
                <MenuItem value={true} > True </MenuItem>
                <MenuItem value={false} > False</MenuItem>
            </Select>
            <Button
                variant='contained'
                sx={{ marginTop: 2 }}
                onClick={ () => {
                    if (text === "" || key === "") {
                        alert("Input must not be empty");
                        return
                    }
                    let newJson = jsonPage;
                    newJson.push(
                        {
                            "type": "switch",
                            "key_name": key,
                            "display_text": text,
                            "wide": wide
                        }
                    );
                    setJsonPage([...newJson]);
                    setShowDialog(false);
                    setKey("");
                    setText("");
                    setWide(false);
                    setElement(["", false])
                }}
            >
                Submit
            </Button>
        </>,
        'input': <>
            <Typography
                fontSize={20}
            >
                What should the input's label say?
            </Typography>
            <TextField
                value={text}
                variant='standard'
                multiline
                onChange={ (e) => setText(e.target.value) }
            />
            <Typography
                marginTop={4}
                fontSize={20}
            >
                What should the key for this setting be?
            </Typography>
            <TextField
                value={key}
                variant='standard'
                multiline
                onChange={ (e) => setKey(e.target.value) }
            />
            <Typography
            >
                Note: Do not reuse this value for any other settings.
            </Typography>
            <Typography
                marginTop={4}
                fontSize={20}
            >
                Is this a wide element?
            </Typography>
            <Select
                value={wide}
                onChange={ (e) => {
                    setWide(e.target.value);
                }
            }
            >
                <MenuItem value={true} > True </MenuItem>
                <MenuItem value={false} > False</MenuItem>
            </Select>
            <Button
                variant='contained'
                sx={{ marginTop: 2 }}
                onClick={ () => {
                    if (text === "" || key === "") {
                        alert("Input must not be empty");
                        return
                    }
                    let newJson = jsonPage;
                    newJson.push(
                        {
                            "type": "input",
                            "key_name": key,
                            "display_text": text,
                            "wide": wide
                        }
                    );
                    setJsonPage([...newJson]);
                    setShowDialog(false);
                    setKey("");
                    setText("");
                    setWide(false);
                    setElement(["", false])
                }}
            >
                Submit
            </Button>
        </>,
        'checkbox': <>
            <Typography
                fontSize={20}
            >
                What should the checkbox's label say?
            </Typography>
            <TextField
                value={text}
                variant='standard'
                multiline
                onChange={ (e) => setText(e.target.value) }
            />
            <Typography
                fontSize={20}
                marginTop={4}
                noWrap={false}
            >
                Insert the Checkbox List items in a comma-separated list.
            </Typography>
            <TextField
                value={list}
                variant='standard'
                multiline
                onChange={ (e) => setList(e.target.value) }
            />
            <Typography
                noWrap={false}
            >
                { list.split(",").map((item, index) => {
                    if (index + 1 === list.split(",").length) {
                        return "[" + item.trim() + "]";
                    }
                    return "[" + item.trim() + "], ";
                }) }
            </Typography>
            <Typography
                marginTop={4}
                fontSize={20}
            >
                What should the key for this setting be?
            </Typography>
            <TextField
                value={key}
                variant='standard'
                multiline
                onChange={ (e) => setKey(e.target.value) }
            />
            <Typography
            >
                Note: Do not reuse this value for any other settings.
            </Typography>
            <Typography
                marginTop={4}
                fontSize={20}
            >
                Is this a wide element?
            </Typography>
            <Select
                value={wide}
                onChange={ (e) => {
                    setWide(e.target.value);
                }
            }
            >
                <MenuItem value={true} > True </MenuItem>
                <MenuItem value={false} > False</MenuItem>
            </Select>
            <Button
                variant='contained'
                sx={{ marginTop: 2 }}
                onClick={ () => {
                    if (text === "" || key === "") {
                        alert("Input must not be empty");
                        return
                    }
                    let newJson = jsonPage;
                    let check_list = list.split(",");
                    check_list.forEach((element, index) => {
                        check_list[index] = element.trim();
                    });
                    newJson.push(
                        {
                            "type": "checkbox",
                            "key_name": key,
                            "display_text": text,
                            "list": check_list,
                            "wide": wide
                        }
                    );
                    setJsonPage([...newJson]);
                    setShowDialog(false);
                    setKey("");
                    setText("");
                    setWide(false);
                    setElement(["", false])
                }}
            >
                Submit
            </Button>
        </>,
        'placeholder': <>
            <Typography
                noWrap={false}
                fontSize={20}
                marginTop={4}
            >
                Placeholder is used to kick the next element to the next row when the previous element was not a wide element.
            </Typography>
            <Button
                variant='contained'
                sx={{ marginTop: 2 }}
                onClick={ () => {
                    let newJson = jsonPage;
                    newJson.push(
                        {
                            "type": "placeholder",
                            "wide": false
                        }
                    );
                    setShowDialog(false);
                    setJsonPage([...newJson]);
                    setElement(["", false])
                }}
            >
                Submit
            </Button>
        </>
    }

    return (
        <div style={{ paddingLeft: 25, paddingRight: 25, paddingBottom: 25, display: 'flex', flexDirection: 'column' }} >

            { !element[1] ? 
                <>
                    <Typography
                        fontSize={22}
                    >
                        What type of element woud you like to add ?
                    </Typography>
                    <Select
                        value={element[0]}
                        onChange={(e) => {
                            let el = element;
                            el[0] = e.target.value;
                            setElement([...el]);
                        }}
                    >
                        <MenuItem value={'title'} > Title </MenuItem>
                        <MenuItem value={'text'} > Text </MenuItem>
                        <MenuItem value={'button'} > Button </MenuItem>
                        <MenuItem value={'checkbox'} > Checkboxes </MenuItem>
                        <MenuItem value={'input'} > Input </MenuItem>
                        <MenuItem value={'switch'} > Switch </MenuItem>
                        <MenuItem value={'placeholder'} > Placeholder </MenuItem>

                    </Select>
                    <Button
                        sx={{ marginTop: 2 }}
                        variant='contained'
                        onClick={() => {
                            if (element[0]) {
                                let el = element;
                                el[1] = true;
                                setElement([...el]);
                            }
                        }}
                    >
                        Next
                    </Button>
                </>

                :
                <>
                    <Typography
                        fontSize={22}
                    >
                        {element[0].charAt(0).toUpperCase() }{ element[0].substring(1) }
                    </Typography>

                    { elementForm[element[0]] }
                </>
            }
        </div>
    );
};

export default AddElement;