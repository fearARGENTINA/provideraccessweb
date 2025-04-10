import accessManagement from "../assets/images/access-management.png"
import accessGrant from "../assets/images/access-grant.png"
import accessVerify from "../assets/images/access-verify.png"
import invalidImg from "../assets/images/invalid.png"
import notFoundImg from "../assets/images/notfound.png"
import expiredImg from "../assets/images/expired.png"
import validImg from "../assets/images/valid.png"
import businessTypes from "../assets/images/businesstypes.png"
import viewAllAccess from "../assets/images/viewallaccess.png"

import { VALIDATE_ACCESS, MANAGE_ACCESS, CREATE_ACCESS, MANAGE_BUSINESS_TYPES, VIEW_ALL_ACCESS } from "./routes/paths"

export const ALERT_ERROR="ALERT_ERROR"
export const ALERT_SUCCESS="ALERT_SUCCESS"
export const ALERT_NONE="ALERT_NONE"
export const ALERT_VARIANTS = {
    ALERT_ERROR: "danger",
    ALERT_SUCCESS: "success"
}

export const ACCESS_TOKEN = 'ACCESS_TOKEN';
export const REFRESH_TOKEN = 'REFRESH_TOKEN';
export const URI_LOGIN = `/login`;
export const URI_LOGOUT = `/logout`;
export const URI_ROLES = `/roles`;
export const URI_USER = `/user`
export const URI_REFRESH = `/refresh`
export const URI_PROV_VALID_QR = `/access/qrcode`
export const URI_PROV_VALID_CODE = `/access/isValid/{0}/{1}`
export const URI_PROV_GET_ACCESS = `/access/forTable`
export const URI_PROV_GET_ACCESS_BY_CEDULA = `/access/{0}`
export const URI_PROV_GET_CARD = `/access/{0}/card`
export const URI_PROV_UPDATE_CARD = `/access/{0}`
export const URI_PROV_GET_BUSINESS_TYPES = `/businessTypes`
export const URI_PROV_DELETE_BUSINESS_TYPES = `/businessTypes/{0}`
export const URI_PROV_CREATE_BUSINESS_TYPES = "/businessTypes"
export const URI_PROV_UPDATE_BUSINESS_TYPES = `/businessTypes/{0}`
export const URI_PROV_CREATE_ACCESS = `/access`
// export const URI_API = process.env.REACT_APP_API_URI
// export const URI_PROV_API = process.env.REACT_APP_PROV_API_URI
// export const ROLE_GESTOR = process.env.REACT_APP_ROLE_GESTOR;
// export const ROLE_CONSULTOR = process.env.REACT_APP_ROLE_CONSULTOR;
// export const ROLE_VALIDADOR = process.env.REACT_APP_ROLE_VALIDADOR;
// export const ROLE_ADMIN = process.env.REACT_APP_ROLE_ADMIN
export const URI_API = "https://auth-sec.tata.com.uy"
export const URI_PROV_API = "https://api-accesos.tata.com.uy"
export const ROLE_GESTOR = "Gestor_ProviderAccess"
export const ROLE_CONSULTOR = "Consultor_ProviderAccess"
export const ROLE_VALIDADOR = "Validador_ProviderAccess"
export const ROLE_ADMIN = "Admin_ProviderAccess"
export const ALL_ALLOWED_ROLES = [ROLE_GESTOR, ROLE_CONSULTOR, ROLE_VALIDADOR, ROLE_ADMIN];

