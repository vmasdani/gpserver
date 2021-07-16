import { useContext, useState, useEffect } from "react";
import { AppContext } from "./AppContext";
import { matchExtension } from "./helpers";
import { ListedFileView } from "./model";
import { initialListedFile } from "./modelinitials";

const AdminPage = () => {
  const ctx = useContext(AppContext);

  const [listed, setListed] = useState<ListedFileView[]>([]);
  const [tab, setTab] = useState<
    "fileupload" | "dashboard" | "categories" | "tags"
  >("dashboard");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resp = await fetch(`${ctx?.baseUrl}/listed-check`);

      if (resp.status !== 200) throw await resp.text();
      setListed(await resp.json());
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="m-3">
        <div className="d-flex align-items-center">
          <h1>GPServer Admin</h1>

          <div className="mx-1">
            <button className="btn btn-primary">
              <i className="bi bi-save2"></i> Save
            </button>
          </div>
        </div>

        <hr />

        <div className="d-flex justify-content-around flex-wrap">
          <div>
            <button
              onClick={() => {
                setTab("fileupload");
              }}
              className="btn btn-outline-primary"
            >
              File Upload
            </button>{" "}
          </div>
          <div>
            <button
              onClick={() => {
                setTab("dashboard");
              }}
              className="btn btn-outline-primary"
            >
              Dashboard
            </button>{" "}
          </div>
          <div>
            <button
              onClick={() => {
                setTab("categories");
              }}
              className="btn btn-outline-primary"
            >
              Categories
            </button>{" "}
          </div>
          <div>
            <button
              onClick={() => {
                setTab("tags");
              }}
              className="btn btn-outline-primary"
            >
              Tags
            </button>{" "}
          </div>
        </div>

        <hr />

        {(() => {
          switch (tab) {
            case "fileupload":
              return (
                <div>
                  <h5>File Upload</h5>
                </div>
              );

            case "dashboard":
              return (
                <div>
                  <div
                    style={{ height: "60vh", resize: "vertical" }}
                    className="overflow-auto shadow shadow-lg"
                  >
                    <table className="table table-sm table-bordered table-hover">
                      <thead>
                        <tr className="table-info t-0 sticky-top">
                          <th>#</th>
                          <th>Name</th>
                          <th>Size</th>

                          <th>Type</th>

                          <th>
                            Listed (
                            {listed.filter((file) => file.listedFile).length}/
                            {listed.length})
                          </th>
                          <th>Category</th>
                          <th>Tags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listed.map((file, i) => {
                          return (
                            <tr>
                              <td>{i + 1}</td>
                              <td>{file.path}</td>
                              <td>
                                {((file.size ?? 0) / 1024 / 1024).toFixed(2)} MB
                              </td>

                              <td>{matchExtension(file.path ?? " ")}</td>

                              <td
                                style={{ cursor: "pointer" }}
                                className={`d-flex justify-content-center ${
                                  file.listedFile ? "bg-success" : "bg-danger"
                                }`}
                                onClick={() => {
                                  setListed(
                                    listed.map((fileX, ix) =>
                                      ix === i
                                        ? fileX
                                          ? {
                                              ...fileX,
                                              listedFile: file.listedFile
                                                ? null
                                                : {
                                                    ...initialListedFile,
                                                    name: fileX.path,
                                                  },
                                            }
                                          : fileX
                                        : fileX
                                    )
                                  );
                                }}
                              >
                                <div className="form-check form-switch">
                                  <input
                                    checked={file.listedFile ? true : false}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="flexSwitchCheckDefault"
                                  />
                                </div>{" "}
                                {/* {file.listedFile.n} */}
                              </td>
                              <td></td>
                              <td></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );

            case "categories":
              return (
                <div>
                  <h5>Categories</h5>
                  <div>
                    <div
                      style={{ height: "60vh", resize: "vertical" }}
                      className="overflow-auto shadow shadow-lg"
                    >
                      <table className="table table-sm table-bordered table-hover">
                        <thead>
                          <tr className="table-info t-0 sticky-top">
                            <th>#</th>
                            <th>Name</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                  </div>
                </div>
              );

            case "tags":
              return (
                <div>
                  <h5>Tags</h5>
                  <div>
                    <div
                      style={{ height: "60vh", resize: "vertical" }}
                      className="overflow-auto shadow shadow-lg"
                    >
                      <table className="table table-sm table-bordered table-hover">
                        <thead>
                          <tr className="table-info t-0 sticky-top">
                            <th>#</th>
                            <th>Name</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                  </div>
                </div>
              );
          }
        })()}

        {/* <div>
            <small>
              <pre>{JSON.stringify(listed, null, 2)}</pre>
            </small>
          </div> */}
      </div>
    </div>
  );
};

export default AdminPage;
