import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import axiosInstance from "../../components/axios/axiosInstance.jsx";
import { AppContext } from "../../context/AppContext";
import ArtifyAuthForm from "../../components/AuthForm/AuthForm.jsx";

const fields = [
  {
    name: "Email",
    label: "Email",
    type: "email",
    placeholder: "Unesi svoj email",
    required: true,
  },
  {
    name: "Lozinka",
    label: "Lozinka",
    type: "password",
    placeholder: "Unesi lozinku",
    required: true,
  },
];

export default function ArtifyLogin() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/home";

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        Email: formData.Email ?? formData.email ?? "",
        Lozinka: formData.Lozinka ?? formData.lozinka ?? "",
      };

      const response = await axiosInstance.post(
        "/Korisnik/PrijavaKorisnika",
        payload
      );

      // ✅ Izvuci token iz response-a (razni backendovi vraćaju razna imena)
      const data = response.data;
      const token =
        data?.token ||
        data?.Token ||
        data?.accessToken ||
        data?.AccessToken ||
        data?.jwt ||
        data?.JWT ||
        data?.authToken ||
        data?.AuthToken ||
        data?.data?.token;

      if (!token) {
        console.warn("Login uspešan, ali token nije pronađen u response.data:", data);
        toast.error("Login uspešan, ali token nije pronađen. Proveri backend response.");
        return;
      }

      // ✅ Ovo je najbitnije za axios interceptor
      localStorage.setItem("authToken", token);

      // (opciono) ako čuvaš i userId/role u localStorage, možeš i to:
      // if (data?.userId) localStorage.setItem("userId", data.userId);

      // ✅ Tvoj context login (nek dalje radi šta već radi)
      login(data);

      navigate(from);
    } catch (err) {
      const data = err?.response?.data;

      const msg =
        data?.message ||
        (typeof data === "string" ? data : null) ||
        "Neuspešan login. Pokušaj ponovo.";

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
