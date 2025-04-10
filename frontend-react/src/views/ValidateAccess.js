import { useState } from "react";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import Form from 'react-bootstrap/Form';
import { MAX_LENGTH_ACCESS_CODE, MAX_QR_IMAGE_SIZE, MODAL_VERIFY_ACCESS } from "../config/consts";
import { useAlertContext } from "../contexts/alertContext";
import ModalInfo from "./ModalInfo";
import Button from "react-bootstrap/esm/Button";
import useAccessApiService from "../services/AccessApiService";
import Spinner from "react-bootstrap/esm/Spinner";

function ValidateAccess() {
    const [fileData, setFileData] = useState({file: null, base64:""});
    const [isLoading, setIsLoading] = useState(false);
    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalInfo, setModalInfo] = useState({subTitle: "", img: null, message: "", modalHeaderClass:"bg-primary"})
    const [cedula, setCedula] = useState("");
    const [code, setCode] = useState("");
    const [access, setAccess] = useState({});
    
    const alert = useAlertContext();
    
    const {isValidQR, isValidCode} = useAccessApiService();
    
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

    const handleOnSubmitQR = (event) => {
        event.preventDefault();
        if (isProcessing) {
            alert.error("Aun se esta procesando el archivo seleccionado, aguarde unos segundos...")
            return;
        }
        const {file, base64} = fileData;

        
        if (!file || base64.length === 0) {
            alert.error("Porfavor selecciona un archivo...")
        } else if (!base64.match(/^data:image\/.*/)) {
            alert.error("Archivo de imagen no válido. Porfavor seleccione otro archivo...")
        } else if ((file.size / 1024) > MAX_QR_IMAGE_SIZE) {
            alert.error("El tamaño del archivo es superior a 1 MB, porfavor seleccione otro archivo...")
        } else {
            const imgb64Data = base64.split(",")
            
            if (imgb64Data.length !== 2) {
                alert.error("Opss. Algo inesperado ocurrio...")
            } else {
                setSubmitButtonDisabled(true);
                setIsLoading(true);
                isValidQR(imgb64Data[1])
                    .then((r) => {
                        setAccess(r)
                        setModalInfo(MODAL_VERIFY_ACCESS["ACCESS_SUCCESS"])
                        setShowModal(true)
                    })
                    .catch((errorMsg) => {
                        switch(errorMsg) {
                            case "QR Invalid":
                            case "Invalid JWT":
                                setModalInfo(MODAL_VERIFY_ACCESS["QR_INVALID"])
                                setShowModal(true)
                                return;
                            case "Access not found":
                            case "Access not active":
                                setModalInfo(MODAL_VERIFY_ACCESS["ACCESS_NOTFOUND"])
                                setShowModal(true)
                                return;
                            case "Access out of date":
                                setModalInfo(MODAL_VERIFY_ACCESS["ACCESS_EXPIRED"])
                                setShowModal(true)
                                return;
                            default:
                                alert.error("Opss. Algo inesperado sucedio");
                                return;
                        }
                    })
                    .finally(() => {
                        setSubmitButtonDisabled(false)
                        setIsLoading(false);
                    })
            }
        }

    }

    const handleFileChange = async (event) => {
        if (!event?.target?.files.length) {
            setFileData({file:null, base64: ""})    
            return;
        }
        
        setSubmitButtonDisabled(true);
        setIsProcessing(true);
        
        let {file} = fileData;
        
        if (!event.target.files[0].name.match(/\.(jpg|jpeg|png|webp)$/)) {
            alert.error("Archivo de imagen no válido. Porfavor seleccione otro archivo...")
            return;
        }

        file = event.target.files[0]

        getBase64(file)
            .then((result) => {
                setFileData({file, base64: result});
            })
            .catch((error) => {
                alert.error(error)
            })
            .finally(() => {
                setSubmitButtonDisabled(false);
                setIsProcessing(false);
            })
    }

    const handleOnSubmitCode = (e) => {
        e.preventDefault();
        if (!cedula.length) {
            alert.error("Debe completar el campo cédula")
            return;
        }
        
        if (!code.length) {
            alert.error("Debe completar el campo código")
            return;
        }
        
        setSubmitButtonDisabled(true);
        setIsLoading(true);
        isValidCode(cedula, code)
            .then((r) => {
                setAccess(r)
                setModalInfo(MODAL_VERIFY_ACCESS["ACCESS_SUCCESS"])
                setShowModal(true)
            })
            .catch((errorMsg) => {
                switch(errorMsg) {
                    case "Access not found":
                    case "Access not active":
                        setModalInfo(MODAL_VERIFY_ACCESS["ACCESS_NOTFOUND"])
                        setShowModal(true)
                        return;
                    case "Access out of date":
                        setModalInfo(MODAL_VERIFY_ACCESS["ACCESS_EXPIRED"])
                        setShowModal(true)
                        return;
                    default:
                        alert.error("Opss. Algo inesperado sucedio");
                        return;
                }
            })
            .finally(() => {
                setSubmitButtonDisabled(false)
                setIsLoading(false);
            })
    }

    const handleCedulaChange = (e) => {
        setCedula(e.target.value);
    }

    const handleCodigoChange = (e) => {
        setCode(e.target.value);
    }

    return (
        <>
            <h3 className="mb-2">Verificar acceso por: </h3>
            <div>
                <Tabs
                    defaultActiveKey="qr"
                    id="uncontrolled-tab-example"
                    className="mb-5"
                    fill
                >
                    <Tab eventKey="qr" title="Codigo QR">
                        {
                            isLoading ?
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </Spinner>
                            :
                                <Row className="d-flex justify-content-center text-center" style={{width: '100%'}}>
                                    <Col sm={12} md={6}>
                                        <Form onSubmit={handleOnSubmitQR} className="w-100">
                                            <Form.Group className="mb-4 form-group" controlId="formBasicUser">
                                                <Form.Label>Inserta tu codigo QR</Form.Label>
                                                <Form.Control type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleFileChange} required/>
                                            </Form.Group>
                                            <Button variant="primary" type="submit" disabled={submitButtonDisabled} style={{width: "100%"}}>
                                                Verificar
                                            </Button>
                                        </Form>
                                    </Col>
                                </Row>
                        }
                    </Tab>
                    <Tab eventKey="code" title="Codigo de acceso">
                        {
                            isLoading ?
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </Spinner>
                            :
                                <Row className="d-flex justify-content-center text-center" style={{width: '100%'}}>
                                    <Col sm={12} md={6}>
                                        <Form onSubmit={handleOnSubmitCode} className="w-100">
                                            <Form.Group className="mb-4 form-group" controlId="formBasicUser">
                                                <Form.Label>Cédula</Form.Label>
                                                <Form.Control type="number" onChange={handleCedulaChange} placeholder="Cédula" value={cedula} required/>
                                            </Form.Group>
                                            <Form.Group className="mb-4 form-group" controlId="formBasicUser">
                                                <Form.Label>Código</Form.Label>
                                                <Form.Control type="text" onChange={handleCodigoChange} placeholder="Código" value={code} maxLength={MAX_LENGTH_ACCESS_CODE} required/>
                                            </Form.Group>
                                            <Button variant="primary" type="submit" disabled={submitButtonDisabled} style={{width: "100%"}}>
                                                Verificar
                                            </Button>
                                        </Form>
                                    </Col>
                                </Row>
                        }
                    </Tab>
                </Tabs>
            </div>
            <ModalInfo 
                title="Verificacion acceso" {...modalInfo} 
                show={showModal}
                access={access}
                onHide={() => {
                    setAccess({})
                    setShowModal(false)
                }}
            />
        </>
    )   
}

export default ValidateAccess;