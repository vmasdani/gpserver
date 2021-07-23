import { useContext, useEffect, useState } from "react";
import { couldStartTrivia } from "typescript";
import { AppContext } from "./AppContext";
import { fetchCategories } from "./helpers";
import { Category, PagedInfo } from "./model";

const UserPage = () => {
  const ctx = useContext(AppContext);

  const [content, setContent] = useState<PagedInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filter & controls
  const [filter, setFilter] = useState({
    searchBy: "category" as "category" | "tags",
    mediaType: "video" as "video" | "image",
    page: 1,
  });
  useEffect(() => {
    fetchAdditionalData();
    fetchData();
  }, [filter]);

  const fetchAdditionalData = async () => {
    const [categories] = await Promise.all([
      fetchCategories({
        baseUrl: ctx?.baseUrl ?? "",
        apiKey: ctx?.apiKey ?? "",
      }),
    ]);

    setCategories(categories);
  };

  const PageControl = () => {
    return (
      <div className="d-flex">
        <div>
          Showing page {filter.page} of {content?.last}
        </div>
        <div className="mx-1">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              setFilter({ ...filter, page: filter.page - 1 });
            }}
          >
            Prev
          </button>
        </div>
        <div className="mx-1">
          <button
            onClick={() => {
              setFilter({ ...filter, page: filter.page + 1 });
            }}
            className="btn btn-sm btn-primary"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const fetchData = async () => {
    try {
      const resp = await fetch(
        `${ctx?.baseUrl}/listedfiles-paged?page=${filter.page}&type=${filter.mediaType}`,
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
              if (filter.searchBy === "category") {
                setFilter({ ...filter, searchBy: "tags", page: 1 });
              } else if (filter.searchBy === "tags") {
                setFilter({ ...filter, searchBy: "category", page: 1 });
              }
            }}
          >
            <input
              checked={filter.searchBy === "tags"}
              className="form-check-input"
              type="checkbox"
              id="flexSwitchCheckDefault"
            />
          </div>
          <div>Tags</div>
        </div>
      </div>

      <div className="d-flex align-items-center">
        <div>
          <strong>Video/Image</strong>
        </div>
        <div className="d-flex mx-3">
          <div>Video</div>
          <div
            className="mx-2 form-check form-switch"
            onClick={() => {
              if (filter.mediaType === "image") {
                setFilter({ ...filter, mediaType: "video", page: 1 });
              } else if (filter.mediaType === "video") {
                setFilter({ ...filter, mediaType: "image", page: 1 });
              }
            }}
          >
            <input
              checked={filter.mediaType === "image"}
              className="form-check-input"
              type="checkbox"
              id="flexSwitchCheckDefault"
            />
          </div>
          <div>Image</div>
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
          <PageControl />

          <div className="d-flex flex-wrap my-3">
            {content.content?.map((file) => {
              return (
                <a
                  href={`${ctx?.baseUrl}/media/${file.listedFile?.id}`}
                  target="_blank"
                  style={{ textDecoration: "none", color: "black" }}
                >
                  <div
                    className="d-flex justify-content-center align-items-center flex-column m-2 border border-dark rounded p-1 shadow bg-light"
                    style={{ width: 300, cursor: "pointer" }}
                  >
                    <div className="d-flex justify-content-center text-center">
                      {file.previewBase64 && file.previewBase64 !== "====" ? (
                        <img
                          style={{ maxWidth: 250 }}
                          src={`data:image/png;base64, ${file.previewBase64}`}
                        />
                      ) : (
                        <strong>No preview</strong>
                      )}
                    </div>
                    <div style={{ width: 250, wordWrap: "break-word" }}>
                      {file.listedFile?.name}  
                      {/* (
                      {((file.size ?? 0) / 1024 / 1024).toFixed(2)} MB) */}
                    </div>
                    <div className={`bg-dark text-white px-2 rounded`}>
                      {categories.find(
                        (c) => c.id === file.listedFile?.categoryId
                      )?.name ?? "No category"}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          <PageControl />
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default UserPage;
