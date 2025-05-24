import {useState} from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = ({setUser, setToken}) => {
    const [isSubmitting, setIsSubmitting] = useState(null);
    const [userLogin, setUserlogin] = useState({
        email: "",
        password: "",
    });
    const [loginError, setLoginError] = useState(null);
    const navigate = useNavigate();

    const fetchToken = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch (
                `INSERT ENDPOINT/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(userLogin),
                }
            );
            if (!response.ok) {
                throw new Error(
                    response.status === 400
                    ? (await response.json()).err
                    : `HTTP error. Status: ${response.status}`
                );
            }
            const data = await response.json();
            try {
                const userResponse = await fetch(`INSERT USER ENDPOINT`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${data.token}`,
                    },
                });

                if (!userResponse.ok){
                    throw new Error(`HTTP error. Status ${response.status}`);
                }
                const userData = await userResponse.json();
                setToken(data.token);
                setUser(userData);
                setUserlogin({email: "", password: ""});
                navigate("/home");
            } catch (err) {
                console.error("Error fetching user: ", err);
            }
        } catch (err) {
            console.error(err);
            setLoginError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2x1 font-bold text-center mb-6">Login:</h2>

                <form onSubmit={fetchToken}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1" htmlFor="email">Email</label>
                        <input 
                            type="email"
                            id="email"
                            value={userLogin.email}
                            onChange={(e) => setUserlogin({...userLogin, email: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-1" htmlFor="password">Password</label>
                        <input 
                            type="password"
                            id="password"
                            value={userLogin.password}
                            onChange={(e) => setUserlogin({...userLogin, password: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {loginError && (
                        <div className="mb-4 text-red-600 text-sm">{loginError}</div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;