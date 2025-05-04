import { useState } from "react";
import axios from "axios";
import loader from "./assets/loader.png";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [commitData, setCommitData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reposPerPage = 5;

  const searchProfile = async () => {
    setLoading(true);
    try {
      const userRes = await axios.get(`https://api.github.com/users/${search}`);
      const repoRes = await axios.get(
        `https://api.github.com/users/${search}/repos?per_page=100`
      );
      setUser(userRes.data);
      setRepos(repoRes.data);
      setCurrentPage(1);
      setSearch("");

      const allCommits: string[] = [];

      for (let repo of repoRes.data) {
        try {
          const commitsRes = await axios.get(
            `https://api.github.com/repos/${search}/${repo.name}/commits?per_page=20`
          );
          for (let commit of commitsRes.data) {
            const date = commit.commit.author.date.slice(0, 10); // YYYY-MM-DD
            allCommits.push(date);
          }
        } catch (err) {
          console.warn(`Could not fetch commits for repo: ${repo.name}`);
        }
      }

      const countMap: Record<string, number> = {};
      allCommits.forEach((date) => {
        countMap[date] = (countMap[date] || 0) + 1;
      });

      const chartData = Object.entries(countMap)
        .map(([date, commits]) => ({
          date,
          commits,
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      setCommitData(chartData);
    } catch (error) {
      console.error("Error fetching GitHub data:", error);
      setUser(null);
      setRepos([]);
      setCommitData([]);
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = repos.slice(indexOfFirstRepo, indexOfLastRepo);
  const totalPages = Math.ceil(repos.length / reposPerPage);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 text-gray-800 relative">
      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <img
            src={loader}
            alt="Loading..."
            className="w-20 h-20 animate-spin"
          />
        </div>
      )}
      {/* Search Box */}
      <div className="w-full max-w-xl flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 mx-auto">
        <input
          type="text"
          placeholder="Enter GitHub username"
          className="w-full sm:w-[250px] px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={searchProfile}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition duration-200 w-full sm:w-auto"
        >
          Search
        </button>
      </div>

      {/* User Profile */}
      {user && (
        <div className="text-center mb-6">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="w-24 h-24 rounded-full mx-auto mb-2"
          />
          <h2 className="text-lg font-semibold">{user.login}</h2>
          {user.bio && <p className="text-sm text-gray-600 mt-1">{user.bio}</p>}
        </div>
      )}

      {/* Commits Chart */}
      {commitData.length > 0 && (
        <div className="w-full max-w-2xl mb-8">
          <h3 className="text-lg font-semibold mb-2 text-center">
            Daily Commits Chart
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={commitData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="commits"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Repositories List with Pagination */}
      {repos.length > 0 && (
        <div className="w-full max-w-2xl space-y-4">
          {currentRepos.map((repo) => (
            <div
              key={repo.id}
              className="border border-gray-200 rounded-md p-4"
            >
              <h3 className="font-semibold text-base">{repo.name}</h3>
              <h3 className="text-sm text-gray-500">
                Last updated: {repo.updated_at}
              </h3>
              <p className="text-sm text-gray-600">
                {repo.description || "No description"}
              </p>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm mt-2 inline-block"
              >
                View Repository
              </a>
            </div>
          ))}

          {/* Pagination Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
