import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import Image from "react-bootstrap/esm/Image";
import useAccessApiService from "../services/AccessApiService";
import Table from './Table';
import personImage from "../assets/images/person.png";
import { BooleanSelectColumnFilter, DateRangeColumnFilter, DefaultFilterForColumn, SelectColumnFilter } from "./Filter";
import { CSVLink } from "react-csv";
import { useAlertContext } from "../contexts/alertContext";

function ViewAllAccess() {
    const [pageCount, setPageCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [data, setData] = useState([]);
    const fetchIdRef = useRef(0);
    const [loading, setLoading] = useState(false);
    const [businessTypes, setBusinessTypes] = useState([])
    const { getAccess, getBusinessTypes } = useAccessApiService();
    const alert = useAlertContext();

    useEffect(() => {
        setLoading(true);
        getBusinessTypes()
            .then((businessTypes) => setBusinessTypes(businessTypes))
            .catch(() => alert.error("Hubo un problema al cargar los tipos de servicios..."))
            .finally( () => setLoading(false))

    }, [setBusinessTypes])

    const fetchAPIData = async ({ limit, skip, filters }) => {
        try {
            setLoading(true);
            let data = await getAccess(limit, skip, filters);
            const businessTypesObj = await getBusinessTypes()
            let allAccess = data.access
            allAccess = allAccess.map(
                (access) => (
                    {
                        ...access, 
                        businessType: businessTypesObj.filter(
                            (element) => element.id === access.businessType
                        )[0].businessType
                    }
                )
            )
            setData(allAccess);
            setPageCount(data.paging.pages);
            setTotalCount(data.paging.total);
        } catch (e) {
            setData([]);
            setPageCount(0);
        } finally {
            setLoading(false);
        }
    };
  
    const fetchData = useCallback(
        ({ pageSize, pageIndex, filters }) => {
            const fetchId = ++fetchIdRef.current;
            setLoading(true);
            if (fetchId === fetchIdRef.current) {
                fetchAPIData({
                    limit: pageSize,
                    skip: pageSize * pageIndex,
                    filters: filters
                });
            }
        },
        [businessTypes]
    );
  
    const columns = useMemo(() => [
        { minWidth: 150, Header: "Activo", id: "isActive", accessor: d => d.isActive ? "Si" : "No", show: true, Filter: BooleanSelectColumnFilter, filter: "equals", key:"isActive" },
        { minWidth: 150, Header: "Cedula", accessor: "cedula", show: true, Filter: DefaultFilterForColumn },
        //{ minWidth: 150, Header: "Código", accessor: "code", show: true, Filter: DefaultFilterForColumn },
        { minWidth: 150, Header: "Nombre", accessor: "name", show: true, Filter: DefaultFilterForColumn },
        { minWidth: 150, Header: "Apellido", accessor: "lastName", show: true, Filter: DefaultFilterForColumn },
        { minWidth: 150, Header: "Fecha inicio", accessor: "dateStart", show: true, Filter: DateRangeColumnFilter },
        { minWidth: 150, Header: "Fecha fin", id: "dateEnd", accessor: d => !d.dateEnd ? "Indefinido" : d.dateEnd, show: true, Filter: DateRangeColumnFilter, undefinedCheck: true },
        { minWidth: 150, Header: "Servicio", accessor: "businessType", show: true, Filter: SelectColumnFilter, filter: "equals", optionValues: businessTypes.map(({businessType, id}) => ({option: businessType, value: id })), castValue: Number, key:"businessType" },
        { minWidth: 150, Header: "Empresa", accessor: "businessName", show: true, Filter: DefaultFilterForColumn },
        { minWidth: 150, Header: "RUT", accessor: "businessRUT", show: true, Filter: DefaultFilterForColumn },
        { minWidth: 300, Header: "Email", accessor: "businessEmail", show: true, Filter: DefaultFilterForColumn },
        { minWidth: 150, Header: "Contacto", accessor: "businessContact", show: true, Filter: DefaultFilterForColumn },
        { minWidth: 150, disableFilters: true, Header: "userPhoto", id: "userPhoto", accessor: d => <Image src={!d.userPhoto ? personImage : `data:image/png;base64,${d.userPhoto}`} style={{maxWidth: 50, maxHeight: 50}} alt="avatar" />,show: true, Filter: DefaultFilterForColumn },
    ]);
    
    const csvData = React.useMemo(() => {
        if (data.length > 0) {
            return [Object.keys(data[0]), ...data.map((d) => Object.values(d))];
        }
        return []
    }, [data]);

    return (
        <div className="container mx-auto flex flex-col">
            <div className="flex justify-center mt-8">
                <CSVLink data={csvData}>Exportar CSV</CSVLink>
                <Table
                    pageCount={pageCount}
                    fetchData={fetchData}
                    columns={columns}
                    loading={loading}
                    data={data}
                    totalCount={totalCount}
                />
            </div>
        </div>
    );
}

export default ViewAllAccess;