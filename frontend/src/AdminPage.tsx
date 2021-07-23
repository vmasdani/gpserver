import { findByLabelText } from "@testing-library/react";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "./AppContext";
import {
  fetchCategories,
  fetchListedCheck,
  fetchTags,
  matchExtension,
  RequestStatus,
} from "./helpers";
import { Category, ListedFileView, Tag } from "./model";
import { initialCategory, initialListedFile } from "./modelinitials";

const AdminPage = () => {
  const ctx = useContext(AppContext);

  const [listed, setListed] = useState<ListedFileView[]>([]);
  const [tab, setTab] = useState<
    "fileupload" | "dashboard" | "categories" | "tags"
  >("dashboard");
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("NotAsked");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [listedData, categories, tags] = await Promise.all([
      fetchListedCheck({ baseUrl: ctx?.baseUrl, apiKey: ctx?.apiKey }),
      fetchCategories({ baseUrl: ctx?.baseUrl, apiKey: ctx?.apiKey }),
      fetchTags({ baseUrl: ctx?.baseUrl, apiKey: ctx?.apiKey }),
    ]);

    setListed(listedData);
    setCategories(categories);
    setTags(tags);
  };

  return (
    <div>
      <div className="m-3">
        <div className="d-flex align-items-center">
          <h1>GPServer Admin</h1>

          <div className="mx-1">
            <button
              className="btn btn-success"
              onClick={async () => {
                try {
                  const resp = await fetch(
                    `${ctx?.baseUrl}/refresh-thumbnail`,
                    { headers: { authorization: ctx?.apiKey ?? "" } }
                  );

                  if (resp.status !== 200) throw await resp.text();

                  alert("Refresh thumbnail success.");
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              <i className="bi bi-arrow-clockwise"></i> Refresh Thumbnail
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
                  <div className="mx-1">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={async () => {
                        try {
                          const resp = await fetch(
                            `${ctx?.baseUrl}/listedfiles-save`,
                            {
                              method: "post",
                              headers: {
                                authorization: ctx?.apiKey ?? "",
                                "content-type": "application/json",
                              },
                              body: JSON.stringify(listed),
                            }
                          );

                          if (resp.status !== 201) throw await resp.text();

                          alert("Dashboard save successful");

                          window.location.reload();
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                    >
                      <i className="bi bi-save2"></i> Save
                    </button>
                  </div>
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
                            <div className="d-flex align-items-center">
                              <div>
                                Listed (
                                {
                                  listed.filter((file) => file.listedFile)
                                    .length
                                }
                                /{listed.length})
                              </div>
                              <div className="mx-2">
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => {
                                    setListed(
                                      listed.map((file) =>
                                        file.listedFile
                                          ? file
                                          : {
                                              ...file,
                                              listedFile: {
                                                ...initialListedFile,
                                                name: file.path,
                                              },
                                            }
                                      )
                                    );
                                  }}
                                >
                                  List All
                                </button>
                              </div>
                            </div>
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
                              <td>
                                {file.listedFile && file.listedFile.id !== 0 ? (
                                  <>
                                    <a
                                      href={`${ctx?.baseUrl}/media/${file.listedFile.id}`}
                                      target="_blank"
                                      style={{ textDecoration: "none" }}
                                    >
                                      {file.path}
                                    </a>
                                  </>
                                ) : (
                                  <>{file.path}</>
                                )}
                              </td>
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
                              <td>
                                {file.listedFile ? (
                                  <>
                                    {" "}
                                    <select
                                      onInput={(e) => {
                                        const categoryIdStr = (e.target as any)
                                          ?.value;
                                        const foundCategory = categories.find(
                                          (category) =>
                                            `${category.id}` === categoryIdStr
                                        );

                                        setListed(
                                          listed.map((fileX, ix) =>
                                            ix === i
                                              ? {
                                                  ...fileX,
                                                  listedFile: fileX.listedFile
                                                    ? {
                                                        ...fileX.listedFile,
                                                        categoryId:
                                                          foundCategory?.id ??
                                                          null,
                                                      }
                                                    : fileX.listedFile,
                                                }
                                              : fileX
                                          )
                                        );
                                      }}
                                    >
                                      <option selected>
                                        {file.listedFile.categoryId &&
                                        file.listedFile.categoryId !== 0
                                          ? categories.find(
                                              (category) =>
                                                category.id ===
                                                file.listedFile?.categoryId
                                            )?.name
                                          : ""}
                                      </option>
                                      {categories.map((category) => (
                                        <option value={`${category.id}`}>
                                          {category.name}
                                        </option>
                                      ))}
                                    </select>{" "}
                                  </>
                                ) : (
                                  <></>
                                )}
                              </td>
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
                  <div className="d-flex align-items-center">
                    <h5>Categories</h5>
                    <div className="mx-2">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={async () => {
                          try {
                            const resp = await fetch(
                              `${ctx?.baseUrl}/categories-save-batch`,
                              {
                                method: "post",
                                headers: {
                                  authorization: ctx?.apiKey ?? "",
                                  "content-type": "application/json",
                                },
                                body: JSON.stringify(categories),
                              }
                            );

                            if (resp.status !== 201) throw await resp.text();

                            window.location.reload();
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                      >
                        {" "}
                        <i className="bi bi-save2"></i> Save
                      </button>
                    </div>
                    <div className="mx-2">
                      <button
                        onClick={() => {
                          setCategories([
                            ...categories,
                            { ...initialCategory, name: "New Category" },
                          ]);
                        }}
                        className="btn btn-sm btn-outline-primary"
                      >
                        {" "}
                        <i className="bi bi-plus"></i> Add
                      </button>
                    </div>
                  </div>

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
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((category, i) => {
                            return (
                              <tr>
                                <td>{i + 1}</td>
                                <td>
                                  <input
                                    className="form-control"
                                    value={category.name ?? ""}
                                    onChange={(e) => {
                                      setCategories(
                                        categories.map((categoryX, ix) =>
                                          ix === i
                                            ? {
                                                ...categoryX,
                                                name: e.target.value,
                                              }
                                            : categoryX
                                        )
                                      );
                                    }}
                                    placeholder="Name..."
                                  />
                                </td>
                                <td>
                                  {
                                    listed.filter(
                                      (file) =>
                                        file.listedFile?.categoryId ===
                                          category.id &&
                                        file.listedFile?.categoryId !== 0
                                    )?.length
                                  }
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
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
