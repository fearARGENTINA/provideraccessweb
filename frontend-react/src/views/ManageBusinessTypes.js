import { useEffect, useState } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import useAccessApiService from '../services/AccessApiService';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Form from 'react-bootstrap/Form';
import { useAlertContext } from '../contexts/alertContext';
import Button from 'react-bootstrap/esm/Button';
import ListItemEditable from './ListItemEditable';

function ManageBusinessTypes() {
    const [businessTypes, setBusinessTypes] = useState(null);
    const [newBusinessType, setNewBusinessType] = useState("");
    const { getBusinessTypes, deleteBusinessType, createBusinessType, updateBusinessType } = useAccessApiService();
    const alert = useAlertContext();

    useEffect(() => {
        getBusinessTypes()
            .then((businessTypes) => setBusinessTypes(businessTypes))
            .catch(() => alert.error("Hubo un problema al cargar los tipos de servicios..."))
        
    }, [setBusinessTypes])

    const handleOnClickDeleteBusinessType = (id) => {
        deleteBusinessType(id)
            .then(() => {
                alert.success("Tipo de servicio eliminado correctamente")
                getBusinessTypes()
                    .then((businessTypes) => setBusinessTypes(businessTypes))
                    .catch(() => alert.error("Hubo un problema al cargar los tipos de servicios...")) 
            })
            .catch((error) => {
                if (error === "Business type in use" ) {
                    alert.error("Imposible eliminar porque el tipo de servicio se encuentra declaradado en algunos accesos...")
                } else {
                    alert.error("Hubo un problema al intentar eliminar el tipo de servicio...")
                }
            })
    }

    const handleOnSubmitNewBusinessTypeForm = (e) => {
        e.preventDefault();

        createBusinessType(newBusinessType)
            .then((businessType) => {
                alert.success("Tipo de servicio creado correctamente")
                setBusinessTypes((prev) => [...prev, businessType])
            })
            .catch(() => alert.error("Hubo un problema al intentar crear el tipo de servicio..."))
    }

    const handleNewBusinessTypeChange = (e) => {
        setNewBusinessType(e.target.value);
    }

    const handleOnUpdateBusinessType = (id, businessType) => {
        updateBusinessType(id, businessType)
            .then(() => {
                alert.success("Tipo de servicio actualizado correctamente")
                getBusinessTypes()
                    .then((businessTypes) => setBusinessTypes(businessTypes))
                    .catch(() => alert.error("Hubo un problema al cargar los tipos de servicios...")) 
            })
            .catch(() => {
                alert.error("Hubo un problema al intentar actualizar el tipo de servicio...")
            })
    }

    return (
        <>
            <h3 className="mb-2">Gestionar tipos de servicios:</h3>
            <h5>Doble click para editar</h5>
            <div>
                <Row className="d-flex justify-content-center text-center" style={{width: '100%'}}>
                    <Col sm={12} md={6}>
                        <ListGroup as="ol" numbered>
                        {
                            businessTypes && businessTypes.map((businessType) => (
                                <ListItemEditable
                                    key={businessType.id}
                                    id={businessType.id}
                                    text={businessType.businessType}
                                    handleOnCloseClick={() => handleOnClickDeleteBusinessType(businessType.id)}
                                    handleOnSaveClick={handleOnUpdateBusinessType}
                                />
                            ))
                        }
                        </ListGroup>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-center text-center mt-5" style={{width: '100%'}}>
                    <Col sm={12} md={6}>
                        <h4>Crear nuevo tipo de servicio:</h4>
                        <Form onSubmit={handleOnSubmitNewBusinessTypeForm} className="w-100">
                            <Form.Group className="mb-4 form-group" controlId="formBasicUser">
                                <Form.Label>Tipo de servicio</Form.Label>
                                <Form.Control type="text" onChange={handleNewBusinessTypeChange} placeholder="Tipo de servicio" value={newBusinessType} required/>
                            </Form.Group>
                            <Button variant="primary" type="submit" style={{width: "100%"}}>
                                Crear
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default ManageBusinessTypes;