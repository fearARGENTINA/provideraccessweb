import { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import Spinner from "react-bootstrap/esm/Spinner";
import Form from 'react-bootstrap/Form';
import { useAlertContext } from "../contexts/alertContext";
import useAccessApiService from "../services/AccessApiService";
import ModalManageAccess from "./ModalManageAccess";

function ManageAccess() {
    const [isLoading, setIsLoading] = useState(false);
    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [cedula, setCedula] = useState("");
    const [access, setAccess] = useState({});
    const [businessTypes, setBusinessTypes] = useState([])

    const alert = useAlertContext();
    
    const {getAccessByCedula, getBusinessTypes} = useAccessApiService();

    const handleOnSubmitCode = (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (!cedula.length) {
            alert.error("Debe completar el campo cedula")
            setIsLoading(false);
            return;
        }

        setSubmitButtonDisabled(true);
        getBusinessTypes()
            .then((businessTypes) => {
                setBusinessTypes(
                    businessTypes.map((businessType) => ({ id: businessType["id"], selectValue: businessType["businessType"]})
                ));

                getAccessByCedula(cedula)
                    .then((access) => {
                        setAccess(access);
                        setShowModal(true);
                    })
                    .catch((error) => {
                        if (error === "Access not found") {
                            alert.error("No existe un acceso para la combinacion cedula / código buscada.")
                        } else {
                            alert.error("Opss. Algo inesperado ocurrio...")
                        }
                    })
            })
            .catch(() => alert.error("Opss. Algo inesperado ocurrio..."))
            .finally(() => { 
                setSubmitButtonDisabled(false)
                setIsLoading(false);
            })
            
    }

    const handleCedulaChange = (e) => {
        setCedula(e.target.value);
    }

    return (
        <>
            <h3 className="mb-2">Buscar acceso: </h3>
            <div>
                <Row className="d-flex justify-content-center text-center" style={{width: '100%'}}>
                    <Col sm={12} md={6}>
                        {
                            isLoading ? 
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </Spinner>
                            :
                                <Form onSubmit={handleOnSubmitCode} className="w-100">
                                    <Form.Group className="mb-4 form-group" controlId="formBasicUser">
                                        <Form.Label>Cédula</Form.Label>
                                        <Form.Control type="number" onChange={handleCedulaChange} placeholder="Cédula" value={cedula} required/>
                                    </Form.Group>
                                    <Button variant="primary" type="submit" disabled={submitButtonDisabled} style={{width: "100%"}}>
                                        Buscar
                                    </Button>
                                </Form>
                        }
                    </Col>
                </Row>
            </div>
            <ModalManageAccess access={access} setAccess={setAccess} selectableOptions={{"businessType": businessTypes}} show={showModal} onHide={() => setShowModal(false)}/>
        </>
    )
}

export default ManageAccess;