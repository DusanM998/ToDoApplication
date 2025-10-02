import { useTranslation } from "react-i18next";

interface MyTaskPaginationProps {
  pageNumber: number;
  setPageNumber: (page: number) => void;
  totalRecords: number;
  totalPages: number;
  pageSize: number;
}

// Paginacija (iskoristio sam je i za taskove i za korisnike)
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
    const pages: number[] = [];
    const maxVisible = 4;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = pageNumber - Math.floor(maxVisible / 2);
      let end = pageNumber + Math.floor(maxVisible / 2);

      if (start < 1) {
        start = 1;
        end = maxVisible;
      }
      if (end > totalPages) {
        end = totalPages;
        start = totalPages - maxVisible + 1;
      }

      for (let i = start; i <= end; i++) pages.push(i);
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

          {pageNumbers.map((page) => (
            <li
              key={`page-${page}`}
              className={`page-item ${pageNumber === page ? "active" : ""}`}
            >
              <button
                className="page-link"
                style={{
                  backgroundColor: pageNumber === page ? "#51285f" : "#fff",
                  color: pageNumber === page ? "#fff" : "#51285f",
                  borderColor: "#51285f",
                  padding: "8px 16px",
                  fontWeight: pageNumber === page ? 500 : "normal",
                }}
                onClick={() => setPageNumber(page)}
              >
                {page}
              </button>
            </li>
          ))}

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
