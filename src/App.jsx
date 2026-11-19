import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import EleveHome from "./pages/EleveHome";
import CoursEditor from "./pages/CoursEditor";
import ElevePreview from "./pages/ElevePreview";

// Email admin — à changer avec le tien
const ADMIN_EMAIL = "anthony.armand07@gmail.com";

export default function App() {
  const [user, setUser] = useState(null);
  const [eleveData, setEleveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminView, setAdminView] = useState("dashboard"); // dashboard | editor | preview
  const [coursAEditer, setCoursAEditer] = useState(null);
  const [previewNiveau, setPreviewNiveau] = useState("2nde");

  useEffect(() => {
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUserLogin(session.user);
      } else {
        setLoading(false);
      }
    });

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleUserLogin(session.user);
      } else {
        setUser(null);
        setEleveData(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserLogin = async (u) => {
    setUser(u);
    // Charger les données élève si pas admin
    if (u.email !== ADMIN_EMAIL) {
      const { data } = await supabase
        .from("eleves")
        .select("*")
        .eq("email", u.email)
        .single();
      setEleveData(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEleveData(null);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#f8faff", fontFamily: "Arial, sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#1a56db", marginBottom: 8 }}>COURS</div>
          <div style={{ fontSize: 13, color: "#aab5cc" }}>Chargement...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleUserLogin} />;
  }

  // Vue admin
  if (user.email === ADMIN_EMAIL) {
    if (adminView === "editor") {
      return (
        <CoursEditor
          user={user}
          coursExistant={coursAEditer} /* On passe les données du cours à l'éditeur */
          onBack={() => {
            setAdminView("dashboard");
            setCoursAEditer(null); /* On vide la mémoire en quittant l'éditeur */
          }}
        />
      );
    }
    if (adminView === "preview") {
      return (
        <ElevePreview
          user={user}
          niveauInitial={previewNiveau}
          onBack={() => setAdminView("dashboard")}
        />
      );
    }
    return (
      <Admin
        user={user}
        onLogout={handleLogout}
        onOpenEditor={(cours) => {
          setCoursAEditer(cours || null); /* On mémorise le cours (ou null si nouveau) */
          setAdminView("editor");
        }}
        onOpenPreview={(niveau) => {
          setPreviewNiveau(niveau || "2nde");
          setAdminView("preview");
        }}
      />
    );
  }

  // Vue élève
  return (
    <EleveHome
      user={user}
      eleveData={eleveData}
      onLogout={handleLogout}
    />
  );
}
