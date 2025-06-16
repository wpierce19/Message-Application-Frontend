//Basic user Signup
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = ({setUser, setToken}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [signupData, setSignupData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [signupError, setSignupError] = useState(null);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setSignupError(null);
        setIsSubmitting(true);

        if (signupData.password !== signupData.confirmPassword){
            setSignupError("Passwords do not match");
            setIsSubmitting(false);
            return;
        }
        try {
            const response = await fetch("https://message-api-yidf.onrender.com/auth/signup", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    username: signupData.username,
                    email: signupData.email,
                    password: signupData.password,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    response.status === 400
                    ? (await response.json()).err
                    : `HTTP error. Status: ${response.status}`
                );
            }
            const data = await response.json();
            const token = data.token;

            //Automatically login after signup 
            const userResponse = await fetch("https://message-api-yidf.onrender.com/auth/me", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!userResponse){
                throw new Error(`HTTP error. Status ${userResponse.status}`);
            }

            const userData = await userResponse.json();
            setToken(data.token);
            setUser(userData);
            setSignupData({email: "", password: "", confirmPassword: ""});
            navigate("/home");
        } catch (err) {
            console.error("Signup error: ", err);
            setSignupError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2x1 font-bold text-center mb-6">Sign Up</h2>

                <form onSubmit={handleSignup}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1" htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={signupData.username}
                            onChange={(e) =>
                            setSignupData({ ...signupData, username: e.target.value })
                            }
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={signupData.email}
                            onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1" htmlFor="password">
                            Password
                        </label>
                        <input 
                            type="password"
                            id="password"
                            value={signupData.password}
                            onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-1" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <input 
                            type="password"
                            id="confirmPassword"
                            value={signupData.confirmPassword}
                            onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {signupError && (
                        <div className="mb-4 text-red-600 text-sm">{signupError}</div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        {isSubmitting ? "Signing up..." : "Sign Up"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;