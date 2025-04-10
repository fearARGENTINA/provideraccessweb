import { useState } from "react";
import { useAuthContext } from "../contexts/authContext";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";

function Login() {
  const {login} = useAuthContext()  
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  
  function handleUserInputChange(e) {
    setUser(e.target.value);
  }

  function handlePasswordInputChange(e) {
    setPassword(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    login(user, password);
  }

  return (
    <>
      <h3 className="mb-5">Utiliza tu cuenta de Windows</h3>
      <div className="d-flex justify-content-center">
        <Row className="d-flex justify-content-center text-center" style={{width: '100%'}}>
          <Col sm={12} md={6}>
            <Form onSubmit={handleSubmit} className="w-100">
              <Form.Group className="mb-3 form-group" controlId="formBasicUser">
                <Form.Label>Usuario</Form.Label>
                <Form.Control type="text" placeholder="Usuario" onChange={handleUserInputChange} required/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control type="password" placeholder="Contraseña" onChange={handlePasswordInputChange} autoComplete="off" required/>
              </Form.Group>
              <Button variant="primary" type="submit">
                Iniciar sesión
              </Button>
            </Form>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Login;