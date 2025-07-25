import Link from "next/link"

export default function Dashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ElevateHire AI Dashboard</h1>
        <p className="text-gray-600 mt-2">Intelligent interview analysis and candidate evaluation</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Link href="/interviews/upload" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border">
            <div className="text-blue-600 mb-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload Interview</h3>
            <p className="text-gray-600 text-sm">Upload and analyze new interview recordings</p>
          </div>
        </Link>

        <Link href="/interviews/schedule" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border">
            <div className="text-green-600 mb-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Schedule Interview</h3>
            <p className="text-gray-600 text-sm">Schedule new candidate interviews</p>
          </div>
        </Link>

        <Link href="/analysis/insights" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border">
            <div className="text-purple-600 mb-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
            <p className="text-gray-600 text-sm">View AI-generated candidate insights</p>
          </div>
        </Link>

        <Link href="/candidates" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border">
            <div className="text-orange-600 mb-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Candidates</h3>
            <p className="text-gray-600 text-sm">Manage candidate profiles and data</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Interviews</h2>
            <p className="text-gray-600">Latest interview analysis results</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: "John Doe", position: "Software Engineer", time: "2 hours ago", score: "8.5/10" },
                { name: "Sarah Wilson", position: "Product Manager", time: "5 hours ago", score: "9.2/10" },
                { name: "Mike Johnson", position: "Data Scientist", time: "1 day ago", score: "7.8/10" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{item.name} - {item.position}</p>
                    <p className="text-sm text-gray-600">Analyzed {item.time} • Score: {item.score}</p>
                  </div>
                  <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
                    View Report
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Performance Metrics</h2>
            <p className="text-gray-600">AI analysis performance overview</p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Interviews Processed</span>
                <span className="text-2xl font-bold text-blue-600">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Score</span>
                <span className="text-2xl font-bold text-green-600">8.2/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Time Saved</span>
                <span className="text-2xl font-bold text-purple-600">12 hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Success Rate</span>
                <span className="text-2xl font-bold text-orange-600">94%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
