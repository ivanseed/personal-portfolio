/** All page copy lives here. Edit this file to update the site. */

interface BaseLink {
  label: string;
  /** Short text shown next to the label, e.g. a handle or address. */
  detail: string;
}

/** Opens a URL in a new tab. */
export interface UrlLink extends BaseLink {
  href: string;
}

/** Copies text to the clipboard instead of navigating. */
export interface CopyLink extends BaseLink {
  copy: string;
}

export type ProfileLink = UrlLink | CopyLink;

const links: ProfileLink[] = [
  { label: 'LinkedIn', detail: 'in/iseed', href: 'https://www.linkedin.com/in/iseed/' },
  { label: 'GitHub', detail: '@ivanseed', href: 'https://github.com/ivanseed' },
  { label: 'Email', detail: 'hello@ivanseed.co.uk', copy: 'hello@ivanseed.co.uk' },
];

export const profile = {
  name: 'Ivan Seed',
  role: 'Senior Technical Account Manager',
  company: 'AWS',
  bio: 'I help AWS customers design, run and optimise their workloads in the cloud.',
  links,
};
