import axios from "axios";
import { URI_API, URI_PROV_API, URI_PROV_CREATE_ACCESS, URI_PROV_CREATE_BUSINESS_TYPES, URI_PROV_DELETE_BUSINESS_TYPES, URI_PROV_GET_ACCESS, URI_PROV_GET_ACCESS_BY_CEDULA, URI_PROV_GET_BUSINESS_TYPES, URI_PROV_GET_CARD, URI_PROV_UPDATE_BUSINESS_TYPES, URI_PROV_UPDATE_CARD, URI_PROV_VALID_CODE, URI_PROV_VALID_QR, URI_REFRESH } from "../config/consts";
import { useAuthContext } from "../contexts/authContext";
import { format } from "react-string-format";
const queryString = require('query-string');

const createAxiosAccessApiInterceptor = (accessToken, refreshToken, updateAccessToken, endSession) => {    
    const axiosAccessApiInstance = axios.create({
        baseURL: URI_PROV_API,
        paramsSerializer: (params) => queryString.stringify(params)
    })
    
    axiosAccessApiInstance.interceptors.request.use(
        config => {
            if (accessToken) {
                config.headers = {
                    "Authorization": `Bearer ${accessToken}`
                }
            }
            return config;
        }

    );

    axiosAccessApiInstance.interceptors.response.use(
        response => {
            return response
        },
        async error => {
            if ( error?.response?.status === 401 ) {
                await axios
                    .post(URI_API + URI_REFRESH, {}, {
                        headers: {
                            Authorization: `Bearer ${refreshToken}`
                        }
                    })
                    .then((response) => {
                        if (response?.data?.status === "success") {
                            if (response?.data?.access_token) {
                                updateAccessToken(response?.data?.access_token)
                            }
                        } else {
                            endSession();
                        }
                    })
                    .catch((error) => {
                        endSession();
                    })
            }
            return Promise.reject(error);
        }
    )

    return axiosAccessApiInstance;
}

function useAccessApiService() {
    const { updateAccessToken, logout, accessToken, refreshToken } = useAuthContext();

    const axiosAccessApiInstance = createAxiosAccessApiInterceptor(accessToken, refreshToken, updateAccessToken, logout);

    const isValidQR = (imgb64) => {
        return axiosAccessApiInstance
            .post(URI_PROV_VALID_QR, { "qrCode": imgb64})
            .then((response) => {
                return response?.data?.access
            })
            .catch((error) => Promise.reject(error?.response?.data?.reason))
    }

    const isValidCode = (cedula, code) => {
        const uri = format(URI_PROV_VALID_CODE, cedula, code)
        return axiosAccessApiInstance
            .get(uri)
            .then((response) => {
                return response?.data?.access
            })
            .catch((error) => Promise.reject(error?.response?.data?.reason))
    }

    const getAccessByCedula = (cedula) => {
        const uri = format(URI_PROV_GET_ACCESS_BY_CEDULA, cedula)
        return axiosAccessApiInstance
            .get(uri)
            .then((response) => {
                return response?.data?.access
            })
            .catch((error) => Promise.reject(error.response?.data?.reason))
    }

    const getAccess = (limit = 10, skip = 0, filters = []) => {
        let body = {}
        if (limit) {
            body["limit"] = limit
        }
        if (skip) {
            body["skip"] = skip
        }
        filters.forEach((filter) => body[filter.id] = filter.value)
        return axiosAccessApiInstance
            .post(URI_PROV_GET_ACCESS, {...body})
            .then((response) => {
                return response?.data
            })
            .catch((error) => Promise.reject(error))
    }

    const getCard = (cedula) => {
        const uri = format(URI_PROV_GET_CARD, cedula)
        return axiosAccessApiInstance
            .get(uri)
            .then((response) => response?.data?.accessCard)
            .catch((error) => Promise.reject(error?.response?.data?.reason))
    }

    const updateAccess = (cedula, body) => {
        const uri = format(URI_PROV_UPDATE_CARD, cedula)
        return axiosAccessApiInstance
            .put(uri, {...body})
            .then((response) => response?.data?.access)
            .catch((error) => Promise.reject(error?.response?.data?.reason))
    }

    const getBusinessTypes = () => {
        return axiosAccessApiInstance
            .get(URI_PROV_GET_BUSINESS_TYPES)
            .then((response) => response?.data?.businessTypes)
            .catch((error) => Promise.reject(error?.response?.data?.reason))
    }

    const createAccess = (body) => {
        return axiosAccessApiInstance
            .post(URI_PROV_CREATE_ACCESS, {...body})
            .then((response) => response?.data?.access)
            .catch((error) => Promise.reject(error?.response?.data?.reason))
    }

    const deleteBusinessType = (id) => {
        const uri = format(URI_PROV_DELETE_BUSINESS_TYPES, id)
        return axiosAccessApiInstance
            .delete(uri)
            .catch((error) => Promise.reject(error?.response?.data?.reason))
    }

    const createBusinessType = (businessType) => {
        return axiosAccessApiInstance
            .post(URI_PROV_CREATE_BUSINESS_TYPES, {businessType})
            .then((response) => response?.data?.businessType)
            .catch((error) => Promise.reject(error?.response?.data?.reason))
    }

    const updateBusinessType = (id, businessType) => {
        const uri = format(URI_PROV_UPDATE_BUSINESS_TYPES, id)
        return axiosAccessApiInstance
            .put(uri, {businessType})
            .then((response) => response?.data?.businessType)
            .catch((error) => Promise.reject(error?.response?.data?.reason))
    }

    return {
        isValidQR,
        isValidCode,
        getAccessByCedula,
        getAccess,
        getCard,
        updateAccess,
        getBusinessTypes,
        createAccess,
        deleteBusinessType,
        createBusinessType,
        updateBusinessType
    }
}

export default useAccessApiService;