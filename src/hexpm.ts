import axios from 'axios';

const BASE_URL = 'https://hex.pm/api';

export function getPackage(name: String): Promise<HexPackage> {
  const url = `${BASE_URL}/packages/${name}`;
  return axios.get(url).then((res) => res.data);
}

export type HexPackage = {
  configs: Record<string, string>;
  docs_html_url: string;
  downloads: {
    all: number;
    day: number;
    recent: number;
    week: number;
  };
  html_url: string;
  inserted_at: string;
  latest_stable_version: string;
  latest_version: string;
  meta: Record<string, unknown>;
  name: string;
  owners: HexAuthor[];
  releases: HexRelease[];
  repository: string;
  retirements: HexRetirements;
  updated_at: string;
  url: string;
};

export type HexAuthor = {
  email: string;
  url: string;
  username: string;
};

export type HexRelease = {
  has_docs: boolean;
  inserted_at: string;
  url: string;
  version: string;
};

export type HexRetirement = {
  message: string;
  reason: string;
};

export type HexRetirements = Record<string, HexRetirement>;
