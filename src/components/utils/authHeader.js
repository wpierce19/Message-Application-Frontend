export const authHeader = () => {
    const token = localStorage.getItem("jwt_token");

    if (!token) {
        throw new Error("JWT token missing. User is not authenticated");
    }
    return {Authorization: `Bearer ${token}`,};
};