import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/esm/Button';
import Form from 'react-bootstrap/Form';
import { useRef, useState } from 'react';
import { useAuthContext } from '../contexts/authContext';
import { MODAL_MANAGE_ACCESS_KEYS_DATA, ROLE_ADMIN, ROLE_GESTOR } from '../config/consts';
import useAccessApiService from '../services/AccessApiService';
import { useAlertContext } from '../contexts/alertContext';
import Image from 'react-bootstrap/esm/Image';
import { useReactToPrint } from 'react-to-print';
import FieldAccess from './FieldAccess';
import { triggerBase64Download } from 'react-base64-downloader';
import { Link } from 'react-router-dom';
import Spinner from 'react-bootstrap/esm/Spinner';

function ModalManageAccess(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingViewCard, setIsLoadingViewCard] = useState(false);
    const {access, setAccess, selectableOptions, onHide, ...rest} = props;
    const [cardImage, setCardImage] = useState("");
    const [updateButtonDisabled, setUpdateButtonDisabled] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDisableableChecked, setIsDisableableChecked] = useState(Object.fromEntries(
        Object.keys(MODAL_MANAGE_ACCESS_KEYS_DATA).map((k) => [k, false])
    ))
    const alert = useAlertContext();
    const {hasRole} = useAuthContext();
    const IS_GESTOR = hasRole(ROLE_GESTOR) || hasRole(ROLE_ADMIN);
    const {getCard, updateAccess} = useAccessApiService();

    const cardImageRef = useRef();
    const handleCardImagePrint = useReactToPrint({
        content: () => cardImageRef.current,
    });

    const handleOnSubmitAccessForm = (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (isProcessing) {
            alert.error("Aun hay un proceso pendiente, aguarde unos segundos porfavor...")
            return;
        }

        for (const k of Object.keys(MODAL_MANAGE_ACCESS_KEYS_DATA)) {
            if (MODAL_MANAGE_ACCESS_KEYS_DATA[k]["validateFuncsOnSubmit"]) {
                for (const validateFunc of MODAL_MANAGE_ACCESS_KEYS_DATA[k]["validateFuncsOnSubmit"]) {
                    if ( !("isDisableable" in MODAL_MANAGE_ACCESS_KEYS_DATA[k]) || !MODAL_MANAGE_ACCESS_KEYS_DATA[k]["isDisableable"] ) {
                        if ( !validateFunc["func"](k, access) ) {
                            alert.error(validateFunc["errorMessage"])
                            setIsLoading(false);
                            return;
                        }
                    } else if ( MODAL_MANAGE_ACCESS_KEYS_DATA[k]["isDisableable"] ) {
                        if ( !validateFunc["func"](k, access, isDisableableChecked[k]) ) {
                            alert.error(validateFunc["errorMessage"])
                            setIsLoading(false);
                            return;
                        }
                    }
                }
            }
        }

        updateAccess(access["cedula"], access)
            .then((response) => {
                alert.success("Se ha actualizado el acceso correctamente")
            })
            .catch((error) => {
                alert.error("Hubo un problema al actualizar el acceso, intenta nuevamente...");
            })
            .finally(() => setIsLoading(false))
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
        switch (MODAL_MANAGE_ACCESS_KEYS_DATA[id]["field_type"]) {
            case "image":
                if (!event?.target?.files.length) {
                    return;
                }
                
                if (!event.target.files[0].name.match(/\.(jpg|jpeg|png)$/)) {
                    alert.error("Archivo de imagen no válido. Porfavor seleccione otro archivo...")
                    return;
                }
                
                setIsProcessing(true)
                setUpdateButtonDisabled(true);
        
                getBase64(event.target.files[0])
                    .then((result) => {
                        setAccess(prev => ({...prev, [id]: result.split(',')[1]}))
                    })
                    .catch((error) => {
                        alert.error(error)
                    })
                    .finally(() => {
                            setIsProcessing(false);
                            setUpdateButtonDisabled(false);
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

    const handleViewCard = (e) => {
        setIsLoadingViewCard(true);
        setUpdateButtonDisabled(true);
        setIsProcessing(true);
        getCard(access["cedula"])
            .then((b64CardImage) => {
                setCardImage("data:image/png;base64,"+ b64CardImage)
            })
            .catch(() => alert.error("Opss. Surgio algo inesperado..."))
            .finally(() => {
                setIsLoadingViewCard(false);
                setUpdateButtonDisabled(false);
                setIsProcessing(false);
            })
    }

    return (
        <Modal
            {...rest}
            onHide={() => {
                    onHide();
                    setCardImage("");
                }
            }
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Acceso
                </Modal.Title>
            </Modal.Header>
            {
                isLoading ? (
                    <Modal.Body>
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    </Modal.Body>
                )
                : (
                    <>
                        <Modal.Body>
                            <Form onSubmit={handleOnSubmitAccessForm} className="w-100">
                                <div className="text-center mb-3" >
                                {
                                    !cardImage ?
                                        <Button variant="primary" type="button" onClick={handleViewCard} disabled={isLoadingViewCard} style={{width: "100%"}}>
                                            Ver tarjeta
                                        </Button>
                                    :
                                        <>
                                            <Button variant="primary" type="button" className="mb-3"onClick={handleCardImagePrint} style={{width: "100%"}}>
                                                Imprimir tarjeta
                                            </Button>
                                            <Button variant="primary" type="button" className="mb-3" onClick={() => triggerBase64Download(cardImage, access?.cedula)} style={{width: "100%"}}>
                                                Descargar tarjeta
                                            </Button>
                                            <Button variant="danger" type="button" className="mb-3" onClick={() => setCardImage("")} style={{width: "100%"}}>
                                                Cerrar tarjeta
                                            </Button>
                                            <a href={cardImage} download={access?.cedula}>
                                                <Image src={cardImage} ref={cardImageRef}/>
                                            </a>
                                        </>

                                }
                                </div>
                                {
                                    Object.keys(MODAL_MANAGE_ACCESS_KEYS_DATA).map((keyName, i) => {
                                        const {title, editable, required, field_type, nullable, isDisableable = false, staticProps} = MODAL_MANAGE_ACCESS_KEYS_DATA[keyName]
                                        let inputProps = {
                                            key: keyName,
                                            keyName,
                                            title,
                                            onChange: (event) => handleChange(event, i, keyName),
                                            placeholder:title,
                                            value: !access[keyName] ? "" : access[keyName],
                                            disabled: !IS_GESTOR || !editable,
                                            required,
                                            fieldType: field_type,
                                            isDisableable: isDisableable
                                        }

                                        if (nullable) {
                                            inputProps["nullable"] = true
                                            inputProps["nullFunc"] = () => setAccess(prev => ({...prev, [keyName]: null}))
                                        }
                                        
                                        if (isDisableable) {
                                            inputProps["isDisableableFunc"] = (e) => {
                                                setIsDisableableChecked((prev) => ({ ...prev, [keyName]: e.target.checked }))
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
                                <Button variant="primary" type="submit" disabled={!IS_GESTOR || updateButtonDisabled} style={{width: "100%"}}>
                                    Actualizar
                                </Button>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={() => { 
                                onHide();
                                setCardImage("");                    
                            }}>Cerrar</Button>
                        </Modal.Footer>
                    </>
                )
            }
        </Modal>
    )
}

export default ModalManageAccess;