export const ALL_APPS = [
    {
        image: accessManagement,
        title: "Consultar/Gestionar accesos",
        text: "Este módulo te permitirá consultar y/o gestionar los accesos ya creados",
        goTo: MANAGE_ACCESS,
        rolesNeeded: [ROLE_CONSULTOR, ROLE_GESTOR, ROLE_ADMIN]
    },
    {
        image: accessGrant,
        title: "Declarar acceso",
        text: "Este módulo te permitirá declarar el acceso de un externo a una sucursal/local de la compañia.",
        goTo: CREATE_ACCESS,
        rolesNeeded: [ROLE_GESTOR, ROLE_ADMIN]
    },
    {
        image: accessVerify,
        title: "Validar accesos",
        text: "Este módulo te permitirá por medio de una imagen QR y un formulario validar que el acceso de un externo sea válido.",
        goTo: VALIDATE_ACCESS,
        rolesNeeded: [ROLE_CONSULTOR, ROLE_VALIDADOR, ROLE_GESTOR, ROLE_ADMIN]
    },
    {
        image: businessTypes,
        title: "Gestionar tipos de servicios",
        text: "Este módulo te permitirá crear, modificar y eliminar los tipos de accesos.",
        goTo: MANAGE_BUSINESS_TYPES,
        rolesNeeded: [ROLE_ADMIN]
    },
    {
        image: viewAllAccess,
        title: "Reporte de accesos creados",
        text: "Este módulo te permitirá ver todos los accesos creados al momento de la consulta.",
        goTo: VIEW_ALL_ACCESS,
        rolesNeeded: [ROLE_ADMIN]
    }
]

export const MAX_QR_IMAGE_SIZE = 51200 // 50 MB

export const MODAL_VERIFY_ACCESS = {
    "QR_INVALID": {
        "subTitle": "QR Inválido",
        "img": invalidImg,
        "message": "El QR ingresado no es válido, porfavor intente nuevamente.",
        "modalHeaderClass": "bg-danger"
    },
    "ACCESS_NOTFOUND": {
        "subTitle": "Acceso inválido / no encontrado",
        "img": notFoundImg,
        "message": "No se pudo encontrar un acceso válido para tal código",
        "modalHeaderClass": "bg-danger"
    },
    "ACCESS_EXPIRED": {
        "subTitle": "Acceso expirado",
        "img": expiredImg,
        "message": "El acceso fue encontrado pero se encuentra expirado. Porfavor solicite un nuevo acceso.",
        "modalHeaderClass": "bg-danger"
    },
    "ACCESS_SUCCESS": {
        "subTitle": "Acceso válido",
        "img": validImg,
        "message": "Acceso exitoso. Proceda.",
        "modalHeaderClass": "bg-success"
    }
}

export const MAX_LENGTH_ACCESS_CODE = 5

export const FORM_CREATE_ACCESS_KEYS_DATA = {
    'cedula': {
        "title": "Cedula",
        "editable": true,
        "field_type": "number",
        "required": true,
    },
    'name': {
        "title": "Nombre",
        "editable": true,
        "field_type": "text",
        "required": true
    },
    'lastName': {
        "title": "Apellido",
        "editable": true,
        "field_type": "text",
        "required": true
    },
    'businessContact': {
        "title": "Contacto (Nombre y apellido)",
        "editable": true,
        "field_type": "text",
        "required": true
    },
    'businessName': {
        "title": "Empresa",
        "editable": true,
        "field_type": "text",
        "required": true
    },
    'businessType': {
        "title": "Tipo de servicio",
        "editable": true,
        "field_type": "select",
        "required": true
    },
    'businessRUT': {
        "title": "N° de RUT",
        "editable": true,
        "field_type": "number",
        "required": true,
        "validateFuncsOnSubmit": [
            {
                "func": (k, access) => typeof access[k] === 'number' && String(access[k]).length <= 12,
                "errorMessage": "El N° de RUT debe ser un número de máximo 12 digitos siempre!" 
            }
        ]
    },
    'businessEmail': {
        "title": "Email",
        "editable": true,
        "field_type": "email",
        "required": true
    },
    'dateStart': {
        "title": "Fecha de inicio",
        "editable": true,
        "field_type": "date",
        "required": true
    },
    'dateEnd': {
        "title": "Fecha expiración",
        "editable": true,
        "field_type": "date",
        "required": false,
        "nullable": true,
        "validateFuncsOnSubmit": [
            {
                "func": (k, access, isDisableableChecked) => isDisableableChecked || Boolean(access[k] && access[k].length > 0),
                "errorMessage": "Chequee 'Indefinido' en caso que no quiera establecer una fecha de expiración para el acceso" 
            },
            {
                "func": (k, access, isDisableableChecked) => {
                    if( Boolean(access[k]) && access[k]?.length > 0 ) {
                        let dateEndVals = access[k].split("/");
                        let dateStartVals = access[k].split("/");
                        return Date(dateEndVals[2], dateEndVals[1], dateEndVals[0]) >= Date(dateStartVals[2], dateStartVals[1], dateStartVals[0]);
                    }
                    return true
                },
                "errorMessage": "El valor de 'Fecha de fin' debe ser mayor o igual a 'Fecha de inicio' siempre"
            }
        ],
        "isDisableable": true 
    },
    'userPhoto': {
        "title": "Foto",
        "editable": true,
        "field_type": "image",
        "required": false,
        "nullable": true
    },
}

