import personImage from "../assets/images/person.png";
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/esm/Image';
import Button from "react-bootstrap/esm/Button";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import { useState } from "react";

function FieldAccess(props) {
    const {title, fieldType, placeHolder, value, disabled, required, onChange, keyName, nullable, nullFunc, selectableOptions, isDisableable = false, isDisableableFunc} = props
    let switchFieldType = null
    const [ isDisableableChecked, setIsDisableableChecked ] = useState(false)

    if (fieldType === "image") {
        switchFieldType = (
            <>
                <Row className="mb-3">
                    <Col className="d-flex justify-content-center">
                        <Image src={!value ? personImage : `data:image/png;base64,${value}`} style={{maxWidth: 112, maxHeight: 119}} alt="avatar" />
                    </Col>
                </Row>
                <Row>
                    <Col className="d-flex justify-content-center">
                        <Form.Control type="file" accept=".png,.jpg,.jpeg,.webp" onChange={onChange} disabled={disabled || isDisableableChecked} required={required}/>
                    </Col>
                </Row>
            </>
        ) 
    } else if (fieldType === "checkbox") {
        switchFieldType = (
            <Form.Check type="switch" id={keyName} onChange={onChange} disabled={disabled || isDisableableChecked} required={required} checked={value} />
        )
    } else if (fieldType === "date") {

        let strDate = ""
        if (value) {
            const [day, month, year] = value.split("/")
            const date = new Date(+year, +month -1, +day)
            strDate = `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + (date.getDate())).slice(-2)}`
        }

        switchFieldType = (
            <Form.Control type="date" max={"9999-12-30"} onChange={onChange} value={strDate} disabled={disabled || isDisableableChecked} required={required} />
        )
    } else if (fieldType === "select") {
        switchFieldType = (
            <>
                <Form.Select onChange={onChange} aria-label={`Seleccione ${title}`} value={value} disabled={disabled || isDisableableChecked} required={required}>
                    {
                        selectableOptions && selectableOptions.map(({id, selectValue}, i) => (
                            <option key={`option-${keyName}-${id}`} value={id}>{selectValue}</option>
                            ))
                    }
                </Form.Select>
            </>
        )
    } else {
        switchFieldType = (
            <Form.Control type={fieldType} onChange={onChange} placeholder={placeHolder} value={value} disabled={disabled || isDisableableChecked} required={required}/>
            )
        }
        
        if (nullable) {
            switchFieldType = (
                <>
                { switchFieldType }
                <Button onClick={nullFunc} disabled={disabled || isDisableableChecked}>Limpiar</Button>
            </>
        )
    }

    if (isDisableable) {
        switchFieldType = (
            <>
                { switchFieldType }
                <Form.Check type="checkbox" label="Indefinido" disabled={disabled} checked={isDisableableChecked} onChange={(e) => {
                    setIsDisableableChecked((prev) => !prev);
                    isDisableableFunc(e);
                }}/>
            </>
        )
    }
    return (
        <Form.Group className="mb-4 form-group" controlId={keyName}>
            <Form.Label>{title}</Form.Label>
            { switchFieldType }
        </Form.Group>
    )
}

export default FieldAccess;