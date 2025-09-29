import { useTranslation } from "react-i18next";

interface MyTaskPaginationProps {
  pageNumber: number;
  setPageNumber: (page: number) => void;
  totalRecords: number;
  totalPages: number;
  pageSize: number;
}

const MyTaskPagination: React.FC<MyTaskPaginationProps> = ({
  pageNumber,
  setPageNumber,
  totalRecords,
  totalPages,
  pageSize,
}) => {
  const { t } = useTranslation();
  const isFirstPage = pageNumber === 1;
  const isLastPage = pageNumber === totalPages || totalRecords <= pageSize;

  // Dinamicki brojevi stranica
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      // Ako ima manje od 5 stranica prikazuje sve
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Uvek prikazuje prvu
      pages.push(1);

      if (pageNumber > 3) {
        pages.push("...");
      }

      // Prikaz stranica oko trenutne
      for (
        let i = Math.max(2, pageNumber - 1);
        i <= Math.min(totalPages - 1, pageNumber + 1);
        i++
      ) {
        pages.push(i);
      }

      if (pageNumber < totalPages - 2) {
        pages.push("...");
      }

      // Uvek prikazuje poslednju
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="d-flex justify-content-center mt-4">
      <nav>
        <ul className="pagination">
          <li className={`page-item ${isFirstPage ? "disabled" : ""}`}>
            <button
              className="page-link"
              style={{
                backgroundColor: isFirstPage ? "#e9ecef" : "#fff",
                color: isFirstPage ? "#6c757d" : "#51285f",
                borderColor: "#51285f",
                borderRadius: "8px 0 0 8px",
                padding: "8px 16px",
                transition: "all 0.3s",
              }}
              onClick={() => setPageNumber(pageNumber - 1)}
              disabled={isFirstPage}
            >
              {t("myTasksPage.previous")}
            </button>
          </li>

          {pageNumbers.map((page, idx) =>
            page === "..." ? (
              <li key={idx} className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            ) : (
              <li
                key={page}
                className={`page-item ${pageNumber === page ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  style={{
                    backgroundColor: pageNumber === page ? "#51285f" : "#fff",
                    color: pageNumber === page ? "#fff" : "#51285f",
                    borderColor: "#51285f",
                    padding: "8px 16px",
                    fontWeight: pageNumber === page ? "500" : "normal",
                  }}
                  onClick={() => setPageNumber(page as number)}
                >
                  {page}
                </button>
              </li>
            )
          )}

          <li className={`page-item ${isLastPage ? "disabled" : ""}`}>
            <button
              className="page-link"
              style={{
                backgroundColor: isLastPage ? "#e9ecef" : "#fff",
                color: isLastPage ? "#6c757d" : "#51285f",
                borderColor: "#51285f",
                borderRadius: "0 8px 8px 0",
                padding: "8px 16px",
                transition: "all 0.3s",
              }}
              onClick={() => setPageNumber(pageNumber + 1)}
              disabled={isLastPage}
            >
              {t("myTasksPage.next")}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default MyTaskPagination;