export const MODAL_MANAGE_ACCESS_KEYS_DATA = {
    'isActive': {
        "title": "¿Activo?",
        "editable": true,
        "field_type": "checkbox",
        "required": false
    },
    'cedula': {
        "title": "Cedula",
        "editable": false,
        "field_type": "number",
        "required": true
    },
    'name': {
        "title": "Nombre",
        "editable": true,
        "field_type": "text",
        "required": true
    },
    'lastName': {
        "title": "Apellido",
        "editable": true,
        "field_type": "text",
        "required": true
    },
    'businessContact': {
        "title": "Contacto (Nombre y apellido)",
        "editable": true,
        "field_type": "text",
        "required": true
    },
    'businessName': {
        "title": "Empresa",
        "editable": true,
        "field_type": "text",
        "required": true
    },
    'businessType': {
        "title": "Tipo de servicio",
        "editable": true,
        "field_type": "select",
        "required": true
    },
    'businessRUT': {
        "title": "N° de RUT",
        "editable": true,
        "field_type": "number",
        "required": true,
        "validateFuncsOnSubmit": [
            {
                "func": (k, access) => typeof access[k] === 'number' && String(access[k]).length <= 12,
                "errorMessage": "El N° de RUT debe ser un número de máximo 12 digitos siempre!" 
            }
        ]
    },
    'businessEmail': {
        "title": "Email",
        "editable": true,
        "field_type": "email",
        "required": true
    },
    'code': {
        "title": "Código",
        "editable": false,
        "field_type": "text",
        "required": true
    }, 
    'dateStart': {
        "title": "Fecha de inicio",
        "editable": true,
        "field_type": "date",
        "required": true
    }, 
    'dateEnd': {
        "title": "Fecha expiración",
        "editable": true,
        "field_type": "date",
        "required": false,
        "nullable": true,
        "validateFuncsOnSubmit": [
            {
                "func": (k, access, isDisableableChecked) => isDisableableChecked || Boolean(access[k] && access[k].length > 0),
                "errorMessage": "Chequee 'Indefinido' en caso que no quiera establecer una fecha de expiración para el acceso" 
            },
            {
                "func": (k, access, isDisableableChecked) => {
                    if( Boolean(access[k]) && access[k]?.length > 0 ) {
                        const dateEndVals = access[k].split("/");
                        const dateStartVals = access["dateStart"].split("/");
                        return dateEndVals[2]+dateEndVals[1]+dateEndVals[0] >= dateStartVals[2]+dateStartVals[1]+dateStartVals[0];
                    }
                    return true
                },
                "errorMessage": "El valor de 'Fecha de fin' debe ser mayor o igual a 'Fecha de inicio' siempre"
            }
        ],
        "isDisableable": true
    },
    'userPhoto': {
        "title": "Foto",
        "editable": true,
        "field_type": "image",
        "required": false,
        "nullable": true
    },
}