import { useState } from "react";
import axios from "axios";

function App() {
  const [search, setSearch] = useState<string>("");
  function searchProfile() {
    axios
      .get(`https://api.github.com/users/${search}/repos`)
      .then((response) => {
        console.log(response.data);
      });
  }
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex items-start justify-center p-6">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md mt-10">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            GitHub Account Search
          </h1>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search your GitHub account"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition duration-300"
              onClick={searchProfile}
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
