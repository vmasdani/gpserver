const UserPage = () => {
  return (
    <div>
      <div className="d-flex align-items-center flex-wrap">
        <div>
          <h1>GPServer</h1>
        </div>

        <div className="mx-2">
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
      <div>Popular tags:</div>
    </div>
  );
};

export default UserPage;
