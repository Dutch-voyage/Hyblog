import authors from "@/data/authors.json";

export interface AuthorLink {
  label: string;
  href: string;
}

export interface AuthorProfile {
  id: string;
  name: string;
  role: string;
  bio: string;
  links: AuthorLink[];
}

export const authorProfiles = authors as AuthorProfile[];

export function getAuthorProfile(id: string) {
  return authorProfiles.find((author) => author.id === id);
}

export function getAuthorName(id: string) {
  return getAuthorProfile(id)?.name ?? id;
}
