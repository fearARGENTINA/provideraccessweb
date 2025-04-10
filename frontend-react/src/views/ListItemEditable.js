import { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import CloseButton from "react-bootstrap/esm/CloseButton";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import ListGroup from 'react-bootstrap/ListGroup';

const ListItemEditable = ({id, text, handleOnCloseClick, handleOnSaveClick}) => {
    const [edit, setEdit] = useState(false);
    const [value, setValue] = useState(text);

    const handleOnDoubleClick = (e) => {
        setEdit(true)
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === "Escape") {
            setEdit(false);
        }
    }

    const handleOnChange = (e) => {
        setValue(e.target.value);
    }

    const handleCancelClick = (e) => {
        setEdit(false);
    }

    return (
        <ListGroup.Item
            as="li"
            key={id}
            className="d-flex justify-content-between align-items-start"
            onDoubleClick={handleOnDoubleClick}
        >
            <div className="ms-2 me-auto mr-5">
                { 
                    edit ? 
                        <>
                            <Row>
                                <Col>
                                    <input 
                                        key={id}
                                        type="text"
                                        onKeyDown={handleKeyDown}
                                        value={value}
                                        onChange={handleOnChange}
                                        onBlur={handleCancelClick}
                                        autoFocus />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Button onMouseDown={(e) => {
                                        if ( value !== text ) {
                                            handleOnSaveClick(id, value);
                                        }
                                        handleCancelClick(e);
                                    }}>Guardar</Button>
                                </Col>
                                <Col>
                                    <Button onMouseDown={handleCancelClick}>Cancelar</Button>
                                </Col>
                            </Row>
                        </>
                    : 
                        text
                }
            </div>
            <CloseButton onClick={handleOnCloseClick} />            
        </ListGroup.Item>
    )
}

export default ListItemEditable;