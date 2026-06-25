import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Academy',
  description: 'Learn how common scams work so they’re easier to spot.',
};

export default function AcademyPage(): React.JSX.Element {
  return (
    <article className="mx-auto max-w-prose px-4 py-10 font-serif">
      <h1 className="font-sans text-3xl font-bold">ScamWatch Academy</h1>
      <p className="mt-4 text-lg leading-relaxed text-text">
        Understanding comes before warning. The Academy explains the mechanics of common scams — why
        they work, what the pressure tactics look like, and how to verify safely — in plain,
        non-alarmist language.
      </p>
      <p className="mt-4 leading-relaxed text-text-muted">
        Free, always. Education is part of the protective core (Principle 4). Lessons and threat
        explainers are authored per Vol 5 FR-5.11 and Vol 16.
      </p>
    </article>
  );
}
