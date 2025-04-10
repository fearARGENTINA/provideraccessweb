import { Navigate, Outlet } from "react-router-dom";
import { HOME } from "../../config/routes/paths";
import {useAuthContext} from "../../contexts/authContext";

export default function PrivateRoute({rolesRequired = []}) {
    const {isAuthenticated, hasRole} = useAuthContext();
    if (!isAuthenticated || (rolesRequired.length && !rolesRequired.some((role) => hasRole(role))) ) {
        return <Navigate to={HOME} />;
    }

    return (
        <div>
            <Outlet />
        </div>
    )
}