import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { APPLICATION_STAGE } from "@/shared/constants/enums";

export default function DashboardJobsTable({ jobs }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500 font-sans">
        No jobs available
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden font-sans">
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <h3
          className="text-lg font-bold text-dark-amethyst-950"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Active Jobs Overview
        </h3>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider">
              Job Title
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider text-center">
              Applicants
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider text-center">
              Tested
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider text-center">
              Interview
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider text-center">
              Waiting Action
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider text-center">
              Shortlisted
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wider text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-medium text-sm text-dark-amethyst-950">
                  {job.job_title}
                </p>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{job.company}</td>
              <td className="px-6 py-4 text-sm font-medium text-center text-dark-amethyst-600">
                {job.applicants_count}
              </td>
              <td className="px-6 py-4 text-sm text-center text-gray-600">
                {job.tested_count}
              </td>
              <td className="px-6 py-4 text-sm text-center text-gray-600">
                {job.interview_count}
              </td>
              <td className="px-6 py-4 text-sm text-center text-gray-600">
                {job.waiting_action_count}
              </td>
              <td className="px-6 py-4 text-sm text-center text-gray-600">
                {job.shortlisted_count}
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  to={`/companies/shortlists/${job.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-mauve-magic-600 bg-mauve-magic-50 hover:bg-mauve-magic-100 rounded-lg transition-colors"
                >
                  View ShortList <ChevronRight className="w-3 h-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
