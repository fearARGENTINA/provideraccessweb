import Modal from 'react-bootstrap/Modal';
import Image from 'react-bootstrap/Image'
import Button from 'react-bootstrap/esm/Button';

function ModalInfo(props) {
    const {title, subTitle, message, img, modalHeaderClass, access, ...rest} = props;

    return (
        <Modal
            {...rest}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header className={modalHeaderClass} closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h4>{subTitle}</h4>
                { img &&
                    <div className="text-center mb-5">
                        <Image fluid src={img} alt="" style={{objectFit: 'scale-down', maxHeight: '100px'}} />
                    </div>
                }
                <p>{message}</p>
                {
                    Object.keys(access).length !== 0 &&
                        <div>
                            <h5>Usuario: </h5>
                            <p>Nombre: { access?.name && access?.name?.charAt(0).toUpperCase() + access?.name?.slice(1).toLowerCase() }</p>
                            <p>Apellido: { access?.lastName && access?.lastName?.charAt(0).toUpperCase() + access?.lastName?.slice(1).toLowerCase() }</p>
                            <p>Cedula: { access?.cedula }</p>
                        </div>
                }
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide} className={modalHeaderClass}>Close</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ModalInfo;