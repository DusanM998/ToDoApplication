import { Route, Routes } from "react-router-dom";
import { HomePage, MainLoader } from "../Components/Layout/Common";
import { Header } from "../Components/Layout";
import { useDispatch } from "react-redux";
import type { userModel } from "../Interfaces";
import { useEffect, useState } from "react";
import { setLoggedInUser } from "../Storage/Redux/userAuthSlice";
import { jwtDecode } from "jwt-decode";
import { ForgotPassword, Login, Register, ResetPassword } from "../Pages/Auth";
import { UserDetailsUpdate, UserPage } from "../Pages/UserPage";
import { CreateTask, EditTask, MyTasks } from "../Pages/Task";
import { ViewAllTasks, ViewAllUsers } from "../Pages/Admin";

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localToken = localStorage.getItem("token");

    if (localToken) {
      const { name, id, email, role, phoneNumber }: userModel =
        jwtDecode(localToken);
      dispatch(setLoggedInUser({ name, id, email, role, phoneNumber }));
    }
    setLoading(false);
  }, [dispatch]);

  if (loading) {
    return <MainLoader />;
  }

  return (
    <div>
      <Header />
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/userPage/:id" element={<UserPage />} />
          <Route
            path="/userDetails/userDetailsUpdate/:id"
            element={<UserDetailsUpdate />}
          />
          <Route path="/tasks/create" element={<CreateTask />} />
          <Route path="/tasks/myTasks" element={<MyTasks />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />}></Route>
          <Route path="/tasks/editTask/:id" element={<EditTask />}></Route>
          <Route path="/admin/viewAllTasks" element={<ViewAllTasks />}></Route>
          <Route path="/admin/viewAllUsers" element={<ViewAllUsers />} ></Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
