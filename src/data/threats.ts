export type RiskLevel = 'unknown' | 'low' | 'medium' | 'high' | 'critical';

export type DataMode = 'demo' | 'verified' | 'live';

export interface ThreatSource {
  title: string;
  organization: string;
  url: string;
  type: 'official' | 'news' | 'agency' | 'internal';
  date?: string;
}

export interface Threat {
  id: string;
  title: string;
  slug: string;
  riskLevel: RiskLevel;
  confidence: number;
  dataMode: DataMode;
  category: string;
  affectedArea: string;
  channels: string[];
  summary: string;
  lastVerifiedAt: string;
  firstSeenAt?: string;
  communityReports: number;
  officialSourceCount: number;
  verifiedSources: ThreatSource[];
  redFlags: string[];
  exampleMessages: string[];
  beforeYouClick: string[];
  ifYouClicked: string[];
  officialReportLinks: ThreatSource[];
}

export const THREATS: Threat[] = [
  {
    id: 'FL-001',
    title: 'SunPass Toll Text Scam',
    slug: 'FL-001',
    riskLevel: 'critical',
    confidence: 95,
    dataMode: 'verified',
    category: 'Toll Road Smishing',
    affectedArea: 'Florida (Statewide)',
    channels: ['text'],
    summary: 'Fraudulent SMS text messages impersonating the Florida SunPass toll agency to harvest consumer credit card details.',
    lastVerifiedAt: '2026-07-01',
    firstSeenAt: '2024-04-12',
    communityReports: 48,
    officialSourceCount: 3,
    verifiedSources: [
      {
        title: 'Unpaid Toll Text Scams Alert',
        organization: 'Federal Trade Commission (FTC)',
        url: 'https://consumer.ftc.gov/consumer-alerts/2024/04/unpaid-toll-text-scams-turn-toll-road-fees-steal-your-money',
        type: 'official',
        date: '2024-04-12',
      },
      {
        title: 'Attorney General Moody Alerts Floridians to SunPass Smishing Scam',
        organization: 'Florida Attorney General Office',
        url: 'https://myfloridalegal.com/newsrelease/attorney-general-moody-alerts-floridians-sunpass-smishing-scam',
        type: 'agency',
        date: '2024-04-15',
      },
      {
        title: 'FCC Warning on Toll Road Scams',
        organization: 'Federal Communications Commission (FCC)',
        url: 'https://www.fcc.gov/unpaid-toll-text-scams-fcc-consumer-advisory',
        type: 'official',
        date: '2024-05-20',
      }
    ],
    redFlags: [
      'Spoofed Domains: The link in the text does not end in the official sunpass.com domain.',
      'Urgent Pressure: Demanding payment within 24 hours to prevent immediate collections or license suspensions.',
      'Unrecognized Senders: Messages sent from a standard 10-digit mobile number rather than an official shortcode.'
    ],
    exampleMessages: [
      'SunPass: Urgent warning. You have an unpaid toll balance of $4.15. To avoid a $50.00 collections fee, settle your balance immediately at sunpass-billing-example[dot]com',
      'Florida Toll Services: Access to your toll account has been suspended due to outstanding balance of $3.50. Pay now at sunpass-resolve-example[dot]com to avoid late penalties.'
    ],
    beforeYouClick: [
      'Do not click links inside text messages claiming you owe toll fees.',
      'Manually type the official address sunpass.com in your browser or log in to the official SunPass mobile application.',
      'Verify outstanding fees directly within your secure account dashboard.'
    ],
    ifYouClicked: [
      'If you submitted your payment card information, call your credit card company or bank immediately to report the fraud and freeze the card.',
      'Change your SunPass login credentials and any passwords that share similarity.'
    ],
    officialReportLinks: [
      {
        title: 'Official SunPass Portal',
        organization: 'SunPass',
        url: 'https://www.sunpass.com',
        type: 'internal'
      },
      {
        title: 'File FTC Fraud Report',
        organization: 'Federal Trade Commission',
        url: 'https://reportfraud.ftc.gov',
        type: 'official'
      }
    ]
  },
  {
    id: 'FL-002',
    title: 'Duke Energy Disconnection Call',
    slug: 'FL-002',
    riskLevel: 'high',
    confidence: 91,
    dataMode: 'verified',
    category: 'Utility Impersonation',
    affectedArea: 'Florida (Service Territory)',
    channels: ['phone', 'text'],
    summary: 'Impersonation phone calls and messages threatening utility cutoff unless payment is provided via prepaid gift cards.',
    lastVerifiedAt: '2026-07-01',
    firstSeenAt: '2024-02-10',
    communityReports: 22,
    officialSourceCount: 2,
    verifiedSources: [
      {
        title: 'Duke Energy Warns Customers of Utility Scams',
        organization: 'Duke Energy',
        url: 'https://www.duke-energy.com/customer-service/scams-and-fraud',
        type: 'internal',
        date: '2024-02-10',
      },
      {
        title: 'FTC Guidance on Utility Impersonation Scams',
        organization: 'Federal Trade Commission (FTC)',
        url: 'https://consumer.ftc.gov/articles/scammers-want-you-pay-utility-bills-gift-cards',
        type: 'official',
        date: '2024-03-01',
      }
    ],
    redFlags: [
      'Demand for Prepaid Cards: Scammers demand payment using Vanilla Gift cards, GreenDot cards, or cryptocurrency.',
      'Immediate Cutoff Threats: Threatening to disconnect power within 30 minutes. Official notifications take weeks.',
      'Callback Number Instructions: Requesting you to call a specific direct phone line instead of official customer care.'
    ],
    exampleMessages: [
      'Duke Energy Urgent: Your electric service will be disconnected in 30 minutes due to unpaid bill amount. Please pay immediately by calling +1-800-555-0142.',
      'Service Termination Alert: Final notice from electric billing. Technician is dispatched. Settle balance via prepaid voucher code. Call +1-800-555-0142.'
    ],
    beforeYouClick: [
      'Hang up immediately if you receive a call threatening disconnection within minutes.',
      'Duke Energy and other Florida utilities never call demanding immediate payment via gift cards or prepaid credits.',
      'Log in directly to your official online utility dashboard at duke-energy.com to check your actual account balance.'
    ],
    ifYouClicked: [
      'If you paid or shared card details, contact local law enforcement to file a report.',
      'Report the scam callback number and transaction receipt details to the Florida Attorney General.'
    ],
    officialReportLinks: [
      {
        title: 'Official Duke Energy Portal',
        organization: 'Duke Energy',
        url: 'https://www.duke-energy.com',
        type: 'internal'
      },
      {
        title: 'Florida Attorney General Portal',
        organization: 'Florida Attorney General Office',
        url: 'https://myfloridalegal.com',
        type: 'official'
      }
    ]
  }
];

