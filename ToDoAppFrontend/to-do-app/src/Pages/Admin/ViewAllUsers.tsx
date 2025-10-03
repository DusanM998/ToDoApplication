import React, { useState } from "react";
import { useGetAllUsersQuery } from "../../apis/authApi";
import type { userModel } from "../../Interfaces";
import "./viewAllUsers.css";
import { useTranslation } from "react-i18next";
import { UserCard } from "../UserPage";
import { MyTaskPagination } from "../Task";

// Komponenta gde se prikazuju svi korisnici (samo admin moze da joj pristupi)
const ViewAllUsers: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useGetAllUsersQuery(undefined);

  // State za paginaciju
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 6; // koliko korisnika po stranici

  if (isLoading)
    return <p className="text-center text-muted">{t("myTasksPage.loading")}</p>;
  if (isError)
    return <p className="text-center text-danger">{t("myTasksPage.error")}</p>;

  const totalRecords = data?.result.length || 0;
  const totalPages = Math.ceil(totalRecords / pageSize);

  const paginatedUsers = data?.result.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize
  );

  return (
    <div className="container py-4" style={{ marginTop: "50px" }}>
      <h2 className="display-6 fw-bold mb-4 text-primary-custom">
        {t("header.viewUsers")}
      </h2>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
        {paginatedUsers?.map((user: userModel & { role?: string; tasks?: any[] }) => (
          <div key={user.id} className="col">
            <UserCard user={user} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <MyTaskPagination
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          totalRecords={totalRecords}
          totalPages={totalPages}
          pageSize={pageSize}
        />
      )}
    </div>
  );
};

export default ViewAllUsers;
