import { ContributorSignupForm } from './ContributorSignupForm';
import { GoodFirstIssuesList } from './GoodFirstIssuesList';

export default function ContributePage() {
  return (
    <div className="page-grid">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="section-title mb-1">Contribute</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
            Help Delhi breathe better
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            This project is deliberately kept simple so new contributors can ship real
            improvements quickly—whether that&apos;s better visualisations, new data
            sources, or analysis of how fires and weather drive Delhi&apos;s air crisis.
          </p>
        </div>
        <div className="pill">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>Public repo • MIT-licensed • Open data where possible</span>
        </div>
      </div>

      <GoodFirstIssuesList />
      <ContributorSignupForm />
    </div>
  );
}


