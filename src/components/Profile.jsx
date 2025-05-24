//Will be main hub for the users profile
// Can edit their profile
// Find + add friends????
import { useEffect, useState } from "react";

const authHeader = () => {
    const token = localStorage.getItem("jwt_token");
    return {
        Authirization: `Bearer ${token}`,
    };
};

const Profile = () => {
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({bio: "", interests: ""});
    useEffect(() => {
        fetch("/api/me", {headers: authHeader()})
        .then(res => res.json())
        .then(setUser);
    }, []);

    const updateProfile = async () => {
        try {
            const response = await fetch("/api/profile", 
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeader(),
                },
                body: JSON.stringify
            });

            if (!response.ok) {
                throw new Error(
                    response.status === 400
                    ? (await response.json()).err
                    : `HTTP error. Status: ${response.status}`
                );
            }
            setUser(await response.json());
            setEditing(false);
        } catch (err) {
            console.error("Error updating profile:", err);
        }
    };

    return user ? (
        <div className="max-w-3x1 mx-auto mt-10 p-6 bg-white rounded shadow">
            <div className="flex items-center gap-4">
                <img 
                    src={user.avatarUrl || "/assets/default-avatar.png"}
                    alt="avatar"
                    className="w-24 h-24 rounded-full object-cover"
                />
                <input type="file" onChange={uploadAvatar}/>
            </div>

            {editing ? (
                <>
                    <textarea 
                        className="w-full mt-4 p-2 border"
                        value={form.bio}
                        onChange={e => setForm({...form, bio: e.target.value})}
                    />
                    <input 
                        className="w-full mt-2 p-2 border"
                        placeholder="Interests (comma-seperated)"
                        value={form.interests}
                        onChange={e => setForm({...form, intrests: e.target.value})}
                    />
                    <button className="mt-2 bg-blue-600 text-white px-4 py-2" onClick={updateProfile}>
                        Save
                    </button>
                </>
            ) : (
                <>
                    <p className="mt-4 text-gray-700">{user.bio}</p>
                    <p className="mt-2 text-gray-600"> Interests: {user.interests.join(", ")}</p>
                    <button className="mt-2 text-blue-600" onClick={() => {
                        setForm({bio: user.bio || "", interests: user.interests.join(", ")});
                        setEditing(true);
                    }}>
                        Edit Profile
                    </button>
                </>
            )}
        </div>
    ) : (
        <p>Loading...</p>
    );
}