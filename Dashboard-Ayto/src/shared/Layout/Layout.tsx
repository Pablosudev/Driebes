import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import MenuSide from "./MenuSide";
import Navbar from "./Navbar";

export default function Layout() {
  // const token = useAppSelector((state) => state.auth.token);


  // if (!token) {
  //   return <Navigate to="/login" replace />;
  // }

  return (
    <div className="grid min-h-screen grid-cols-1 grid-rows-[auto_auto_1fr] md:grid-cols-[14rem_1fr] md:grid-rows-[auto_1fr]">
      <div className="row-span-1 md:col-start-1 md:row-span-2">
        <MenuSide />
      </div>
      <div className="md:col-start-2">
        <Navbar />
      </div>
      <main className="min-w-0 px-8 py-7 md:col-start-2">
        <Outlet />
      </main>
    </div>
  );
}
