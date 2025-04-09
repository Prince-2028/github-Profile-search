import { useState } from "react";
import axios from "axios";
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

  const searchProfile = async () => {
    try {
      const userRes = await axios.get(`https://api.github.com/users/${search}`);
      const repoRes = await axios.get(`https://api.github.com/users/${search}/repos?per_page=100`);
      setUser(userRes.data);
      setRepos(repoRes.data);
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
      allCommits.forEach(date => {
        countMap[date] = (countMap[date] || 0) + 1;
      });

      const chartData = Object.entries(countMap).map(([date, commits]) => ({
        date,
        commits,
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setCommitData(chartData);
    } catch (error) {
      console.error("Error fetching GitHub data:", error);
      setUser(null);
      setRepos([]);
      setCommitData([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 text-gray-800">
      <div className="w-full max-w-xl flex flex-col sm:flex-row items-center gap-4 mb-8">
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

      {commitData.length > 0 && (
        <div className="w-full max-w-2xl mb-8">
          <h3 className="text-lg font-semibold mb-2 text-center">Daily Commits Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={commitData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="commits" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="w-full max-w-2xl space-y-4">
        {repos.map((repo) => (
          <div key={repo.id} className="border border-gray-200 rounded-md p-4">
            <h3 className="font-semibold text-base">{repo.name}</h3>
            <h3 className="text-sm text-gray-500">Last updated: {repo.updated_at}</h3>
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
      </div>
    </div>
  );
}

export default App;
