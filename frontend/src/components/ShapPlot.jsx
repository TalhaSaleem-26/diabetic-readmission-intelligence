import React from 'react';


const DEMO_DATA = [
  { feature: 'Prior inpatient stays', impact: 0.18 },
  { feature: 'Days in hospital', impact: 0.12 },
  { feature: 'Medications given', impact: 0.09 },
  { feature: 'HbA1c above 8%', impact: 0.07 },
  { feature: 'Discharged to home', impact: -0.11 },
  { feature: 'Insulin dose change', impact: -0.04 },
];

const fmt = (n) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(2)}`;

export const ShapPlot = ({ shapValues, maxItems = 8, demo = false }) => {
  const hasReal = Array.isArray(shapValues) && shapValues.length > 0;
  const source = hasReal ? shapValues : demo ? DEMO_DATA : [];
  const isDemo = !hasReal && demo;

  const rows = [...source]
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, maxItems);

  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.impact)), 0.0001);
  const topUp = rows.find((r) => r.impact > 0);
  const topDown = rows.find((r) => r.impact < 0);

  return (
    <section className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">What shaped this result</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            The factors that pushed this patient's score up or down the most.
          </p>
        </div>
        {isDemo && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
            Example data
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">No explanation available</p>
          <p className="mt-1 text-sm text-slate-500">
            Calculate a risk score first. The breakdown appears here once the server returns it.
          </p>
        </div>
      ) : (
        <div className="px-6 py-5">
          {/* Axis labels */}
          <div className="mb-2 grid grid-cols-[9.5rem_1fr_3rem] items-end gap-3 text-xs text-slate-500 sm:grid-cols-[11rem_1fr_3rem]">
            <span />
            <div className="flex justify-between">
              <span>← Lowers risk</span>
              <span>Raises risk →</span>
            </div>
            <span />
          </div>

          <ul className="space-y-1.5">
            {rows.map((r) => {
              const up = r.impact > 0;
              const width = (Math.abs(r.impact) / maxAbs) * 50;
              return (
                <li
                  key={r.feature}
                  className="grid grid-cols-[9.5rem_1fr_3rem] items-center gap-3 sm:grid-cols-[11rem_1fr_3rem]"
                >
                  <span title={r.feature} className="truncate text-right text-sm text-slate-700">
                    {r.feature}
                  </span>

                  <div
                    className="relative h-7"
                    role="img"
                    aria-label={`${r.feature}: ${up ? 'raises' : 'lowers'} risk by ${Math.abs(r.impact).toFixed(2)}`}
                  >
                    <div className="absolute inset-y-0 left-1/2 w-px bg-slate-300" />
                    <div
                      className={`absolute inset-y-1 ${
                        up ? 'left-1/2 rounded-r-md bg-rose-500' : 'right-1/2 rounded-l-md bg-teal-600'
                      }`}
                      style={{ width: `${width}%` }}
                    />
                  </div>

                  <span
                    className={`text-right text-sm font-semibold tabular-nums ${
                      up ? 'text-rose-700' : 'text-teal-700'
                    }`}
                  >
                    {fmt(r.impact)}
                  </span>
                </li>
              );
            })}
          </ul>

          {(topUp || topDown) && (
            <p className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
              {topUp && (
                <>
                  <span className="font-medium text-slate-800">{topUp.feature}</span> raised the score the most.
                </>
              )}{' '}
              {topDown && (
                <>
                  <span className="font-medium text-slate-800">{topDown.feature}</span> lowered it the most.
                </>
              )}
            </p>
          )}
        </div>
      )}

      <div className="border-t border-slate-200 bg-slate-50 px-6 py-3">
        <p className="text-xs leading-relaxed text-slate-500">
          Values are SHAP contributions on the model's internal scale. They show direction and relative
          size, not a change in percentage chance. They describe the model, not medical cause and effect.
        </p>
      </div>
    </section>
  );
};