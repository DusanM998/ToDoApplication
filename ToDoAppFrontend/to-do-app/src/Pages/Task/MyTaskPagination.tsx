import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
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

  const buttonStyle = (isActive: boolean, isDisabled: boolean) => ({
    backgroundColor: isActive ? "#51285f" : isDisabled ? "#e9ecef" : "#fff",
    color: isActive ? "#fff" : isDisabled ? "#6c757d" : "#51285f",
    borderColor: "#51285f",
    padding: "8px 16px",
    transition: "all 0.3s",
    fontWeight: isActive ? 500 : "normal",
  });

  return (
    <div className="d-flex justify-content-center mt-4">
      <nav>
        <ul className="pagination">
          <li className={`page-item ${isFirstPage ? "disabled" : ""}`}>
            <button
              className="page-link"
              style={{
                ...buttonStyle(false, isFirstPage),
                borderRadius: "8px 0 0 8px",
              }}
              onClick={() => setPageNumber(1)}
              disabled={isFirstPage}
              title={t("myTasksPage.firstPage") || "First Page"}
            >
              <ChevronsLeft size={18} />
            </button>
          </li>

          <li className={`page-item ${isFirstPage ? "disabled" : ""}`}>
            <button
              className="page-link"
              style={buttonStyle(false, isFirstPage)}
              onClick={() => setPageNumber(pageNumber - 1)}
              disabled={isFirstPage}
            >
              <ChevronLeft size={18} className="me-1" />
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
                style={buttonStyle(pageNumber === page, false)}
                onClick={() => setPageNumber(page)}
              >
                {page}
              </button>
            </li>
          ))}

          <li className={`page-item ${isLastPage ? "disabled" : ""}`}>
            <button
              className="page-link"
              style={buttonStyle(false, isLastPage)}
              onClick={() => setPageNumber(pageNumber + 1)}
              disabled={isLastPage}
            >
              {t("myTasksPage.next")}
              <ChevronRight size={18} className="ms-1" />
            </button>
          </li>

          <li className={`page-item ${isLastPage ? "disabled" : ""}`}>
            <button
              className="page-link"
              style={{
                ...buttonStyle(false, isLastPage),
                borderRadius: "0 8px 8px 0",
              }}
              onClick={() => setPageNumber(totalPages)}
              disabled={isLastPage}
              title={t("myTasksPage.lastPage") || "Last Page"}
            >
              <ChevronsRight size={18} />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default MyTaskPagination;
