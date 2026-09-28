import React, { useEffect, useRef, useState } from 'react';


const RACES = ['Caucasian', 'AfricanAmerican', 'Hispanic', 'Asian', 'Other'];
const GENDERS = ['Female', 'Male'];
const AGES = ['[0-10)', '[10-20)', '[20-30)', '[30-40)', '[40-50)', '[50-60)', '[60-70)', '[70-80)', '[80-90)', '[90-100)'];

const SPECIALTIES = [
  { label: 'Internal medicine', value: 'InternalMedicine' },
  { label: 'Cardiology', value: 'Cardiology' },
  { label: 'General surgery', value: 'Surgery-General' },
  { label: 'Family / general practice', value: 'Family/GeneralPractice' },
  { label: 'Emergency / trauma', value: 'Emergency/Trauma' },
  { label: 'Orthopedics', value: 'Orthopedics' },
  { label: 'Radiology', value: 'Radiologist' },
  { label: 'Nephrology', value: 'Nephrology' },
  { label: 'Not specified', value: 'Missing' },
];

const ADMISSION_TYPES = [
  { label: 'Emergency', value: 1 },
  { label: 'Urgent', value: 2 },
  { label: 'Elective', value: 3 },
];

const ADMISSION_SOURCES = [
  { label: 'Emergency room', value: 7 },
  { label: 'Physician referral', value: 1 },
  { label: 'Transfer from another hospital', value: 4 },
];

// Expired / hospice IDs (11, 13, 14, 19, 20, 21) are excluded on purpose: the model never saw them.
const DISCHARGES = [
  { label: 'Home', value: 1 },
  { label: 'Home with health service', value: 6 },
  { label: 'Skilled nursing facility', value: 3 },
  { label: 'Rehabilitation facility', value: 22 },
  { label: 'Transferred to another hospital', value: 2 },
  { label: 'Transferred to another inpatient unit', value: 5 },
  { label: 'Psychiatric facility', value: 28 },
  { label: 'Left against medical advice', value: 7 },
];

// Each diagnosis sends a representative ICD-9 code, so the backend category mapping keeps working.
const DIAGNOSES = [
  { label: 'Diabetes', value: '250.00' },
  { label: 'Heart and circulation', value: '414' },
  { label: 'Respiratory', value: '486' },
  { label: 'Digestive', value: '560' },
  { label: 'Kidney and urinary', value: '599' },
  { label: 'Bones and muscles', value: '715' },
  { label: 'Injury or poisoning', value: '820' },
  { label: 'Cancer', value: '197' },
  { label: 'Other', value: '780' },
  { label: 'None recorded', value: 'Missing' },
];

const A1C = [
  { label: 'Not tested', value: 'Not Tested' },
  { label: 'Normal', value: 'Norm' },
  { label: 'Above 7%', value: '>7' },
  { label: 'Above 8%', value: '>8' },
];

const GLUCOSE = [
  { label: 'Not tested', value: 'Not Tested' },
  { label: 'Normal', value: 'Norm' },
  { label: 'Above 200', value: '>200' },
  { label: 'Above 300', value: '>300' },
];

const DOSES = [
  { label: 'None', value: 'No' },
  { label: 'Steady', value: 'Steady' },
  { label: 'Up', value: 'Up' },
  { label: 'Down', value: 'Down' },
];

const KEY_MEDS = [
  ['metformin', 'Metformin'],
  ['insulin', 'Insulin'],
  ['glipizide', 'Glipizide'],
  ['glyburide', 'Glyburide'],
  ['glimepiride', 'Glimepiride'],
  ['pioglitazone', 'Pioglitazone'],
  ['rosiglitazone', 'Rosiglitazone'],
  ['repaglinide', 'Repaglinide'],
];

// Medication columns the model expects but the form has no control for. Always sent as 'No'.
const HIDDEN_MEDS = [
  'nateglinide', 'chlorpropamide', 'acetohexamide', 'tolbutamide', 'acarbose', 'miglitol',
  'troglitazone', 'tolazamide', 'glyburide-metformin', 'glipizide-metformin',
  'glimepiride-pioglitazone', 'metformin-rosiglitazone', 'metformin-pioglitazone',
];

const SECTIONS = [
  { id: 'patient', title: 'Patient', hint: 'Who they are' },
  { id: 'stay', title: 'Hospital stay', hint: 'Admission and discharge' },
  { id: 'history', title: 'History and diagnoses', hint: 'Past visits, conditions' },
  { id: 'labs', title: 'Labs and procedures', hint: 'Tests done this stay' },
  { id: 'meds', title: 'Diabetes medication', hint: 'Doses during the stay' },
];

