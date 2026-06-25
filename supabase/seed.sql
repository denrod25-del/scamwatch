-- seed.sql — reference data for local dev. No PII.

-- Official organizations for verification handoffs (Principle 7).
insert into public.official_orgs (name, jurisdiction, url, channels) values
  ('FTC — ReportFraud',            'US',      'https://reportfraud.ftc.gov',                 array['web']),
  ('FBI IC3',                      'US',      'https://www.ic3.gov',                          array['web']),
  ('CFPB',                         'US',      'https://www.consumerfinance.gov/complaint/',   array['web','phone']),
  ('Florida Attorney General',     'US-FL',   'https://www.myfloridalegal.com',               array['web','phone']),
  ('IRS Impersonation (TIGTA)',    'US',      'https://www.tigta.gov',                        array['web']),
  ('SSA Office of the Inspector General','US','https://oig.ssa.gov',                          array['web']),
  ('FCC Consumer Complaints',      'US',      'https://consumercomplaints.fcc.gov',           array['web'])
on conflict do nothing;

-- Sample threats from the taxonomy (Vol 0 / Vol 8). Educational summaries only.
insert into public.threats (slug, category, title, summary) values
  ('toll-road-smishing', 'smishing',
   'Unpaid toll text scam',
   'A text claims you owe a small unpaid toll and links to a look-alike payment site to steal card details. Real toll agencies do not collect this way by text link.'),
  ('pig-butchering', 'investment',
   'Pig-butchering investment scam',
   'A long-term relationship (often via a “wrong number” text) builds trust, then steers you to a fake crypto or trading platform that shows fake gains and blocks withdrawals.'),
  ('grandparent-scam', 'impersonation',
   'Grandparent / family emergency scam',
   'A caller pretends to be a relative in trouble (arrest, accident) and pressures you to send money or gift cards immediately and secretly.'),
  ('tech-support', 'tech-support',
   'Tech-support scam',
   'A pop-up or call claims your device is infected and asks for remote access or payment to “fix” a problem that does not exist.'),
  ('romance', 'romance',
   'Romance scam',
   'An online romantic interest you never meet in person gradually asks for money for emergencies, travel, or investments.'),
  ('fake-invoice-bec', 'bec',
   'Fake invoice / business email compromise',
   'A spoofed or compromised email sends a fraudulent invoice or changes payment instructions to divert a legitimate payment.')
on conflict (slug) do nothing;
