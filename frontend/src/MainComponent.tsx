import { useContext, useEffect, useState } from "react";
import AdminPage from "./AdminPage";
import { AppContext } from "./AppContext";
import { matchExtension } from "./helpers";
import { ListedFileView } from "./model";
import { initialListedFile } from "./modelinitials";
import UserPage from "./UserPage";

const MainComponent = () => {
  const [page, setPage] = useState<"user" | "admin">("user");

  return (
    <div className="m-3">
      <div className="d-flex justify-content-around">
        <div>
          <button
            onClick={() => {
              setPage("user");
            }}
            className="btn btn-outline-primary"
          >
            Visitor
          </button>{" "}
        </div>
        <div>
          <button
            onClick={() => {
              setPage("admin");
            }}
            className="btn btn-outline-primary"
          >
            Login
          </button>{" "}
        </div>
      </div>
      <hr />
      {(() => {
        switch (page) {
          case "user":
            return <UserPage />;

          case "admin":
            return <AdminPage />;

          default:
            return <></>;
        }
      })()}
    </div>
  );
};

export default MainComponent;
