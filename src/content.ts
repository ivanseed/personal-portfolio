/** All page copy lives here. Edit this file to update the site. */

export interface ProfileLink {
  label: string;
  /** Short text shown next to the label, e.g. a handle or address. */
  detail: string;
  href: string;
}

export const profile = {
  name: 'Ivan Seed',
  role: 'Senior Technical Account Manager',
  company: 'AWS',
  bio: 'I help AWS customers design, run and optimise their workloads in the cloud.',
  links: [
    { label: 'LinkedIn', detail: 'in/iseed', href: 'https://www.linkedin.com/in/iseed/' },
    { label: 'GitHub', detail: '@ivanseed', href: 'https://github.com/ivanseed' },
    { label: 'Email', detail: 'hello@ivanseed.co.uk', href: 'mailto:hello@ivanseed.co.uk' },
  ] satisfies ProfileLink[],
};
