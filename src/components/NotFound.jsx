import { Link } from "react-router-dom";

function NotFound () {
    return (
        <div>
            <h1>404 Page Not Found</h1>
            <p>Looks like you've wondered off</p>
            <Link to="/">Go back to home</Link>
        </div>
    );
};

export default NotFound;