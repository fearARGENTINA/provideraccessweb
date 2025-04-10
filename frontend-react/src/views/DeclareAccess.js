import { useEffect, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import Spinner from "react-bootstrap/esm/Spinner";
import Form from 'react-bootstrap/Form';
import { FORM_CREATE_ACCESS_KEYS_DATA } from "../config/consts";
import { useAlertContext } from "../contexts/alertContext";
import useAccessApiService from "../services/AccessApiService";
import FieldAccess from "./FieldAccess";
import ModalManageAccess from "./ModalManageAccess";

function DeclareAccess() {
    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [access, setAccess] = useState({});
    const [selectableOptions, setSelectableOptions] = useState({});
    const [isDisableableChecked, setIsDisableableChecked] = useState(Object.fromEntries(
        Object.keys(FORM_CREATE_ACCESS_KEYS_DATA).map((k) => [k, false])
    ))
    const alert = useAlertContext();
    
    const {createAccess, getBusinessTypes} = useAccessApiService();

    function clearAccess() {
        for (const key of Object.keys(FORM_CREATE_ACCESS_KEYS_DATA)) {
            setAccess((prev) => ({
                ...prev,
                [key]: FORM_CREATE_ACCESS_KEYS_DATA[key]["defaultValue"]
            }))
            if (key in selectableOptions && selectableOptions[key].length > 0) {
                setAccess((prev) => ({
                    ...prev,
                    [key]: selectableOptions[key][0]["id"]
                }))
            }
        }
    }

    useEffect(() => {
        function getData () {
            getBusinessTypes()
                .then((data) => {
                    setSelectableOptions((prev) => ({
                        "businessType": data.map((businessType) => ({ id: businessType["id"], selectValue: businessType["businessType"] }))
                    }))
                    setAccess((prev) => ({...prev, "businessType": data[0]?.id}))
                })
                .catch(() => alert.error("Hubo un problema inesperado..."))
        }
        getData();
        clearAccess();
    }, [])

    const handleOnSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (isProcessing) {
            alert.error("Aun hay un proceso pendiente, aguarde unos segundos porfavor...")
            setIsLoading(false);
            return;
        }

        for (const k of Object.keys(FORM_CREATE_ACCESS_KEYS_DATA)) {
            if (FORM_CREATE_ACCESS_KEYS_DATA[k]["validateFuncsOnSubmit"]) {
                for (const validateFunc of FORM_CREATE_ACCESS_KEYS_DATA[k]["validateFuncsOnSubmit"]) {
                    if ( !FORM_CREATE_ACCESS_KEYS_DATA[k]["isDisableable"] ) {
                        if ( !validateFunc["func"](k, access) ) {
                            alert.error(validateFunc["errorMessage"])
                            setIsLoading(false);
                            return;
                        }
                    } else {
                        if ( !validateFunc["func"](k, access, isDisableableChecked[k]) ) {
                            alert.error(validateFunc["errorMessage"])
                            setIsLoading(false);
                            return;
                        }
                    }
                }
            }
        }

        createAccess(access)
            .then((newAccess) => {
                alert.success("Se ha creado el acceso correctamente")
                setAccess(newAccess)
                setShowModal(true);
            })
            .catch((error) => {
                if (error === "Ya existe un acceso para esa cedula") {
                    alert.error("Ya existe un acceso para esa cédula, de ser necesario modifique la existente!");
                } else {
                    alert.error("Hubo un problema al crear el acceso, intenta nuevamente...");
                }
            })
            .finally(() => setIsLoading(false));
    }

    const getBase64 = (file) => {
        return new Promise(resolve => {
            let baseURL = "";
            let reader = new FileReader();
    
            reader.readAsDataURL(file);
    
            reader.onload = () => {
                baseURL = reader.result;
                resolve(baseURL);
            };
        });
    }

    const handleChange = (event, index, id) => {
        switch (FORM_CREATE_ACCESS_KEYS_DATA[id]["field_type"]) {
            case "image":
                if (!event?.target?.files.length) {
                    return;
                }
                
                if (!event.target.files[0].name.match(/\.(jpg|jpeg|png)$/)) {
                    alert.error("Archivo de imagen no válido. Porfavor seleccione otro archivo...")
                    return;
                }
                
                setIsProcessing(true)
                setSubmitButtonDisabled(true);
        
                getBase64(event.target.files[0])
                    .then((result) => {
                        setAccess(prev => ({...prev, [id]: result.split(',')[1]}))
                    })
                    .catch((error) => {
                        alert.error(error)
                    })
                    .finally(() => {
                            setIsProcessing(false);
                            setSubmitButtonDisabled(false);
                        })
                
                return;
            case "checkbox":
                setAccess(prev => ({...prev, [id]: !prev[id]}))
                return;
            case "date":
                if (!event.target.value) {
                    return;
                }
                const [year, month, day] = event.target.value.split("-")
                setAccess(prev => ({...prev, [id]: `${day}/${month}/${year}`}));
                return;
            case "number":
            case "select":
                setAccess(prev => ({...prev, [id]: Number(event.target.value)}))
                return;
            default:
                setAccess(prev => ({...prev, [id]: event.target.value}))
                return;
        }
    }

    return (
        <>
            <h3 className="mb-2">Declarar acceso: </h3>
            <div>
                <Row className="d-flex justify-content-center text-center" style={{width: '100%'}}>
                    <Col sm={12} md={6}>
                        {
                            isLoading ?
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </Spinner> 
                            :
                                <Form onSubmit={handleOnSubmit} className="w-100">
                                    {   
                                        selectableOptions && 
                                        Object.keys(FORM_CREATE_ACCESS_KEYS_DATA).map((keyName, i) => {
                                            const {title, editable, required, field_type, nullable, isDisableable = false, staticProps} = FORM_CREATE_ACCESS_KEYS_DATA[keyName]
                                            let inputProps = {
                                                key: keyName,
                                                keyName,
                                                title,
                                                onChange: (event) => handleChange(event, i, keyName),
                                                placeholder:title,
                                                disabled: !editable,
                                                required,
                                                fieldType: field_type,
                                                isDisableable: isDisableable
                                            }

                                            inputProps["value"] = ""
                                            if (access && access[keyName]) {
                                                inputProps["value"] = access[keyName]
                                            }
                                            
                                            
                                            if (nullable) {
                                                inputProps["nullable"] = true
                                                inputProps["nullFunc"] = () => setAccess(prev => ({...prev, [keyName]: null}))
                                            }
                                            
                                            if (isDisableable) {
                                                inputProps["isDisableableFunc"] = (e) => {
                                                    setIsDisableableChecked((prev) => ({ ...prev, [keyName]: e.target.checked}))
                                                    if (e.target.checked) {
                                                        setAccess(prev => ({...prev, [keyName]: null}))
                                                    }
                                                }
                                            }

                                            if (staticProps) {
                                                inputProps = {...inputProps, ...staticProps}
                                            }
                                            
                                            if (field_type === "select") {
                                                inputProps["selectableOptions"] = selectableOptions[keyName]
                                            }

                                            return <FieldAccess {...inputProps} />
                                        })
                                    }
                                    <Button className="mb-4" variant="primary" type="submit" disabled={submitButtonDisabled} style={{width: "100%"}}>
                                        Declarar
                                    </Button>
                                    <Button variant="danger" type="button" onClick={() => clearAccess()} disabled={submitButtonDisabled} style={{width: "100%"}}>
                                        Limpiar
                                    </Button>
                                </Form>
                        }
                    </Col>
                </Row>
            </div>
            <ModalManageAccess access={access} setAccess={setAccess} selectableOptions={selectableOptions} show={showModal} onHide={() => setShowModal(false)}/>
        </>
    )
}

export default DeclareAccess;