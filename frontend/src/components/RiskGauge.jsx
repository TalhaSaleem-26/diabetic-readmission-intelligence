import React from 'react';

/*
  Shows the model output as a percentage, with a semicircle gauge and the
  decision threshold marked on it. Note: because the model is trained with
  scale_pos_weight, the percentage is a model score, not a calibrated chance.
*/

const clamp01 = (n) => Math.min(1, Math.max(0, Number(n) || 0));

// Point on the semicircle (centre 100,100, radius r) for a 0-1 position from left to right.
const pointAt = (t, r) => {
  const a = Math.PI * t;
  return { x: 100 - r * Math.cos(a), y: 100 - r * Math.sin(a) };
};

const ARC = 'M 20 100 A 80 80 0 0 1 180 100';

export const RiskGauge = ({ probability, isHighRisk, threshold }) => {
  const p = clamp01(probability);
  const t = threshold == null ? null : clamp01(threshold);
  const percentage = (p * 100).toFixed(1);

  const tone = isHighRisk
    ? { text: 'text-rose-700', stroke: '#e11d48', badge: 'bg-rose-50 text-rose-800 ring-rose-200', label: 'High risk of readmission within 30 days' }
    : { text: 'text-teal-700', stroke: '#0f766e', badge: 'bg-teal-50 text-teal-800 ring-teal-200', label: 'Lower risk of readmission within 30 days' };

  const tickIn = t === null ? null : pointAt(t, 70);
  const tickOut = t === null ? null : pointAt(t, 92);
  const tickLabel = t === null ? null : pointAt(t, 106);

  const diff = t === null ? null : ((p - t) * 100).toFixed(1);

  return (
    <section
      aria-live="polite"
      className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-900">Readmission risk score</h3>
      </div>

      <div className="px-6 pb-6 pt-5">
        {/* Gauge */}
        <div className="relative mx-auto w-full max-w-[16rem]">
          <svg
            viewBox="0 0 200 128"
            className="w-full"
            role="img"
            aria-label={`Risk score ${percentage} percent${t !== null ? `, threshold ${(t * 100).toFixed(0)} percent` : ''}`}
          >
            <path d={ARC} fill="none" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" pathLength="100" />
            <path
              d={ARC}
              fill="none"
              stroke={tone.stroke}
              strokeWidth="14"
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray={`${Math.max(p * 100, 0.6)} 100`}
              className="motion-safe:transition-[stroke-dasharray] motion-safe:duration-700"
            />
            {t !== null && (
              <>
                <line x1={tickIn.x} y1={tickIn.y} x2={tickOut.x} y2={tickOut.y} stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                <text x={tickLabel.x} y={tickLabel.y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#475569">
                  {(t * 100).toFixed(0)}
                </text>
              </>
            )}
          </svg>

          <div className="absolute inset-x-0 bottom-1 text-center">
            <div className={`text-5xl font-semibold tabular-nums tracking-tight ${tone.text}`}>
              {percentage}
              <span className="text-2xl font-medium">%</span>
            </div>
          </div>
        </div>

        {/* Verdict */}
        <div className="mt-4 flex justify-center">
          <span className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ring-inset ${tone.badge}`}>
            {tone.label}
          </span>
        </div>

        {/* Threshold */}
        {t !== null && (
          <dl className="mt-5 grid grid-cols-2 divide-x divide-slate-200 rounded-lg bg-slate-50 py-3 text-center">
            <div>
              <dt className="text-xs text-slate-500">Decision threshold</dt>
              <dd className="mt-0.5 text-base font-semibold text-slate-900">{(t * 100).toFixed(1)}%</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{Number(diff) >= 0 ? 'Above threshold by' : 'Below threshold by'}</dt>
              <dd className={`mt-0.5 text-base font-semibold ${Number(diff) >= 0 ? 'text-rose-700' : 'text-teal-700'}`}>
                {Math.abs(Number(diff)).toFixed(1)} pts
              </dd>
            </div>
          </dl>
        )}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-6 py-3">
        <p className="text-xs leading-relaxed text-slate-500">
          This is a model score, not an exact chance of readmission. A patient is flagged when the score
          crosses the threshold. Demo model, not for clinical decisions.
        </p>
      </div>
    </section>
  );
};