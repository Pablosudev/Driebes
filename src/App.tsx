import { Login } from "./modules/login/Pages/Login";
import { logoutThunk } from "./modules/login/Features/authThunk";
import { useAppDispatch, useAppSelector } from "./store/hooks";

function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);

  if (!token) {
    return <Login />;
  }

  return (
    <main>
      <h1>Dashboard Ayto</h1>
      <p>Sesión iniciada{user ? ` como ${user.name}` : ""}.</p>
      <button type="button" onClick={() => dispatch(logoutThunk())}>
        Cerrar sesión
      </button>
    </main>
  );
}

export default App;
