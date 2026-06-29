import { useState } from "react";

function SearchBar({ onSearch }) {
  const [search, setSearch] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (onSearch) {
      onSearch(search);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="d-flex mb-4"
    >
      <input
        type="text"
        className="form-control me-2"
        placeholder="Search books by title or author..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button
        type="submit"
        className="btn btn-primary"
      >
        Search
      </button>
    </form>
  );
}

export default SearchBar;