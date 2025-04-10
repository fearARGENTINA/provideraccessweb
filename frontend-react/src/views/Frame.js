import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "../componentes/router/PrivateRoute";
import PublicRoute from "../componentes/router/PublicRoute";
import { APPS, CREATE_ACCESS, HOME, LOGIN, MANAGE_ACCESS, MANAGE_BUSINESS_TYPES, VALIDATE_ACCESS, VIEW_ALL_ACCESS } from "../config/routes/paths";
import { useAuthContext } from "../contexts/authContext";
import Header from "./Header";
import Login from "./Login";
import NotFound from "./NotFound";
import Apps from "./Apps";
import '../assets/css/style.css';
import Spinner from 'react-bootstrap/Spinner';
import Body from "./Body";
import Alerts from "./Alerts";
import ValidateAccess from "./ValidateAccess";
import ManageAccess from "./ManageAccess";
import DeclareAccess from "./DeclareAccess";
import { ROLE_ADMIN, ROLE_CONSULTOR, ROLE_GESTOR, ROLE_VALIDADOR } from "../config/consts";
import Footer from "./Footer";
import ManageBusinessTypes from "./ManageBusinessTypes";
import ViewAllAccess from "./ViewAllAccess";

function Frame() {
    const {isLoading} = useAuthContext();

    return (
        <div className="App">
            {
                isLoading ?
                    <Body>
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    </Body>
                :
                    <BrowserRouter>
                        <Alerts />
                        <Header></Header>
                        <Body>
                            <Routes>
                                <Route path={HOME} element={<PublicRoute />}>
                                    <Route path={HOME} element={<Login />}></Route>
                                    <Route path={LOGIN} element={<Login />}></Route>
                                </Route>
                                <Route path={HOME} element={<PrivateRoute />}>
                                    <Route path={HOME} element={<Apps />}></Route>
                                    <Route path={APPS} element={<Apps />}></Route>
                                </Route>
                                <Route path={HOME} element={<PrivateRoute rolesRequired={[ROLE_VALIDADOR, ROLE_CONSULTOR, ROLE_GESTOR, ROLE_ADMIN]} />}>
                                    <Route path={VALIDATE_ACCESS} element={<ValidateAccess />}></Route>
                                </Route>
                                <Route path={HOME} element={<PrivateRoute rolesRequired={[ROLE_CONSULTOR, ROLE_GESTOR, ROLE_ADMIN]} />}>
                                    <Route path={MANAGE_ACCESS} element={<ManageAccess />}></Route>
                                </Route>
                                <Route path={HOME} element={<PrivateRoute rolesRequired={[ROLE_GESTOR, ROLE_ADMIN]} />}>
                                    <Route path={CREATE_ACCESS} element={<DeclareAccess />}></Route>
                                </Route>
                                <Route path={HOME} element={<PrivateRoute rolesRequired={[ROLE_ADMIN]} />}>
                                    <Route path={MANAGE_BUSINESS_TYPES} element={<ManageBusinessTypes />}></Route>
                                </Route>
                                <Route path={HOME} element={<PrivateRoute rolesRequired={[ROLE_ADMIN]} />}>
                                    <Route path={VIEW_ALL_ACCESS} element={<ViewAllAccess />}></Route>
                                </Route>
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Body>
                        <Footer />
                    </BrowserRouter>
            }
        </div>
    );
}

export default Frame;