/* ---------- Profiles ---------- */

// Neutral starting point. Every field is set, and every drug is 'No', so nothing can leak between profiles.
const BASE = {
  race: 'Caucasian',
  gender: 'Female',
  age: '[60-70)',
  medical_specialty: 'InternalMedicine',
  admission_type_id: 1,
  admission_source_id: 7,
  discharge_disposition_id: 1,
  time_in_hospital: 4,
  number_outpatient: 0,
  number_emergency: 0,
  number_inpatient: 0,
  number_diagnoses: 6,
  diag_1: '250.00',
  diag_2: 'Missing',
  diag_3: 'Missing',
  num_lab_procedures: 40,
  num_procedures: 0,
  num_medications: 12,
  A1Cresult: 'Not Tested',
  max_glu_serum: 'Not Tested',
  change: 'No',
  diabetesMed: 'No',
  ...Object.fromEntries(KEY_MEDS.map(([k]) => [k, 'No'])),
  ...Object.fromEntries(HIDDEN_MEDS.map((k) => [k, 'No'])),
};

const buildProfile = (overrides = {}) => ({ ...BASE, ...overrides });

const DEFAULTS = buildProfile({ age: '[70-80)', diabetesMed: 'Yes', insulin: 'Steady', change: 'No' });

const PRESETS = {
  low: {
    label: 'Low-risk example',
    values: buildProfile({
      age: '[50-60)', gender: 'Female', race: 'Caucasian', medical_specialty: 'Family/GeneralPractice',
      time_in_hospital: 2, admission_type_id: 3, admission_source_id: 1, discharge_disposition_id: 1,
      number_inpatient: 0, number_emergency: 0, number_outpatient: 0,
      num_medications: 6, num_lab_procedures: 25, num_procedures: 0, number_diagnoses: 3,
      diag_1: '250.00', diag_2: '414', diag_3: 'Missing',
      A1Cresult: 'Norm', max_glu_serum: 'Not Tested',
      insulin: 'No', change: 'No', diabetesMed: 'No',
    }),
  },
  high: {
    label: 'High-risk example',
    values: buildProfile({
      age: '[80-90)', gender: 'Male', race: 'Caucasian', medical_specialty: 'InternalMedicine',
      time_in_hospital: 11, admission_type_id: 1, admission_source_id: 7, discharge_disposition_id: 3,
      number_inpatient: 3, number_emergency: 2, number_outpatient: 1,
      num_medications: 26, num_lab_procedures: 78, num_procedures: 3, number_diagnoses: 12,
      diag_1: '414', diag_2: '250.00', diag_3: '486',
      A1Cresult: '>8', max_glu_serum: '>300',
      insulin: 'Up', change: 'Ch', diabetesMed: 'Yes',
    }),
  },
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickValue = (opts) => pick(opts).value;

const randomProfile = () => {
  const meds = Object.fromEntries(KEY_MEDS.map(([k]) => [k, Math.random() < 0.55 ? 'No' : pickValue(DOSES.slice(1))]));
  const anyMed = Object.values(meds).some((v) => v !== 'No');
  const anyChange = Object.values(meds).some((v) => v === 'Up' || v === 'Down');
  return buildProfile({
    age: pick(AGES.slice(3, 10)),
    gender: pick(GENDERS),
    race: pick(RACES),
    medical_specialty: pickValue(SPECIALTIES),
    time_in_hospital: rand(1, 14),
    admission_type_id: pickValue(ADMISSION_TYPES),
    admission_source_id: pickValue(ADMISSION_SOURCES),
    discharge_disposition_id: pickValue(DISCHARGES),
    number_inpatient: rand(0, 4),
    number_emergency: rand(0, 3),
    number_outpatient: rand(0, 4),
    number_diagnoses: rand(2, 14),
    diag_1: pickValue(DIAGNOSES.slice(0, 9)),
    diag_2: pickValue(DIAGNOSES),
    diag_3: pickValue(DIAGNOSES),
    num_lab_procedures: rand(10, 90),
    num_procedures: rand(0, 5),
    num_medications: rand(4, 30),
    A1Cresult: pickValue(A1C),
    max_glu_serum: pickValue(GLUCOSE),
    ...meds,
    change: anyChange ? 'Ch' : 'No',
    diabetesMed: anyMed ? 'Yes' : pick(['Yes', 'No']),
  });
};

/* ---------- UI building blocks ---------- */

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1';

const asOption = (o) => (typeof o === 'object' ? o : { label: String(o), value: o });

const Field = ({ id, label, hint, children, wide }) => (
  <div className={wide ? 'sm:col-span-2' : ''}>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-800">
      {label}
    </label>
    {children}
    {hint && (
      <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
        {hint}
      </p>
    )}
  </div>
);

const SelectField = ({ name, label, hint, options, value, onChange, wide }) => {
  const opts = options.map(asOption);
  return (
    <Field id={name} label={label} hint={hint} wide={wide}>
      <div className="relative">
        <select
          id={name}
          value={String(value)}
          aria-describedby={hint ? `${name}-hint` : undefined}
          onChange={(e) => onChange(name, opts.find((o) => String(o.value) === e.target.value).value)}
          className={`w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-9 text-sm text-slate-900 ${focusRing}`}
        >
          {opts.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
        <svg aria-hidden="true" viewBox="0 0 20 20" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Field>
  );
};

const NumberField = ({ name, label, hint, value, onChange, min = 0, max = 999 }) => {
  const set = (n) => onChange(name, Math.min(max, Math.max(min, Number.isNaN(n) ? min : n)));
  const stepBtn = `flex h-full w-11 items-center justify-center text-lg text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-white ${focusRing}`;
  return (
    <Field id={name} label={label} hint={hint}>
      <div className="flex h-11 items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white">
        <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => set(value - 1)} className={stepBtn}>
          −
        </button>
        <input
          id={name}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          aria-describedby={hint ? `${name}-hint` : undefined}
          onChange={(e) => set(parseInt(e.target.value, 10))}
          className="w-full min-w-0 border-x border-slate-200 text-center text-sm font-medium tabular-nums text-slate-900 [appearance:textfield] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-600 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => set(value + 1)} className={stepBtn}>
          +
        </button>
      </div>
    </Field>
  );
};

const Segmented = ({ name, label, options, value, onChange }) => (
  <div>
    <span id={`${name}-label`} className="mb-1.5 block text-sm font-medium text-slate-800">
      {label}
    </span>
    <div role="radiogroup" aria-labelledby={`${name}-label`} className="flex rounded-lg bg-slate-100 p-0.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(name, o.value)}
            className={`flex-1 rounded-md px-2 py-2 text-sm transition-colors ${focusRing} ${
              active ? 'bg-white font-semibold text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  </div>
);

const Grid = ({ children }) => (
  <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">{children}</div>
);



export const PatientForm = ({ onSubmit, loading = false }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(null); // label of the last loaded example, cleared on edit
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const set = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLoaded(null);
  };

  const applyProfile = (values, label) => {
    setFormData(values);
    setLoaded(label);
    setMenuOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const current = SECTIONS[step];
  const isLast = step === SECTIONS.length - 1;
  const menuItem = 'block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50';

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Readmission risk assessment</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Estimates the chance of a return to hospital within 30 days of discharge.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {loaded && (
            <span className="hidden rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800 ring-1 ring-inset ring-teal-200 sm:inline">
              {loaded}
            </span>
          )}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className={`rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 ${focusRing}`}
            >
              Load example
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 z-10 mt-1 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                {Object.values(PRESETS).map((p) => (
                  <button key={p.label} type="button" role="menuitem" onClick={() => applyProfile(p.values, p.label)} className={menuItem}>
                    {p.label}
                  </button>
                ))}
                <button type="button" role="menuitem" onClick={() => applyProfile(randomProfile(), 'Random patient')} className={menuItem}>
                  Random patient
                </button>
                <button type="button" role="menuitem" onClick={() => applyProfile(DEFAULTS, null)} className={`${menuItem} border-t border-slate-100 text-slate-500`}>
                  Reset form
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Section navigation */}
        <nav aria-label="Form sections" className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 p-2 md:w-60 md:shrink-0 md:flex-col md:border-b-0 md:border-r md:p-3">
          {SECTIONS.map((s, i) => {
            const active = i === step;
            return (
              <button
                key={s.id}
                type="button"
                aria-current={active ? 'step' : undefined}
                onClick={() => setStep(i)}
                className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-left transition-colors md:whitespace-normal ${focusRing} ${
                  active ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-slate-100'
                }`}
              >
                <span className={`block text-sm ${active ? 'font-semibold text-teal-800' : 'font-medium text-slate-700'}`}>
                  {s.title}
                </span>
                <span className="hidden text-xs text-slate-500 md:block">{s.hint}</span>
              </button>
            );
          })}
        </nav>

        {/* Fields */}
        <div className="min-h-[26rem] flex-1 px-6 py-6">
          <h3 className="text-base font-semibold text-slate-900">{current.title}</h3>
          <p className="mb-5 mt-0.5 text-sm text-slate-500">{current.hint}</p>

          {current.id === 'patient' && (
            <Grid>
              <SelectField name="age" label="Age bracket" options={AGES} value={formData.age} onChange={set} />
              <SelectField name="gender" label="Gender" options={GENDERS} value={formData.gender} onChange={set} />
              <SelectField name="race" label="Race" options={RACES} value={formData.race} onChange={set} />
              <SelectField name="medical_specialty" label="Admitting specialty" options={SPECIALTIES} value={formData.medical_specialty} onChange={set} />
            </Grid>
          )}

          {current.id === 'stay' && (
            <Grid>
              <NumberField name="time_in_hospital" label="Days in hospital" hint="Between 1 and 14" min={1} max={14} value={formData.time_in_hospital} onChange={set} />
              <SelectField name="admission_type_id" label="Admission type" options={ADMISSION_TYPES} value={formData.admission_type_id} onChange={set} />
              <SelectField name="admission_source_id" label="Admitted from" options={ADMISSION_SOURCES} value={formData.admission_source_id} onChange={set} />
              <SelectField name="discharge_disposition_id" label="Discharged to" hint="Strongly affects the estimate" options={DISCHARGES} value={formData.discharge_disposition_id} onChange={set} />
            </Grid>
          )}

          {current.id === 'history' && (
            <Grid>
              <NumberField name="number_inpatient" label="Inpatient stays" hint="In the past year" max={30} value={formData.number_inpatient} onChange={set} />
              <NumberField name="number_emergency" label="Emergency visits" hint="In the past year" max={30} value={formData.number_emergency} onChange={set} />
              <NumberField name="number_outpatient" label="Outpatient visits" hint="In the past year" max={50} value={formData.number_outpatient} onChange={set} />
              <NumberField name="number_diagnoses" label="Total diagnoses" hint="Between 1 and 16" min={1} max={16} value={formData.number_diagnoses} onChange={set} />
              <SelectField name="diag_1" label="Primary diagnosis" options={DIAGNOSES} value={formData.diag_1} onChange={set} wide />
              <SelectField name="diag_2" label="Secondary diagnosis" options={DIAGNOSES} value={formData.diag_2} onChange={set} />
              <SelectField name="diag_3" label="Tertiary diagnosis" options={DIAGNOSES} value={formData.diag_3} onChange={set} />
            </Grid>
          )}

          {current.id === 'labs' && (
            <Grid>
              <NumberField name="num_lab_procedures" label="Lab tests" min={1} max={150} value={formData.num_lab_procedures} onChange={set} />
              <NumberField name="num_procedures" label="Other procedures" max={10} value={formData.num_procedures} onChange={set} />
              <NumberField name="num_medications" label="Medications given" hint="Distinct drugs during the stay" min={1} max={80} value={formData.num_medications} onChange={set} />
              <div className="hidden sm:block" />
              <SelectField name="A1Cresult" label="HbA1c result" options={A1C} value={formData.A1Cresult} onChange={set} />
              <SelectField name="max_glu_serum" label="Glucose serum test" options={GLUCOSE} value={formData.max_glu_serum} onChange={set} />
            </Grid>
          )}

          {current.id === 'meds' && (
            <div className="space-y-6">
              <Grid>
                <Segmented name="change" label="Diabetes medication changed" options={[{ label: 'Changed', value: 'Ch' }, { label: 'No change', value: 'No' }]} value={formData.change} onChange={set} />
                <Segmented name="diabetesMed" label="Diabetes medication prescribed" options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]} value={formData.diabetesMed} onChange={set} />
              </Grid>
              <div className="border-t border-slate-100 pt-5">
                <p className="mb-4 text-sm text-slate-500">Dose change for each drug during the stay.</p>
                <Grid>
                  {KEY_MEDS.map(([name, label]) => (
                    <Segmented key={name} name={name} label={label} options={DOSES} value={formData[name]} onChange={set} />
                  ))}
                </Grid>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className={`rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:text-slate-300 disabled:hover:bg-transparent ${focusRing}`}
          >
            Back
          </button>
          {!isLast && (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className={`rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 ${focusRing}`}
            >
              Next
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-teal-400 ${focusRing}`}
        >
          {loading ? 'Calculating…' : 'Calculate risk'}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;