import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import axiosInstance from "../../components/axios/axiosInstance";
import { AppContext } from "../../context/AppContext";
import ArtifyAuthForm from "../../components/AuthForm/AuthForm.jsx";

const fields = [
  { name: "Email", label: "Email", type: "email", placeholder: "Unesi svoj email", required: true },
  { name: "Lozinka", label: "Lozinka", type: "password", placeholder: "Unesi lozinku", required: true },
];

const pickToken = (data) =>
  data?.token ||
  data?.Token ||
  data?.accessToken ||
  data?.AccessToken ||
  data?.jwt ||
  data?.JWT ||
  data?.authToken ||
  data?.AuthToken ||
  data?.data?.token ||
  data?.data?.accessToken;

const extractError = (err) => {
  const data = err?.response?.data;

  if (typeof data === "string") return data;
  if (data?.message && typeof data.message === "string") return data.message;
  if (data?.title && typeof data.title === "string") return data.title;

  // ModelState errors: { field: ["msg"] }
  if (data && typeof data === "object") {
    const k = Object.keys(data)[0];
    const v = data[k];
    if (Array.isArray(v) && v[0]) return v[0];
    if (typeof v === "string") return v;
  }

  return "Neuspešan login. Pokušaj ponovo.";
};

export default function ArtifyLogin() {
  const { login } = useContext(AppContext) || {};
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/home";

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        Email: formData?.Email ?? formData?.email ?? "",
        Lozinka: formData?.Lozinka ?? formData?.lozinka ?? "",
      };

      const res = await axiosInstance.post("Korisnik/PrijavaKorisnika", payload);

      const token = pickToken(res.data);

      if (!token || typeof token !== "string") {
        toast.error("Login uspešan, ali token nije pronađen u response-u.");
        setError("Token nije pronađen. Proveri backend response.");
        return;
      }

      // ✅ ovo zove tvoj AppContext.login(token) koji setuje localStorage + state
      login?.(token);

      toast.success("Uspešna prijava!");
      navigate(from, { replace: true });
    } catch (err) {
      const msg = extractError(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="artify-auth-page">
      <ArtifyAuthForm
        title="Dobrodošao nazad"
        subtitle="Uloguj se i nastavi sa otkrivanjem umetnosti."
        fields={fields}
        submitButtonText={loading ? "Prijavljujem..." : "Uloguj se"}
        onSubmit={handleSubmit}
        error={error}
        loading={loading}
        imageSrc="/images/artify-login.jpg"
      />
    </div>
  );
}