export function getRiskLabel(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'low': return 'Low Risk';
    case 'medium': return 'Medium Risk';
    case 'high': return 'High Risk';
    case 'critical': return 'Critical Risk';
    case 'unknown':
    default: return 'Unknown Risk';
  }
}

export function getRiskBadgeColor(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'low': return 'bg-safe-border/10 text-safe-border border-safe-border/30';
    case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    case 'high': return 'bg-red-500/10 text-red-500 border-red-500/30';
    case 'critical': return 'bg-red-700/10 text-red-700 border-red-700/30 font-extrabold';
    case 'unknown':
    default: return 'bg-border/10 text-text-subtle border-border/30';
  }
}

export function getRiskDescription(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'low':
      return 'No active campaigns or threat indicators matching this signature have been identified. Exercise normal vigilance.';
    case 'medium':
      return 'Potential threat indicators matching this signature have been identified, requiring cautious independent verification.';
    case 'high':
      return 'Active impersonation campaigns identified with verified warnings from utilities or official registries. Extreme caution advised.';
    case 'critical':
      return 'Widespread active campaigns targeting critical infrastructure, financial access, or state portals with severe risks of immediate loss.';
    case 'unknown':
    default:
      return 'Insufficient signal to classify risk. Treat with caution and verify independently.';
  }
}
