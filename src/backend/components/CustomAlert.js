import {Alert} from "antd";
import {UserContext} from "../App";
import {useContext} from "react";

function CustomAlert(){
    const {translate: {t}, alert} = useContext(UserContext);

    return (
        <div>
            {
                alert && alert.type && alert.message ? (
                    <Alert style={{marginBottom: '16px'}} message={t(alert.message)} type={alert.type} showIcon/>) : ''
            }
        </div>
    );
}

export default CustomAlert;