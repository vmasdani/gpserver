import { useContext, useEffect, useState } from "react";
import { couldStartTrivia } from "typescript";
import { AppContext } from "./AppContext";
import { fetchCategories } from "./helpers";
import { Category, PagedInfo } from "./model";

const UserPage = () => {
  const ctx = useContext(AppContext);

  const [searchBy, setSearchBy] = useState<"category" | "tags">("category");
  const [content, setContent] = useState<PagedInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAdditionalData();

    fetchData();
  }, [page]);

  const fetchAdditionalData = async () => {
    const [categories] = await Promise.all([
      fetchCategories({
        baseUrl: ctx?.baseUrl ?? "",
        apiKey: ctx?.apiKey ?? "",
      }),
    ]);

    setCategories(categories);
  };

  const fetchData = async () => {
    try {
      const resp = await fetch(
        `${ctx?.baseUrl}/listedfiles-paged?page=${page}&type=video`,
        {
          headers: { authorization: ctx?.apiKey ?? "" },
        }
      );

      if (resp.status !== 200) throw await resp.text();

      setContent(await resp.json());
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div>
      <div className="d-flex align-items-center flex-wrap">
        <div>
          <h1>GPServer</h1>
        </div>
      </div>

      <hr />

      <div className="d-flex align-items-center">
        <div>
          <strong>Search by</strong>
        </div>
        <div className="d-flex mx-3">
          <div>Category</div>
          <div
            className="mx-2 form-check form-switch"
            onClick={() => {
              if (searchBy === "category") {
                setSearchBy("tags");
              } else if (searchBy === "tags") {
                setSearchBy("category");
              }
            }}
          >
            <input
              checked={searchBy === "tags"}
              className="form-check-input"
              type="checkbox"
              id="flexSwitchCheckDefault"
            />
          </div>
          <div>Tags</div>
        </div>
      </div>

      <div className="d-flex flex-wrap align-items-center my-2">
        <div>
          Search {Intl.NumberFormat().format(Math.round(Math.random() * 10000))}{" "}
          records
        </div>

        <div className="mx-2">
          <button className="btn btn-outline-primary">
            <i className="bi bi-search"></i>
          </button>
        </div>

        <div className="mx-2 flex-grow-1">
          <input
            className="form-control"
            placeholder="Search by tag (use _ for space e.g. action_adventure or foo_bar)..."
          />
        </div>
      </div>

      <hr />

      {content ? (
        <>
          <div className="d-flex">
            <div>
              Showing page {page} of {content.last}
            </div>
            <div className="mx-1">
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  setPage(page - 1);
                }}
              >
                Prev
              </button>
            </div>
            <div className="mx-1">
              <button
                onClick={() => {
                  setPage(page + 1);
                }}
                className="btn btn-sm btn-primary"
              >
                Next
              </button>
            </div>
          </div>

          <div className="d-flex flex-wrap my-3">
            {content.content?.map((file) => {
              return (
                <div
                  className="d-flex justify-content-center align-items-center flex-column m-2 border border-dark rounded p-1 shadow bg-light"
                  style={{ width: 300 }}
                >
                  <div className="d-flex justify-content-center text-center">
                    {file.previewBase64 && file.previewBase64 !== "====" ? (
                      <img
                        src={`data:image/png;base64, ${file.previewBase64}`}
                      />
                    ) : (
                      <strong>No preview</strong>
                    )}
                  </div>
                  <div style={{width: 250, wordWrap: "break-word"}}>{file.listedFile?.name}</div>
                  <div className={`bg-dark text-white px-2 rounded`}>
                    {categories.find(
                      (c) => c.id === file.listedFile?.categoryId
                    )?.name ?? "No category"}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default UserPage;
